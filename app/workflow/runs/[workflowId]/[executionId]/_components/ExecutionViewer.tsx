"use client";
import { GetWorkflowExecutionWithPhases } from '@/actions/workflows/getWorkflowExecutionWithPhases';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { ExecutionPhaseStatus, WorkflowExecutionStatus } from '@/types/workflow';
import { useQuery } from '@tanstack/react-query';
import { formatDistanceToNow } from 'date-fns';
import { BadgeIcon, CalendarIcon, CircleDashedIcon, CircleIcon, ClockIcon, CoinsIcon, Loader2Icon, LucideIcon, PhoneCall, WorkflowIcon } from 'lucide-react';
import React, { ReactNode, useEffect, useState } from 'react'
import { DatesToDurationString } from '@/lib/helper/dates';
import { GetPhasesTotalCost } from '@/lib/helper/phases';
import { GetWorkflowPhaseDetails } from '@/actions/workflows/getWorkflowPhaseDetails';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ExecutionLog } from '@prisma/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { LogLevel } from '@/types/log';
import PhaseStatusBadge from './PhaseStatusBadge';

type ExecutionData= Awaited<ReturnType<typeof GetWorkflowExecutionWithPhases>>;
const ExecutionViewer = ({initialData,}:{initialData:ExecutionData}) => {
    const [selectedPhase,setSelectedPahse]=useState<string | null>(null);
    const phaseDetails=useQuery({
        queryKey:["phaseDetails",selectedPhase],
        enabled:selectedPhase!==null,
        queryFn:()=>GetWorkflowPhaseDetails(selectedPhase!),
    })
    const query=useQuery({
        queryKey:["execution",initialData?.id],
        initialData,
        queryFn:()=>GetWorkflowExecutionWithPhases(initialData!.id),
        refetchInterval:(q)=>q.state.data?.status === WorkflowExecutionStatus.RUNNING?1000:false //if execution is running we are going to fetch data every second otherwise disable fetching
    })
    const duration=DatesToDurationString(query.data?.startedAt,query.data?.completedAt);
    const isRunning=query.data?.status===WorkflowExecutionStatus.RUNNING;
    useEffect(()=>{
        //while running we auto select the current running phase in the sidebar
         const phases=query.data?.phases|| [];
         if(isRunning){
           //select the lastExecuted phase
           const phaseToSelect=phases.toSorted((a,b)=>a.startedAt!>b.startedAt!?-1:1)[0];
           setSelectedPahse(phaseToSelect.id);
           return;
         }
         const phaseToSelect=phases.toSorted((a,b)=>a.completedAt!>b.completedAt!?-1:1)[0];
         setSelectedPahse(phaseToSelect.id);
    },[query.data?.phases,isRunning,setSelectedPahse]);
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
                        <PhaseStatusBadge status={phase.status as ExecutionPhaseStatus}/>
                    </Button>
                ))}
            </div>
        </aside>
        <div className='w-full h-full flex'>
            {
                isRunning && (<div className='flex items-center justify-center flex-col gap-2 h-full w-full'>
                 <p className='font-bold'>run is in progress,please wait</p>
                </div>)
            }
            {
                !isRunning && !selectedPhase && (
                    <div className='flex items-center justify-center flex-col gap-2 h-full w-full'>
                        <div className='flex flex-col gap-1 text-center'>
                            <p className='font-bold'>No Phase selected</p>
                            <p className='text-sm text-muted-foreground'>Select a phase to see details</p>
                        </div>
                    </div>
                )
            }
            {
                 !isRunning && selectedPhase && phaseDetails.data &&(
                 <div className='flex flex-col py-4 container gap-4 overflow-auto'>
                     <div className='flex gap-2 items-center'>
                        <Badge variant={'outline'} className='space-x-4'>
                            <div className='flex gap-1 items-center'>
                            <CoinsIcon size={18} className='text-muted-foreground'/>
                            <span>Credits</span>
                            </div>
                            <span>TODO</span>
                        </Badge>
                        <Badge variant={'outline'} className='space-x-4'>
                            <div className='flex gap-1 items-center'>
                            <ClockIcon size={18} className='text-muted-foreground'/>
                            <span>Duration</span>
                            </div>
                            <span>{DatesToDurationString(phaseDetails.data.startedAt,phaseDetails.data.completedAt)||"-"}</span>
                        </Badge>
                     </div>
                     <ParameterViewer title="Inputs" subtitle="Inputs used for this phase" JSONparams={phaseDetails.data.inputs}/>
                     <ParameterViewer title="Outputs" subtitle="Outputs generated in this phase" JSONparams={phaseDetails.data.outputs}/>
                     <LogsViewer logs={phaseDetails.data.logs}/>
                 </div>)
            }
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
function ParameterViewer({title,subtitle,JSONparams}:{title:string;subtitle:string;JSONparams:string | null}){
    const params=JSONparams?JSON.parse(JSONparams):undefined;
  return (
    <Card>
        <CardHeader className='rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background'>
            <CardTitle className='text-base'>
                {title}
            </CardTitle>
            <CardDescription className='text-sm text-muted-foreground'>
                {subtitle}
            </CardDescription>
        </CardHeader>
        <CardContent className='py-4'>
            <div className='flex flex-col gap-2'>
                {(!params || Object.keys(params).length===0) && (
                    <p className='text-sm'>No parameters generated by this phase</p>
                )}
                {
                    params && Object.entries(params).map(([Key,value])=>(
                        <div key={Key} className='flex justify-between items-center space-y-1'>
                            <p className='text-muted-foreground text-sm flex-1 basis-1/3'>{Key}</p>
                            <Input readOnly className='flex-1 basis-2/3' value={value as string}/>
                        </div>
                    ))
                }
            </div>
        </CardContent>
    </Card>
  )  
}
function LogsViewer({logs}:{logs:ExecutionLog[]|undefined}){
    if(!logs || logs.length===0) return null;
 return (
    <Card className='w-full'>
        <CardHeader className='rounded-lg rounded-b-none border-b py-4 bg-gray-50 dark:bg-background'>
            <CardTitle className='text-base'>
                logs
            </CardTitle>
            <CardDescription className='text-sm text-muted-foreground'>
                Logs generated by this phase
            </CardDescription>
        </CardHeader>
        <CardContent className='p-0'>
           <Table>
            <TableHeader className='text-muted-foreground text-sm'>
                <TableRow>
                    <TableHead>Time</TableHead>
                    <TableHead>Level</TableHead>
                    <TableHead>Message</TableHead>
                </TableRow>
            </TableHeader>
            <TableBody>
                {logs.map(log=>(
                    <TableRow key={log.id} className='text-muted-foreground'>
                        <TableCell width={190} className='text-xs text-muted-foreground p-[2px] pl-4'>{log.timestamp.toISOString()}</TableCell>
                        <TableCell width={80} className={cn("uppercase text-xs font-bold p-[3px] pl-4",
                            (log.logLevel as LogLevel) === "error" && "text-destructive",
                                (log.logLevel as LogLevel) ==="info" && "text-primary"
                        )}>{log.logLevel}</TableCell>
                        <TableCell className='text-sm flex-1 p-[3px] pl-4'>{log.message}</TableCell>
                    </TableRow>
                ))}
            </TableBody>
           </Table>
        </CardContent>
    </Card>
 )
}