
import {ExecutorEnvironment } from "@/types/executor";
import { ClickElementTask } from "../task/ClickElementTask";
export async function ClickElementExecutor(environment:ExecutorEnvironment<typeof ClickElementTask>):Promise<boolean>{
    try{
    const selector=environment.getInput("Selector")
    if(!selector){
        environment.log.error("input->selector is not defined");
    }
    await environment.getPage()!.click(selector); //fills the input in selector field
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}