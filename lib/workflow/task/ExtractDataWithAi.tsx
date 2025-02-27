import { TaskParamType, TaskType } from "@/types/task";
import { WorkFlowTask } from "@/types/workflow";
import {BrainIcon} from "lucide-react";

export const ExtractDataWithAITask={
    type:TaskType.EXTRACT_DATA_WITH_AI,
    label:"Extract Data With AI",
    icon:(props)=>(<BrainIcon className="stroke-rose-400" {...props}/>),
    isEntryPoint:false,
    credits:4,
    inputs:[
        {
            name:"Content",
            type:TaskParamType.STRING,
            required:true,
        },
        {
            name:"Credentials",
            type:TaskParamType.CREDENTIAL,
            required:true,
        },
        {
            name:"Prompt",
            type:TaskParamType.STRING,
            required:true,
            variant:"textarea"
        },
    ] as const,
    outputs:[
        {
            name:"Extracted Data",
            type:TaskParamType.STRING,
        },
    ] as const,
} satisfies WorkFlowTask