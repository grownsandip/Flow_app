"use client";
import { UnpublishWorkflow } from '@/actions/workflows/unPublishWorkflow';
import useExecutionPlan from '@/components/hooks/useExecutionPlan';
import { Button } from '@/components/ui/button';
import { useMutation } from '@tanstack/react-query';
import { useReactFlow } from '@xyflow/react';
import {DownloadIcon} from 'lucide-react';
 import React from 'react'
import { toast } from 'sonner';
 
 const UnpublishBtn = ({workflowId}:{workflowId:string}) => {
    const mutation=useMutation({
        mutationFn:UnpublishWorkflow,
        onSuccess:()=>{
            toast.success("WorkFlow Unpublished",{id:workflowId});
        },
        onError:()=>{
            toast.error("Something went wrong",{id:workflowId});
        },
    });
   return (
    <Button variant={"outline"} className='flex items-center gap-2' onClick={()=>{
        toast.loading("Unpublishing workflow....",{id:workflowId})
        mutation.mutate(workflowId)
    }} disabled={mutation.isPending}>
        <DownloadIcon size={16} className='stroke-orange-400'/>
        Unpublish
    </Button>
   )
 }
 
 export default UnpublishBtn