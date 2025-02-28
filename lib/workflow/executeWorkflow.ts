import "server-only";//this prevents server only code from being included in client side bundle
import prisma from "../prisma";
import { revalidatePath } from "next/cache";
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from "@/types/workflow";
import { waitFor } from "../helper/waitFor";
import { ExecutionPhase } from "@prisma/client";
import { AppNode } from "@/types/appNode";
import { TaskRegistry } from "./task/registry";
import { ExecutorRegistry } from "./executer/registry";
import { Environment, ExecutorEnvironment } from "@/types/executor";
import { TaskParamType } from "@/types/task";
import { Browser, Page } from "puppeteer";
import { Edge } from "@xyflow/react";
import { LogCollector } from "@/types/log";
import { createLogCollector } from "./log";
export async function ExecuteWorkflow(executionId:string,netRunAt?:Date){
  const execution=await prisma.workflowExecution.findUnique({
    where:{
        id:executionId,
    },
    include:{
        workflow:true,
        phases:true,
    },
  });
  if(!execution){
    throw new Error("Execution not found");
  }
  const edges=JSON.parse(execution.definition).edges as Edge[];
  //TODO:setup execution environment
  const environment:Environment={phases:{}}
  //TODO:initialize workflow execution
  await intializeWorkflowExecution(executionId,execution.workflowId,netRunAt)
  //todo:initialize workflow status
  await initializePhaseStatuses(execution)
  let creditsConsumed=0;
  let executionFailed=false;
  for(const phase of execution.phases){
    //TODO:creditsConsumed
    const phaseExecution=await executeWorkflowPhase(phase,environment,edges,execution.userId);
    creditsConsumed+=phaseExecution.creditsConsumed;
    if(!phaseExecution.success){
      executionFailed=true;
      break;
    }
   //TODO:execute phases
  }
  //TODO:finalize execution
  await finalizeWorkflowExecution(executionId,execution.workflowId,executionFailed,creditsConsumed)
  //TODO:cleanup environments
  await cleanupEnvironment(environment);
  revalidatePath("/workflow/runs")
}
async function intializeWorkflowExecution(executionId:string ,workflowId:string,nextRunAt?:Date){
  await prisma.workflowExecution.update({
    where:{
      id:executionId,
    },
    data:{
      startedAt:new Date(),
      status:WorkflowExecutionStatus.RUNNING,
    }
  });
  await prisma.workflow.update({
    where:{
      id:workflowId,
    },
    data:{
      lastRunAt:new Date(),
      lastRunStatus:WorkflowExecutionStatus.RUNNING,
      lastRunId:executionId,
      ...(nextRunAt && {nextRunAt}),//we include next run at only if it is defined
    }
  })

}
async function initializePhaseStatuses(execution:any){
 await prisma.executionPhase.updateMany({
  where:{
    id:{
      in:execution.phases.map((phase:any)=>phase.id),
    },
  },
  data:{
    status:ExecutionPhaseStatus.PENDING,
  },
 });
}
async function finalizeWorkflowExecution(executionId:string,workflowId:string,executionFailed:boolean,creditsConsumed:number){
   const finalStatus=executionFailed?WorkflowExecutionStatus.FAILED:WorkflowExecutionStatus.COMPLETED;
   await prisma.workflowExecution.update({
    where:{id:executionId},
    data:{
      status:finalStatus,
      completedAt:new Date(),
      creditsConsumed,
    }
   })
   await prisma.workflow.update({
    where:{
      id:workflowId,
      lastRunId:executionId,
    },
    data:{
      lastRunStatus:finalStatus,
    }
   }).catch((err)=>{
    //ignore we donot want error to propagate to other functions
    //this means we have triggered other runs for this workflow while an execution was running
   })
}
async function executeWorkflowPhase(phase:ExecutionPhase,environment:Environment,edges:Edge[],userId:string){
  const startedAt=new Date();
  const LogCollector=createLogCollector();
  const node=JSON.parse(phase.node) as AppNode;
  setUpEnvironmentForPhase(node,environment,edges);
  //update phase status
  await prisma.executionPhase.update({
    where:{
      id:phase.id,
    },
    data:{
      status:ExecutionPhaseStatus.RUNNING,
      startedAt,
      inputs:JSON.stringify(environment.phases[node.id].inputs),
    }
  });
  const creditsRequired=TaskRegistry[node.data.type].credits;

  //TODO decrement user balance from required credits
  let success=await decrementCredits(userId,creditsRequired,LogCollector);
  const creditsConsumed=success?creditsRequired:0;
  if(success){
     success= await executePhase(phase,node,environment,LogCollector);
  }
  const outputs=environment.phases[node.id].outputs;
  await finalizePhase(phase.id,success,outputs,LogCollector,creditsConsumed);
  return {success,creditsConsumed}
}
async function finalizePhase(phaseId:string,success:boolean,outputs:any,LogCollector:LogCollector,creditsConsumed:number){
  const finalStatus=success?ExecutionPhaseStatus.COMPLETED:ExecutionPhaseStatus.FAILED;
  await prisma.executionPhase.update({
    where:{
      id:phaseId,
    },
    data:{
      status:finalStatus,
      completedAt:new Date(),
      outputs:JSON.stringify(outputs),
      creditsConsumed,
      logs:{
        createMany:{
          data:LogCollector.getAll().map(log=>({
            message:log.message,
            logLevel:log.level,
            timestamp:log.timestamp,
          }))
        }
      }
    }
  })
}
async function executePhase(phase:ExecutionPhase,node:AppNode,environment:Environment,LogCollector:LogCollector):Promise<boolean>{
 // await waitFor(3000) //remove this after testing
  const runFn=ExecutorRegistry[node.data.type];
  if(!runFn){
    LogCollector.error(`not found executor for ${node.data.type}`)
    return false;
  }
  const executionEnvironment:ExecutorEnvironment<any>=createExecutionEnvironment(node,environment,LogCollector);
  return await runFn(executionEnvironment);
}
function setUpEnvironmentForPhase(node:AppNode,environment:Environment,edges:Edge[]){
  environment.phases[node.id]={inputs:{},outputs:{}};
  const inputs=TaskRegistry[node.data.type].inputs;
  for(const input of inputs){
    if(input.type===TaskParamType.BROWSER_INSTANCE) continue;
    const inputValue=node.data.inputs[input.name];
    if(inputValue){
      environment.phases[node.id].inputs[input.name]=inputValue;
      continue;
    }
    //get inputs from connected node output
    const connectedEdge=edges.find(edge =>edge.target===node.id && edge.targetHandle===input.name);
    if(!connectedEdge){
      console.error("Missing edge for input",input.name,"node id:",node.id);
      continue;
    }
    const outputValue=environment.phases[connectedEdge.source].outputs[connectedEdge.sourceHandle!];
    environment.phases[node.id].inputs[input.name]=outputValue;
  }
}
function createExecutionEnvironment(node:AppNode, environment:Environment,logCollector:LogCollector):ExecutorEnvironment<any>{
  return {
    getInput:(name:string)=>environment.phases[node.id]?.inputs[name],
    setOutput:(name:string,value:string)=>{
      environment.phases[node.id].outputs[name]=value;
    },
    getBrowser:()=>environment.browser,
    setBrowser:(browser:Browser)=>(environment.browser=browser),
    getPage:()=>environment.page,
    setPage:(page:Page)=>(environment.page=page),
    log:logCollector,
  }

}
async function cleanupEnvironment(environment:Environment){
  if(environment.browser){
    await environment.browser.close().catch(error=>console.error("cannot close browser,reason:",error));
  }

}
async function decrementCredits(userId:string,amount:number,logCollector:LogCollector){
  try{
   await prisma.userBalance.update({
    where:{
      userId,
      credits:{gte:amount},
    },
    data:{
      credits:{
        decrement:amount,
      },
    },
   });
   return true;
  }catch(error){
  console.error(error)
  logCollector.error("Insufficiant balance")
   return false;
  }

}