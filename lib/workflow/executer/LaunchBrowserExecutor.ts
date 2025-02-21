import { waitFor } from "@/lib/helper/waitFor";
import { Environment, ExecutorEnvironment } from "@/types/executor";
import puppeteer from "puppeteer";
import { LaunchBroswerTask } from "../task/LaunchBrowser";
export async function LaunchBrowserExecutor(environment:ExecutorEnvironment<typeof LaunchBroswerTask>):Promise<boolean>{
    try{
        const websiteUrl=environment.getInput("Website URL");
        console.log("wbesite URL",websiteUrl)
        const browser=await puppeteer.launch({
        headless:false,//this true means everything happens in the background
    })
    await waitFor(3000);
    await browser.close();
    return true;
   }catch(err){
    console.log(err)
    return false;
   }
}