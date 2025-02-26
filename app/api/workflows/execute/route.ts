import prisma from "@/lib/prisma";
import { ExecuteWorkflow } from "@/lib/workflow/executeWorkflow";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { ExecutionPhaseStatus, WorkflowExecutionPlan, WorkflowExecutionStatus, WorkflowExecutionTrigger } from "@/types/workflow";
import {CronExpressionParser} from "cron-parser";
import { timingSafeEqual } from "crypto";

function isValidSecret(secret: string) {
    const api_secret = process.env.API_SECRET_KEY;
    if (!api_secret) return false;
    //to match the secret key we will use constant time matching functions avoid secret === api_secret
    try {
        return timingSafeEqual(Buffer.from(secret), Buffer.from(api_secret))
    } catch (error) {
        return false
    }
}
//the trigerred api we have triggered using fetch request
export async function GET(request: Request) {
    //check for headers
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    const secret = authHeader.split(" ")[1];
    if (!isValidSecret(secret)) {
        return Response.json({ error: "Unauthorized" }, { status: 401 });
    }
    //at this point we are validated so now we read which workflow to run from the search param
    const { searchParams } = new URL(request.url);
    const workflowId = searchParams.get("workflowId") as string;
    if (!workflowId) {
        return Response.json({ error: "Bad request" }, { status: 400 });
    }
    //get workflow form database
    const workflow = await prisma.workflow.findUnique({
        where: {
            id: workflowId,
        },
    });
    if (!workflow) {
        return Response.json({ error: "Bad request" }, { status: 400 });
    }
    const executionPlan = JSON.parse(workflow.executionPlan!) as WorkflowExecutionPlan;
    if (!executionPlan) {
        return Response.json({ error: "Bad request" }, { status: 400 });
    }
    try {
        const cron=CronExpressionParser.parse(workflow.cron!,{tz:"UTC"});
        const nextRun=cron.next().toDate();
        const execution = await prisma.workflowExecution.create({
            data: {
                workflowId,
                userId: workflow.userId,
                definition: workflow.definition,
                status: WorkflowExecutionStatus.PENDING,
                startedAt: new Date(),
                trigger: WorkflowExecutionTrigger.CRON,
                phases: {
                    create: executionPlan.flatMap(phase => {
                        return phase.nodes.flatMap(node => {
                            return {
                                userId: workflow.userId,
                                status: ExecutionPhaseStatus.CREATED,
                                number: phase.phase,
                                node: JSON.stringify(node),
                                name: TaskRegistry[node.data.type].label
                            }
                        })
                    })
                }
            },
        })
        await ExecuteWorkflow(execution.id,nextRun);
        return new Response(null,{status:200})
    } catch (error) {
        return Response.json({error:"internal server error"},{status:500})
    }
}