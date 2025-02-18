import { ExtractTextFromElementTask } from "./ExtractTextFromElement";
import { LaunchBroswerTask } from "./LaunchBrowser";
import { PageToHtmlTask } from "./PageToHtml";

export const TaskRegistry={
    LAUNCH_BROWSER:LaunchBroswerTask,
    PAGE_TO_HTML:PageToHtmlTask,
    EXTRACT_TEXT_FROM_ELEMENT:ExtractTextFromElementTask,
}