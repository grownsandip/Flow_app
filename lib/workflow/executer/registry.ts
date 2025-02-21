import { TaskType } from "@/types/task";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";
import { ExecutorEnvironment } from "@/types/executor";
import { WorkFlowTask } from "@/types/workflow";
type ExecutorFn<T extends WorkFlowTask>=(environment:ExecutorEnvironment<T>)=>Promise<boolean>;
type RegistryType={
    [K in TaskType]:ExecutorFn<WorkFlowTask & {type:K}>;
};
export const ExecutorRegistry:RegistryType={
    LAUNCH_BROWSER:LaunchBrowserExecutor,
    PAGE_TO_HTML:PageToHtmlExecutor,
    EXTRACT_TEXT_FROM_ELEMENT:()=>Promise.resolve(true)
}