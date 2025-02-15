import getWorkFlowsForUser from '@/actions/workflows/getWorkFlowsforUser'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { waitFor } from '@/lib/helper/waitFor'
import { AlertCircle, Inbox } from 'lucide-react'
import React, { Suspense } from 'react'
import CreateWorkflowDialogue from './_components/CreateWorkflowDialogue'
import WorkflowCard from './_components/WorkflowCard'

const page = () => {
  return (
    <div className='flex flex-1 flex-col h-full'>
        <div className='flex justify-between'>
            <div className='flex flex-col'>
                <h1 className='text-3xl font-bold'>Workflows</h1>
                <p className='text-muted-foreground'>Manage Your workflows</p>
                 {/* by default pages inside app router are server components */}
            </div>
            <CreateWorkflowDialogue/>
        </div>
        <div className='h-full py-6'>
            <Suspense fallback={<UserWorkflowsSkeleton/>}>
            <UserWorkFlows/>
            </Suspense>
        </div>
    </div>
  )
}
const UserWorkflowsSkeleton=()=>{
    return(
        <div className='space y-2'>{
            [1,2,3,4].map((i)=>(
                <Skeleton key={i} className='h-32 w-full'/>
            ))
        }</div>
    )
}
const UserWorkFlows= async()=>{  //as this is a server component we can directly use server action here
    const workflows=await getWorkFlowsForUser();
    if(!workflows){
       return(<Alert variant={"destructive"}>
            <AlertCircle className='w-4 h-4'/>
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Something went wrong please try again later</AlertDescription>
        </Alert>);
    }
    if(workflows.length===0){
        return (
            <div className='flex flex-col gap-4 h-full items-center justify-center'>
             <div className='rounded-full bg-accent w-20 h-20 flex items-center justify-center'>
                <Inbox size={40} className='stroke-primary'/>
             </div>
             <div className='flex flex-col gap-1 text-center'>
                <p className='font-bol'>No Workflows created yet</p>
                <p className='text-muted-foreground text-sm'>Click button below to get started</p>
             </div>
             <CreateWorkflowDialogue triggerText='Create Your First workflow'/>
            </div>
        )
    }
  return(
    <div className='grid grid-cols-1 gap-4'>
        {
            workflows.map((workflow,index)=>(
                <WorkflowCard key={workflow.id} workflow={workflow}/>
            ))
        }
    </div>
  )
}
export default page