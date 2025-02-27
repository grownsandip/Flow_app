import {ExecutorEnvironment } from "@/types/executor";
import { DeliverViaWebhookTask } from "../task/DeliverViaWebhook";
export async function DeliverViaWebhookExecutor(environment:ExecutorEnvironment<typeof DeliverViaWebhookTask>):Promise<boolean>{
    try{
    const targetUrl=environment.getInput("Target Url")
    if(!targetUrl){
        environment.log.error("input->targetUrl is not defined");
    }
    const body=environment.getInput("Body")
    if(!body){
        environment.log.error("input->body is not defined");
    }
   const response=await fetch(targetUrl,{
    method:"POST",
    headers:{
        "Content-Type":"application/json",
    },
    body:JSON.stringify(body),
   });
   const statusCode=response.status;
   if(statusCode!==200){
     environment.log.error(`status code: ${statusCode}`);
     return false;
   }
   const responseBody=await response.json();
   environment.log.info(JSON.stringify(responseBody,null,4))
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}