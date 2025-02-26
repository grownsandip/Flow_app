"use client";
import { UpdateWorkflowCron } from '@/actions/workflows/updateWorkflowsCron';
import CustomDialogHeader from '@/components/CustomDialogHeader';
import { Button } from '@/components/ui/button';
import { Dialog, DialogTrigger,DialogContent, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { useMutation } from '@tanstack/react-query';
import { CalendarIcon, ClockIcon, TriangleAlertIcon, Workflow } from 'lucide-react';
import React, { useEffect, useState } from 'react'
import { toast } from 'sonner';
import cronstrue from 'cronstrue';
import { CronExpressionParser} from 'cron-parser';
import { RemoveWorkflowSchedule } from '@/actions/workflows/removeWorkflowSchedule';
import { Separator } from '@/components/ui/separator';

const SchedularDialog = (props:{workflowId:string;cron:string|null}) => {
  const [cron,setCron]=useState(props.cron||"");
  const [validCron,setValidCron]=useState(false);
  const [readableCron,setReadableCron]=useState("");
  const mutation=useMutation({
    mutationFn:UpdateWorkflowCron,
    onSuccess:()=>{
      toast.success("Schedule updated successfully",{id:"cron"})
    },
    onError:()=>{
      toast.error("Something went wrong",{id:"cron"})
    },
  })
  const RemoveScheduleMutation=useMutation({
    mutationFn:RemoveWorkflowSchedule,
    onSuccess:()=>{
      toast.success("Schedule removed successfully",{id:"cron"})
    },
    onError:()=>{
      toast.error("Something went wrong",{id:"cron"})
    },
  })
  useEffect(()=>{
   try {
    CronExpressionParser.parse(cron,{tz:"UTC"});
    const humanCronStr=cronstrue.toString(cron);
    //console.log(humanCronStr);
    setValidCron(true);
    setReadableCron(humanCronStr);
   } catch (error) {
    setValidCron(false);
   }
  },[cron])
  const workflowHasValidCron=props.cron && props.cron.length>0;
  const readableSavedCron= workflowHasValidCron && cronstrue.toString(props.cron!);
  return (
    <Dialog>
      <DialogTrigger asChild>
           <Button variant={"link"} size={"sm"} className={cn("text-sm p-0 h-auto text-orange-500",workflowHasValidCron &&"text-primary")}>
            {workflowHasValidCron && (
              <div className='flex items-center gap-2'>
                <ClockIcon/>
                {readableSavedCron}
              </div>
            )}
            {!workflowHasValidCron && ( 
           <div className='flex items-center gap-1'>
           <TriangleAlertIcon className='h-3 w-3 mr-1'/>
           Set Schedule
           </div>)}
           </Button>
      </DialogTrigger>
      <DialogContent className='px-0'>
          <CustomDialogHeader title='Schedule workflow execution' icon={CalendarIcon}/>
          <div className='p-6 space-y-4'>
            <p className='text-muted-foreground text-sm'>Specify a cron expression for scheduling a workflow all times are in UTC</p>
            <Input placeholder='E.g * * * *' value={cron} onChange={(e)=>setCron(e.target.value)}/>
            <div className={cn("bg-accent rounded-md p-4 border text-sm border-destructive text-desctructive",
              validCron && "border-primary text-primary"
            )}>{validCron ?readableCron:"Not a valid cron string"}</div>
            {workflowHasValidCron && (
              <DialogClose asChild>
                <div>
                  <Button className='w-full text-destructive border-destructive hover:text-destructive'
                  variant={'outline'} disabled={mutation.isPending || RemoveScheduleMutation.isPending}
                  onClick={()=>{
                    toast.loading("Removing Schedule...",{id:"cron"});
                    RemoveScheduleMutation.mutate(props.workflowId);
                  }}>
                    Remove current Schedule
                  </Button>
                  <Separator/>
                </div>
              </DialogClose>
            )}
          </div>
          <DialogFooter className='px-6 gap-2'>
            <DialogClose asChild>
               <Button variant={"secondary"} className='w-full'>
                Cancel
               </Button>
            </DialogClose>
            <DialogClose asChild>
              <Button className='w-full' disabled={mutation.isPending || !validCron} onClick={()=>{
                toast.loading("Saving...",{id:"cron"})
                mutation.mutate({
                  id:props.workflowId,
                  cron,
                })
              }}>Save</Button>
            </DialogClose>
          </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default SchedularDialog