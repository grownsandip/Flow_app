import { TaskType } from "@/types/task";
import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { LaunchBroswerTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";
import { WorkFlowTask } from "@/types/workflow";
import { FillInputTask } from "./FillInput";
import { ClickElementTask } from "./ClickElementTask";
import { WaitForElementTask } from "./WaitForElementTask";
import { DeliverViaWebhookTask } from "./DeliverViaWebhook";
import { ExtractDataWithAITask } from "./ExtractDataWithAi";
import { ReadPropertyFromJsonTask } from "./ReadPropertyFromJson";
import { AddPropertyToJsonTask } from "./AddPropertyToJson";
import { NavigateUrlTask } from "./NavigateUrl";
import { ScrollElementTask } from "./ScrollElement";


type Registry={
    [K in TaskType]:WorkFlowTask & {type:K};
}
export const TaskRegistry:Registry={
    LAUNCH_BROWSER:LaunchBroswerTask,
    PAGE_TO_HTML:PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT:ExtractTextFromElementTask,
    FILL_INPUT:FillInputTask,
    CLICK_ELEMENT:ClickElementTask,
    WAIT_FOR_ELEMENT:WaitForElementTask,
    DELIVER_VIA_WEBHOOK:DeliverViaWebhookTask,
    EXTRACT_DATA_WITH_AI:ExtractDataWithAITask,
    READ_PROPERTY_FROM_JSON:ReadPropertyFromJsonTask,
    ADD_PROPERTY_TO_JSON:AddPropertyToJsonTask,
    NAVIGATE_URL:NavigateUrlTask,
    SCROLL_ELEMENT:ScrollElementTask,
}