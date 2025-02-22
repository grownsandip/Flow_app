import { Browser, Page } from "puppeteer";
import { WorkFlowTask } from "./workflow";

export type Environment={
    browser?:Browser;
    page?:Page;
//phases with phaseId as key
phases:Record<string,{
    inputs:Record<string,string>;
    outputs:Record<string,string>;
}
>;
};
export type ExecutorEnvironment<T extends WorkFlowTask>={
    getInput(name:T["inputs"][number]["name"]):string;
    setOutput(name:T["outputs"][number]["name"],value:string):void;
    getBrowser():Browser|undefined;
    setBrowser(browser:Browser):void;
    getPage():Page|undefined;
    setPage(page:Page):void;
}