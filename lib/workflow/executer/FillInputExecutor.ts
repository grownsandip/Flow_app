
import {ExecutorEnvironment } from "@/types/executor";
import { FillInputTask } from "../task/FillInput";
import { waitFor } from "@/lib/helper/waitFor";
export async function FillInputExecutor(environment:ExecutorEnvironment<typeof FillInputTask>):Promise<boolean>{
    try{
    const selector=environment.getInput("Selector")
    if(!selector){
        environment.log.error("input->selector is not defined");
    }
    const value=environment.getInput("Value")
    if(!value){
        environment.log.error("input->value is not defined");
    }
    await environment.getPage()!.type(selector,value); //fills the input in selector field
   // await waitFor(3000);
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}