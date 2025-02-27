import {ExecutorEnvironment } from "@/types/executor";
import { WaitForElementTask } from "../task/WaitForElementTask";
export async function WaitForElementExecutor(environment:ExecutorEnvironment<typeof WaitForElementTask>):Promise<boolean>{
    try{
    const selector=environment.getInput("Selector")
    if(!selector){
        environment.log.error("input->selector is not defined");
    }
    const visibility=environment.getInput("Visibility")
    if(!visibility){
        environment.log.error("input->visibility is not defined");
    }
    await environment.getPage()!.waitForSelector(selector,{
        visible:visibility==="visible",
        hidden:visibility==="hidden",

    }) //fills the input in selector field
    environment.log.info(`Element ${selector} became ${visibility}`)
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}