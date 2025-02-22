import { waitFor } from "@/lib/helper/waitFor";
import { Environment, ExecutorEnvironment } from "@/types/executor";
import puppeteer, { Browser } from "puppeteer";
import { LaunchBroswerTask } from "../task/LaunchBrowser";
export async function LaunchBrowserExecutor(environment:ExecutorEnvironment<typeof LaunchBroswerTask>):Promise<boolean>{
    try{
        const websiteUrl=environment.getInput("Website URL");
        const browser=await puppeteer.launch({
        headless:false,//this true means everything happens in the background
    })
    environment.setBrowser(browser);
    const page=await browser.newPage();
    await page.goto(websiteUrl);
    environment.setPage(page);//for multiple pages we can create a loop and iterate
    return true;
   }catch(err){
    console.log(err)
    return false;
   }
}