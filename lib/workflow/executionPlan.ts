import { AppNode, AppNodeMissingInputs } from "@/types/appNode";
import { WorkflowExecutionPlan, WorkflowExecutionPlanPhase } from "@/types/workflow";
import { Edge} from "@xyflow/react";
import { TaskRegistry } from "./task/registry";

export enum FlowToExectionPlanValidationError{
    "NO_ENTRY_POINT",
    "INVALID_INPUTS",
}
type FlowToExecutionPlanType = {
    executionPlan?: WorkflowExecutionPlan;
    error?:{
        type:FlowToExectionPlanValidationError;
        invalidElements?:AppNodeMissingInputs[];
    }
}
export function FlowToExecutionPlan(nodes: AppNode[], edges: Edge[]): FlowToExecutionPlanType {
    const entryPoint = nodes.find((node) => TaskRegistry[node.data.type].isEntryPoint);
    if (!entryPoint) {
        return {
            error:{
                type:FlowToExectionPlanValidationError.NO_ENTRY_POINT
            }
        }
    }
    const inputsWithErrors:AppNodeMissingInputs[]=[];
    const planned = new Set<string>();
    const invalidInputs=getInvalidInputs(entryPoint,edges,planned);
    if(invalidInputs.length>0){
        inputsWithErrors.push({
            nodeId:entryPoint.id,
            input:invalidInputs,
        },)
    }
    const executionPlan: WorkflowExecutionPlan = [
        {
            phase: 1,
            nodes: [entryPoint],
        },
    ];
    planned.add(entryPoint.id)
    for (let phase = 2; phase <= nodes.length && planned.size < nodes.length; phase++) {
        const nextPhase: WorkflowExecutionPlanPhase = { phase, nodes: [] };
        for (const currentNode of nodes) {
            if (planned.has(currentNode.id)) continue;//node already in execution plan
            const invalidInputs = getInvalidInputs(currentNode, edges, planned)
            if (invalidInputs.length > 0) {
                const incomers = getIncomers(currentNode, nodes, edges);
                if (incomers.every(incomer => planned.has(incomer.id))) {
                    //if all incomers nodes are planned and there are still invalid inputs this means that this node has invalid
                    //input which means flow is invalid
                    console.error("invalid inputs", currentNode.id, invalidInputs)
                    inputsWithErrors.push({
                        nodeId:currentNode.id,
                        input:invalidInputs,
                    },)
                } else {
                    //lets skipp node for now
                    continue
                }
            }
            nextPhase.nodes.push(currentNode);
        }
        for(const node of nextPhase.nodes){
            planned.add(node.id)
        }
        executionPlan.push(nextPhase)
    }
    if(inputsWithErrors.length>0){
        return {
            error:{
                type:FlowToExectionPlanValidationError.INVALID_INPUTS,
                invalidElements:inputsWithErrors,
            }
        }
    }
    return { executionPlan }
}

function getInvalidInputs(node: AppNode, edges: Edge[], planned: Set<string>) {
    const invalidInputs = [];
    const inputs = TaskRegistry[node.data.type].inputs;
    for (const input of inputs) {
        const inputValue = node.data.inputs[input.name];
        const inputValueProvided = inputValue?.length > 0;
        if (inputValueProvided) {
            continue;
        }
        //if value is not provided by user then we need to check
        //if there is an output linked to  current input
        const incomingEdges = edges.filter(edge => edge.target === node.id)
        const inputEdgeByOutput = incomingEdges.find((edge) => edge.targetHandle === input.name)
        const requiredInputProvidedByVisitedOutput = input.required && inputEdgeByOutput && planned.has(inputEdgeByOutput.source);
        if (requiredInputProvidedByVisitedOutput) {
            continue
        } else if (!input.required) {
            //if the input is not required but there is an output linked to it
            //then we need to be sure that the output is planned
            if (!inputEdgeByOutput) continue;
            if (inputEdgeByOutput && planned.has(inputEdgeByOutput.source)) {
                //output providing a value to the input,input is fine
                continue;
            }
        }
        invalidInputs.push(input.name);
    }
    return invalidInputs;
}
function getIncomers(node:AppNode,nodes:AppNode[],edges:Edge[]){
    if(!node.id){
        return [];
    }
    const incomersIds=new Set();
    edges.forEach((edge)=>{
        if(edge.target===node.id){
            incomersIds.add(edge.source)
        }
    })
    return nodes.filter((n)=>incomersIds.has(n.id))
}