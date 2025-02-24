"use client";
import { Workflow } from '@prisma/client'
import React from 'react'
import FlowEditor from './FlowEditor';
import { ReactFlowProvider } from '@xyflow/react';
import Topbar from './topbar/Topbar';
import TaskMenu from './TaskMenu';
import { FlowValidationContextProvider } from '@/components/context/FlowValidationContext';
import { WorkflowStatus } from '@/types/workflow';
const Editor = ({workflow}:{workflow:Workflow}) => {
  return (
    <FlowValidationContextProvider>
    <ReactFlowProvider>
        <div className='flex flex-col h-full w-full overflow-hidden'>
            <Topbar title='Workflow Editor' subtitle={workflow.name} workflowId={workflow.id} isPublished={workflow.status===WorkflowStatus.PUBLISHED}/>
            <section className='flex h-full overflow-auto'>
              <TaskMenu/>
                <FlowEditor workflow={workflow}/>
            </section>
        </div>
    </ReactFlowProvider>
    </FlowValidationContextProvider>
  )
}

export default Editor