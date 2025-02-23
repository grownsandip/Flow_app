import { waitFor } from "@/lib/helper/waitFor";
import { Environment, ExecutorEnvironment } from "@/types/executor";
import puppeteer, { Browser } from "puppeteer";
import { LaunchBroswerTask } from "../task/LaunchBrowser";
export async function LaunchBrowserExecutor(environment:ExecutorEnvironment<typeof LaunchBroswerTask>):Promise<boolean>{
    try{
        const websiteUrl=environment.getInput("Website URL");
        const browser=await puppeteer.launch({
        headless:true,//this true means everything happens in the background
    });
    environment.log.info("Browser started successfully")
    environment.setBrowser(browser);
    const page=await browser.newPage();
    await page.goto(websiteUrl);
    environment.setPage(page);//for multiple pages we can create a loop and iterate
    environment.log.info(`Opened page at ${websiteUrl}`)
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}