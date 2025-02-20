"use client";
import { GetWorkflowExecutionWithPhases } from '@/actions/workflows/getWorkflowExecutionWithPhases';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { WorkflowExecutionStatus } from '@/types/workflow';
import { useQuery } from '@tanstack/react-query';
import { formatDistance, formatDistanceToNow } from 'date-fns';
import { BadgeIcon, CalendarIcon, CircleDashedIcon, CircleIcon, ClockIcon, CoinsIcon, Loader2Icon, LucideIcon, PhoneCall, WorkflowIcon } from 'lucide-react';
import React, { ReactNode, useState } from 'react'
import { DatesToDurationString } from '@/lib/helper/dates';
import { GetPhasesTotalCost } from '@/lib/helper/phases';
import { GetWorkflowPhaseDetails } from '@/actions/workflows/getWorkflowPhaseDetails';

type ExecutionData= Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>;
const ExecutionViewer = ({initialData,}:{initialData:ExecutionData}) => {
    const [selectedPhase,setSelectedPahse]=useState<string|null>(null);
    const phaseDetails=useQuery({
        queryKey:["phaseDetails",selectedPhase],
        enabled:selectedPhase!==null,
        queryFn:()=>GetWorkflowPhaseDetails(selectedPhase),
    })
    const query=useQuery({
        queryKey:["execution",initialData?.id],
        initialData,
        queryFn:()=>GetWorkflowExecutionWithPhases(initialData!.id),
        refetchInterval:(q)=>q.state.data?.status === WorkflowExecutionStatus.RUNNING?1000:false //if execution is running we are going to fetch data every second otherwise disable fetching
    })
    const duration=DatesToDurationString(query.data?.startedAt,query.data?.completedAt);
    const isRunning=query.data?.status===WorkflowExecutionStatus.RUNNING;
    const creditsConsumed=GetPhasesTotalCost(query.data?.phases || []);
  return (
    <div className='flex w-full h-full'>
        <aside className='w-[440px] min-w-[440px] max-w-[440px] border-r-2 border-separate flex
        flex-grow flex-col overflow-hidden'>
            <div className='py-4 px-2'>
                <ExecutionLabel icon={CircleIcon} label="status" value={query.data?.status}/>
                <ExecutionLabel icon={CalendarIcon} label="started at" value={query.data?.startedAt?
                    formatDistanceToNow(new Date(query.data?.startedAt),{addSuffix:true}):"-"
                }/>
                <ExecutionLabel icon={ClockIcon} label="duration" value={duration?(duration):(<Loader2Icon size={20} className='animate-spin'/>)}/>
                <ExecutionLabel icon={CoinsIcon} label="credits consumed" value={creditsConsumed}/>
            </div>
            <Separator/>
            <div className='flex items-center justify-center px-4 py-2'>
                 <div className='text-muted-foreground flex items-center gap-2'>
                    <WorkflowIcon size={20} className='stroke-muted-foreground/80'/>
                    <span className='font-semibold'>Phases</span>
                </div>
            </div>
            <Separator/>
            <div className='overflow-auto h-full px-2 py-4'>
                {query.data?.phases.map((phase,index)=>(
                    <Button key={phase.id} className='w-full justify-between' variant={selectedPhase===phase.id?"secondary":"ghost"} onClick={()=>{
                        if(isRunning) return;
                        setSelectedPahse(phase.id)}}>
                        <div className='flex items-center gap-2'>
                            <Badge variant={"outline"}>{index+1}</Badge>
                        <p className='font-semibold'>{phase.name}</p>
                        </div>
                        <p className='text-xs text-muted-foreground'>{phase.status}</p>
                    </Button>
                ))}
            </div>
        </aside>
        <div className='w-full h-full flex'>
          <pre>{JSON.stringify(phaseDetails.data,null,4)}</pre>
        </div>
    </div>
  )
}
function ExecutionLabel({icon,label,value}:{icon:LucideIcon;label:ReactNode;value:ReactNode}){
    const Icon=icon;
 return (
    <div className='flex text-sm py-2 px-4 items-center justify-between'>
                    <div className='flex text-muted-foreground items-center gap-2'>
                        <Icon size={20} className='stroke-muted-foreground/80'/>
                        <span>{label}</span>
                        </div>
                        <div className='font-semibold capitalize flex gap-2 items-center'>
                            {value}
                    </div>
                </div>
 )
}

export default ExecutionViewer