
import {ExecutorEnvironment } from "@/types/executor";
import { NavigateUrlTask } from "../task/NavigateUrl";
export async function NavigateUrlExecutor(environment:ExecutorEnvironment<typeof NavigateUrlTask>):Promise<boolean>{
    try{
    const url=environment.getInput("URL")
    if(!url){
        environment.log.error("input->url is not defined");
    }
    await environment.getPage()!.goto(url)
    environment.log.info(`visited ${url}`)
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}