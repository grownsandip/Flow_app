"use server"

import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { FlowToExecutionPlan } from "@/lib/workflow/executionPlan";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

export async function RunWorkflow(form:{
    workflowId:string;
    flowDefiniton?:string;
}){
    const {userId} =auth();
    if(!userId){
        throw new Error("Unauthenticated");
    }
    const {workflowId,flowDefiniton}=form;
    if(!workflowId){
        throw new Error("Worflow id is required");
    }
  const worflow=await prisma.workflow.findUnique({
    where:{
        userId,
        id:workflowId,
    },
  });
  if(!worflow){
    throw new Error("workflow not found")
  }
  let executionPlan:WorkflowExecutionPlan;
  if(!flowDefiniton){
    throw new Error("flow definition is not defined");
  }
  const flow=JSON.parse(flowDefiniton);
  const result=FlowToExecutionPlan(flow.nodes,flow.edges);
  if(result.error){
    throw new Error("Flow definition not valid");
  }
  if(!result.executionPlan){
    throw new Error("No execution plan generated")
  }
  executionPlan=result.executionPlan;
  const execution= await prisma.workflowExecution.create({
    data:{
        workflowId,
        userId,
        status:WorkflowExecutionStatus.PENDING,
        startedAt:new Date(),
        trigger:WorkflowExecutionTrigger.MANUAL,
        phases:{
            create:executionPlan.flatMap(phase=>{
                return phase.nodes.flatMap(node=>{
                    return {
                        userId,
                        status:ExecutionPhaseStatus.CREATED,
                        number:phase.phase,
                        node:JSON.stringify(node),
                        name:TaskRegistry[node.data.type].label
                    }
                })
            })
        }
    },
    select:{
        id:true,
        phases:true,
    }
  })
  if(!execution){
    throw new Error("Workflow execution not created")
  }
  ExecuteWorkflow(execution.id);
  redirect(`/workflow/runs/${workflowId}/${execution.id}`)
}