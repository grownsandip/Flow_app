"use client";

import { CreateFlowNode } from "@/lib/workflow/createFlowNode";
import { TaskType } from "@/types/task";
import { Workflow } from "@prisma/client";
import { addEdge, Background, BackgroundVariant, Connection, Controls, Edge, getOutgoers, ReactFlow, useEdgesState, useNodesState, useReactFlow } from "@xyflow/react";
import '@xyflow/react/dist/style.css';
import NodeComponent from "./nodes/NodeComponent";
import { useCallback, useEffect } from "react";
import DeletableEdge from "./edges/DeletableEdge";
import { TaskRegistry } from "@/lib/workflow/task/registry";
import { AppNode } from "@/types/appNode";

const nodeTypes = {
    flowNode: NodeComponent,
};
const edgeTypes = {
    default: DeletableEdge, //default edge will be delatable
}
const snapGrid: [number, number] = [50, 50]; //this helps in grid like rough movement of nodes rather than smooth
const fitViewoptions = { padding: 1 }
const FlowEditor = ({ workflow }: { workflow: Workflow }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState([CreateFlowNode(TaskType.LAUNCH_BROWSER)]);
    const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
    const { setViewport, screenToFlowPosition, updateNodeData } = useReactFlow();
    useEffect(() => {
        try {
            const flow = JSON.parse(workflow.definition);
            if (!flow) return;
            setNodes(flow.nodes || []);
            setEdges(flow.edges || []);
            if (!flow.viewport) return;
            const { x = 0, y = 0, zoom = 1 } = flow.viewport;
            setViewport({ x, y, zoom })
        } catch (error) {

        }
    }, [workflow.definition, setEdges, setNodes, setViewport]);
    const onDragOver = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        event.dataTransfer.dropEffect = "move";
    }, [])
    const onDrop = useCallback((event: React.DragEvent) => {
        event.preventDefault();
        const taskType = event.dataTransfer.getData("application/reactflow");
        if (typeof taskType === undefined || !taskType) return;
        const position = screenToFlowPosition({
            x: event.clientX,
            y: event.clientY,
        })
        const newNode = CreateFlowNode(taskType as TaskType, position);
        setNodes(nds => nds.concat(newNode))
    }, [screenToFlowPosition, setNodes])
    const onConnect = useCallback((connection: Connection) => {
        // console.log("@connection",connection)
        setEdges((eds) => addEdge({ ...connection, animated: true }, eds));
        if (!connection.targetHandle) return;
        //Remove target value if is present on connection
        const node = nodes.find((nd) => nd.id === connection.target);
        if (!node) return;
        const nodeInputs = node.data.inputs;
        updateNodeData(node.id, {
            inputs: {
                ...nodeInputs,
                [connection.targetHandle]: "",
            },
        });
    }, [setEdges, updateNodeData, nodes])
    const isValidConnection=useCallback((connection:Edge | Connection)=>{
        //Scenerios where we wont allow node connection
        //1.no self connection
        if(connection.source===connection.target){
            return false;
        }
        //2.types different no connection
        const source=nodes.find((node)=>node.id===connection.source)
        const target=nodes.find((node)=>node.id===connection.target)
        if(!source || !target){
            console.error("Invalid connection:source and traget node not found")
            return false;
        }
        const sourceTask=TaskRegistry[source.data.type];
        const targetTask=TaskRegistry[target.data.type];
        const output=sourceTask.inputs.find((o)=>o.name===connection.sourceHandle)
        const input=targetTask.outputs.find((o)=>o.name===connection.targetHandle)
        if(input?.type!==output?.type){
          console.error("Invalid connection:types mismatch")
          return false;
        }
        //if there is loop(cycle) in the workflow we may enter infinte crash
        const hasCycle=(node:AppNode ,vis=new Set())=>{
            if(vis.has(node.id))return false;
            vis.add(node.id)
            for (const outgoer of getOutgoers(node,nodes,edges)){
                if(outgoer.id===connection.source)return true;
                if(hasCycle(outgoer,vis))return true;
            }
        }
        const detectedCycle=hasCycle(target)
        return !detectedCycle;
    },[nodes,edges])
    return (
        <main className="h-full w-full">
            <ReactFlow nodes={nodes} edges={edges} onEdgesChange={onEdgesChange} onNodesChange={onNodesChange}
                nodeTypes={nodeTypes} isValidConnection={isValidConnection} snapGrid={snapGrid} snapToGrid fitView fitViewOptions={fitViewoptions} onDragOver={onDragOver}
                onDrop={onDrop} onConnect={onConnect} edgeTypes={edgeTypes}>
                <Controls position="top-left" fitViewOptions={fitViewoptions} />
                <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
        </main>
    )
}

export default FlowEditor