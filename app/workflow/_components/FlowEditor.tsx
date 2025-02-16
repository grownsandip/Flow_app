"use client";

import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { TaskType } from "@/types/task";
import { Workflow } from "@prisma/client";
import { Background, BackgroundVariant, Controls, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import NodeComponent from "./nodes/nodeComponent";
import { useEffect } from "react";

const nodeTypes={
    flowNode:NodeComponent,
};
const snapGrid:[number,number]=[50,50]; //this helps in grid like rough movement of nodes rather than smooth
const fitViewoptions={padding:1}
const FlowEditor = ({workflow}:{workflow:Workflow}) => {
    const [nodes,setNodes,onNodesChange]=useNodesState([CreateFlowNode(TaskType.LAUNCH_BROWSER)]);
    const [edges,setEdges,onEdgesChange]=useEdgesState([]);
    const {setViewport}=useReactFlow();
    useEffect(()=>{
        try {
            const flow=JSON.parse(workflow.definition);
            if(!flow)return;
            setNodes(flow.nodes||[]);
            setEdges(flow.edges||[]);
            if(!flow.viewport)return;
            const {x=0,y=0,zoom=1}=flow.viewport;
            setViewport({x,y,zoom})
        } catch (error) {
            
        }
    },[workflow.definition,setEdges,setNodes,setViewport]);
  return (
    <main className="h-full w-full">
        <ReactFlow nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} onNodesChange={onNodesChange} 
        nodeTypes={nodeTypes} snapGrid={snapGrid} snapToGrid fitView fitViewOptions={fitViewoptions}>
            <Controls position="top-left" fitViewOptions={fitViewoptions}/>
            <Background variant={BackgroundVariant.Dots} gap={12} size={1}/>
        </ReactFlow>
    </main>
  )
}

export default FlowEditor