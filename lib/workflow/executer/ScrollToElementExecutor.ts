import {ExecutorEnvironment } from "@/types/executor";
import { ScrollElementTask } from "../task/ScrollElement";
import { waitFor } from "@/lib/helper/waitFor";
export async function ScrollToElementExecutor(environment:ExecutorEnvironment<typeof ScrollElementTask>):Promise<boolean>{
    try{
    const selector=environment.getInput("Selector")
    if(!selector){
        environment.log.error("input->selector is not defined");
    }
    await environment.getPage()!.evaluate((selector)=>{
        const element=document.querySelector(selector);
        if(!element){
            throw new Error("element not found")
        }
        const top=element.getBoundingClientRect().top+window.scrollY;
        window.scrollTo({top});
    },selector)
    await waitFor(5000);
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}