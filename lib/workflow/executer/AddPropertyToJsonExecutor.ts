
import {ExecutorEnvironment } from "@/types/executor";
import { AddPropertyToJsonTask } from "../task/AddPropertyToJson";
export async function AddPropertyToJsonExecutor(environment:ExecutorEnvironment<typeof AddPropertyToJsonTask>):Promise<boolean>{
    try{
    const jsonData=environment.getInput("JSON")
    if(!jsonData){
        environment.log.error("input->jsonData is not defined");
    }
    const propertyName=environment.getInput("Property name")
    if(!propertyName){
        environment.log.error("input->propertyName is not defined");
    }
    const propertyValue=environment.getInput("Property value")
    if(!propertyValue){
        environment.log.error("input->propertyValue is not defined");
    }
    const json=JSON.parse(jsonData);
    json[propertyName]=propertyValue;
    environment.setOutput("Updated JSON",JSON.stringify(json));
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}