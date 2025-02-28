"use server";

import { PeriodToDateRange } from "@/lib/helper/dates";
import prisma from "@/lib/prisma";
import { Period } from "@/types/analytics";
import { WorkflowExecutionStatus } from "@/types/workflow";
import { auth } from "@clerk/nextjs/server";

const {COMPLETED,FAILED}=WorkflowExecutionStatus;
export async function GetStatsCardValues(period:Period){
   const {userId}=auth();
   if(!userId){
    throw new Error("unauthenticated")
   }
   const dateRange=PeriodToDateRange(period)
   const executions=await prisma.workflowExecution.findMany({
    where:{
        userId,
        startedAt:{
            gte:dateRange.startDate,
            lte:dateRange.endDate,
        },
        status:{
            in:[COMPLETED,FAILED]
        },
    },
    select:{
        creditsConsumed:true,
        phases:{
            where:{
                creditsConsumed:{
                    not:null, //selecting phases with not null credits as they say only phases that were run
                },
            },
            select:{
                creditsConsumed:true,
            }
        },
    },
   });
   const stats={
    workflowExecution:executions.length,
    creditsConsumed:0,
    phaseExecution:0,
   }
   stats.creditsConsumed=executions.reduce((sum,executions)=>sum+executions.creditsConsumed,0)
   stats.phaseExecution=executions.reduce((sum,executions)=>sum+executions.phases.length,0)
   return stats;
}