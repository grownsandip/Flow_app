import { Browser } from "puppeteer";
import { WorkFlowTask } from "./workflow";

export type Environment={
    browser?:Browser;
//phases with phaseId as key
phases:Record<string,{
    inputs:Record<string,string>;
    outputs:Record<string,string>;
}
>;
};
export type ExecutorEnvironment<T extends WorkFlowTask>={
    getInput(name:T["inputs"][number]["name"]):string;
}