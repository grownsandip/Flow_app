import { TaskType } from "@/types/task";
import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { LaunchBroswerTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { WorkFlowTask } from "@/types/workflow";


type Registry={
    [K in TaskType]:WorkFlowTask & {type:K};
}
export const TaskRegistry:Registry={
    LAUNCH_BROWSER:LaunchBroswerTask,
    PAGE_TO_HTML:PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT:ExtractTextFromElementTask,
}