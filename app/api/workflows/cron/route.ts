import { getAppUrl } from "@/lib/helper/appUrl";
import prisma from "@/lib/prisma";
import { WorkflowStatus } from "@/types/workflow";

//REST api for cron jobs
export async function GET(req:Request){
   const now=new Date();
   const workflows=await prisma.workflow.findMany({
    select:{id:true,},
    where:{
        status:WorkflowStatus.PUBLISHED, //getting workflows that are published
        cron:{not:null},//cron jobs which are not null;
        nextRunAt:{lte:now} //when current time has gone past scheduled time
    }
   });
   //console.log("@@workflows to run",workflows.length);
   for(const workflow of workflows){
    triggerWorkflow(workflow.id);
   }
 return  Response.json({workflowsToRun:workflows.length},{status:200});//if successfull we return ok status
}
function triggerWorkflow(workflowId:string){
 const triggerApiUrl=getAppUrl(`api/workflows/execute?workflowId=${workflowId}`)//this a relative url
 //console.log("@@TRIGGER API URL",triggerApiUrl)
 fetch(triggerApiUrl,{
    headers:{
       Authorization:`Bearer ${process.env.API_SECRET_KEY!}`, //this prevents url tempering by checking the presence of this header (usually done using secret key)
    },
    cache:"no-store",
    //signal:AbortSignal.timeout(5000),//varies time depending if required time for execution
 }).catch((error)=>console.error("Error triggering workflow with id:",workflowId,"error:",error.message))
}