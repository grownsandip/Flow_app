
import {ExecutorEnvironment } from "@/types/executor";
import { ExtractDataWithAITask } from "../task/ExtractDataWithAi";
import prisma from "@/lib/prisma";
import { symmetricDecrypt } from "@/lib/encryption";
import Groq from 'groq-sdk';
export async function ExtractDataWithAiExecutor(environment:ExecutorEnvironment<typeof ExtractDataWithAITask>):Promise<boolean>{
    try{
    const credentials=environment.getInput("Credentials")
    if(!credentials){
        environment.log.error("input->credentials is not defined");
    }
    const prompt=environment.getInput("Prompt")
    if(!prompt){
        environment.log.error("input->prompt is not defined");
    }
    const content=environment.getInput("Content")
    if(!content){
        environment.log.error("input-content is not defined");
    }
    //get credentials from databse
    const credential=await prisma.credential.findUnique({
        where:{
            id:credentials,
        }
    });
    if(!credential){
        environment.log.error("credentials not found")
        return false;
    }
    const plainCredValue=symmetricDecrypt(credential.value)
    if(!plainCredValue){
        environment.log.error("cannont decrypt credential")
        return false;
    }
    const client = new Groq({
        apiKey: plainCredValue
      });
    const response = await client.chat.completions.create({
        messages: [{ role: 'system', content: 'You are a webscraper helper that extracts data from HTML or Text.You will be given a peice of text or HTML content as input and also the prompt with the data you have to extract.The response should always be only extracted data as JSON array or object,without any additional words or explanations.Analyze the input carefully and extract data precisely based on prompt.If no data is found return an empty JSON array.Work only with the provided content and ensure the output is always a valid JSON array without any surrounding text' },
        {
          role:"user",
          content:content,
        },
        {
            role:"user",
            content:prompt,
        },
    ],
        temperature:1,
        model: 'llama3-70b-8192',
    });
    environment.log.info(`Prompt tokens:${response.usage?.prompt_tokens}`)
    environment.log.info(`Completion tokens:${response.usage?.completion_tokens}`)
    const result=response.choices[0].message?.content;
    if(!result){
        environment.log.error("Empty response from AI")
        return false;
    }
    environment.setOutput("Extracted Data",result)
    //console.log("@@plain cred value:",plainCredValue)
    return true;
   }catch(err:any){
    environment.log.error(err.message);
    return false;
   }
}