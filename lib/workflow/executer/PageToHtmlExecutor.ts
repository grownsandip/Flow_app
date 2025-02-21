
import {ExecutorEnvironment } from "@/types/executor";
import { PageToHtmlTask } from "../task/PageToHtml";
export async function PageToHtmlExecutor(environment:ExecutorEnvironment<typeof PageToHtmlTask>):Promise<boolean>{
    try{
        const websiteUrl=environment.getInput("Web page");
        console.log("wbesite URL",websiteUrl);
    return true;
   }catch(err){
    console.log(err)
    return false;
   }
}