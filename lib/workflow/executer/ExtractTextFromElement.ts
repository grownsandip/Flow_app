import {ExecutorEnvironment } from "@/types/executor";
import { PageToHtmlTask } from "../task/PageToHtml";
import * as cheerio from "cheerio";
import { ExtractTextFromElementTask } from "../task/ExtractTextFromElement";
export async function ExtractTextFromElementExecutor(environment:ExecutorEnvironment<typeof ExtractTextFromElementTask>):Promise<boolean>{
    try{
    const selector=environment.getInput("Selector");
    if(!selector){
        environment.log.error("selector not defined");
        return false
    };
    const html =environment.getInput("Html");
    if(!html){
        environment.log.error("html not defined");
        return false
    }
    const $=cheerio.load(html)
    const element=$(selector)
    if(!element){
        environment.log.error("element not defined");
        return false;
    }
    const extractedText=$.text(element)
    if(!extractedText){
        environment.log.error("Extracted text not defined");
        return false;
    }
    environment.setOutput("Extracted Text",extractedText)
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}