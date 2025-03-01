import { TaskType } from "@/types/task";
import { LaunchBrowserExecutor } from "./LaunchBrowserExecutor";
import { PageToHtmlExecutor } from "./PageToHtmlExecutor";
import { ExecutorEnvironment } from "@/types/executor";
import { WorkFlowTask } from "@/types/workflow";
import { ExtractTextFromElementExecutor } from "./ExtractTextFromElement";
import { FillInputExecutor } from "./FillInputExecutor";
import { ClickElementExecutor } from "./ClickElementExecutor";
import { WaitForElementExecutor } from "./WaitForElementExecutor";
import { DeliverViaWebhookExecutor } from "./DeliverViaWebhookExecutor";
import { ExtractDataWithAiExecutor } from "./ExtractDataWithAiExecutor";
import { ReadPropertyFromJasonExecutor } from "./ReadPropertyFromJsonExecutor";
import { AddPropertyToJsonExecutor } from "./AddPropertyToJsonExecutor";
import { NavigateUrlExecutor } from "./NavigateUrlExecutor";
import { ScrollToElementExecutor } from "./ScrollToElementExecutor";
type ExecutorFn<T extends WorkFlowTask>=(environment:ExecutorEnvironment<T>)=>Promise<boolean>;
type RegistryType={
    [K in TaskType]:ExecutorFn<WorkFlowTask & {type:K}>;
};
export const ExecutorRegistry:RegistryType={
    LAUNCH_BROWSER:LaunchBrowserExecutor,
    PAGE_TO_HTML:PageToHtmlExecutor,
    EXTRACT_TEXT_FROM_ELEMENT:ExtractTextFromElementExecutor,
    FILL_INPUT:FillInputExecutor,
    CLICK_ELEMENT:ClickElementExecutor,
    WAIT_FOR_ELEMENT:WaitForElementExecutor,
    DELIVER_VIA_WEBHOOK:DeliverViaWebhookExecutor,
    EXTRACT_DATA_WITH_AI:ExtractDataWithAiExecutor,
    READ_PROPERTY_FROM_JSON:ReadPropertyFromJasonExecutor,
    ADD_PROPERTY_TO_JSON:AddPropertyToJsonExecutor,
    NAVIGATE_URL:NavigateUrlExecutor,
    SCROLL_ELEMENT:ScrollToElementExecutor,
}