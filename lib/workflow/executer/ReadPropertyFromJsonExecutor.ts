
import {ExecutorEnvironment } from "@/types/executor";
import { ReadPropertyFromJsonTask } from "../task/ReadPropertyFromJson";
export async function ReadPropertyFromJasonExecutor(environment:ExecutorEnvironment<typeof ReadPropertyFromJsonTask>):Promise<boolean>{
    try{
    const jsonData=environment.getInput("JSON")
    if(!jsonData){
        environment.log.error("input->jsonData is not defined");
    }
    const propertyName=environment.getInput("Property name")
    if(!propertyName){
        environment.log.error("input->propertyName is not defined");
    }
    const json=JSON.parse(jsonData);
    const propertyValue=json[propertyName];
    if(propertyValue===undefined){
        environment.log.error("property not found");
        return false;
    }
    environment.setOutput("Property value",propertyValue);
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}