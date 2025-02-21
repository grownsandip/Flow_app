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
export async function ExecuteWorkflow(executionId:string){
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
  //TODO:setup execution environment
  const environment:Environment={phases:{}}
  //TODO:initialize workflow execution
  await intializeWorkflowExecution(executionId,execution.workflowId)
  //todo:initialize workflow status
  await initializePhaseStatuses(execution)
  let creditsConsumed=0;
  let executionFailed=false;
  for(const phase of execution.phases){
    //TODO:creditsConsumed
    const phaseExecution=await executeWorkflowPhase(phase,environment)
    if(!phaseExecution.success){
      executionFailed=true;
      break;
    }
   //TODO:execute phases
  }
  //TODO:finalize execution
  await finalizeWorkflowExecution(executionId,execution.workflowId,executionFailed,creditsConsumed)
  //TODO:cleanup environments
  revalidatePath("/workflow/runs")
}
async function intializeWorkflowExecution(executionId:string ,workflowId:string){
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
async function executeWorkflowPhase(phase:ExecutionPhase,environment:Environment){
  const startedAt=new Date();
  const node=JSON.parse(phase.node) as AppNode;
  setUpEnvironmentForPhase(node,environment);
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
  console.log(`executing phase ${phase.name} with ${creditsRequired} credits required`)

  //TODO decrement user balance from required credits
  const success= await executePhase(phase,node,environment)
  await finalizePhase(phase.id,success);
  return {success}
}
async function finalizePhase(phaseId:string,success:boolean){
  const finalStatus=success?ExecutionPhaseStatus.COMPLETED:ExecutionPhaseStatus.FAILED;
  await prisma.executionPhase.update({
    where:{
      id:phaseId,
    },
    data:{
      status:finalStatus,
      completedAt:new Date(),
    }
  })
}
async function executePhase(phase:ExecutionPhase,node:AppNode,environment:Environment):Promise<boolean>{
  const runFn=ExecutorRegistry[node.data.type];
  if(!runFn){
    return false;
  }
  const executionEnvironment:ExecutorEnvironment<any>=createExecutionEnvironment(node,environment);
  return await runFn(executionEnvironment);
}
function setUpEnvironmentForPhase(node:AppNode,environment:Environment){
  environment.phases[node.id]={inputs:{},outputs:{}};
  const inputs=TaskRegistry[node.data.type].inputs;
  for(const input of inputs){
    const inputValue=node.data.inputs[input.name];
      environment.phases[node.id].inputs[input.name]=inputValue;
      continue;
  }
  //get input value from output of connected nodes to the environment

}
function createExecutionEnvironment(node:AppNode,environment:Environment){
  return {
    getInput:(name:string)=>environment.phases[node.id]?.inputs[name]
  }

}