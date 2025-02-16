"use client";
import { DeleteWorkflow } from '@/actions/workflows/deleteWorkflow';
import { AlertDialog,AlertDialogCancel,AlertDialogAction,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogTitle,AlertDialogTrigger, AlertDialogHeader} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';
import { toast } from 'sonner';
interface Props{
    open:boolean;
    setOpen:(open:boolean)=>void;
    workflowName:string;
    workflowId:string;
}
export const DeleteWorkflowDialog = ({open,setOpen,workflowName,workflowId}:Props) => {
    const [confirmText,setConfirmText]=useState("");
    const deleteMutation=useMutation({
        mutationFn:DeleteWorkflow,
        onSuccess:()=>{
            toast.success("Workflow deleted successfully",{id:workflowId})
            setConfirmText("")
        },
        onError:()=>{
            toast.error("Something went wrong",{id:workflowId})
        },
    })
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure</AlertDialogTitle>
                <AlertDialogDescription>If you delete this workflow,it cannot be recovered.
                    <div className='flex flex-col py-4 gap-2'>
                        <p>If you are sure ,enter <b>{workflowName}</b> to confirm:</p>
                        <Input value={confirmText} onChange={(e)=>setConfirmText(e.target.value)}/>
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={()=>setConfirmText("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={confirmText!==workflowName||deleteMutation.isPending} className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
                onClick={()=>{
                    toast.loading("Deleting workflow",{id:workflowId})
                    deleteMutation.mutate(workflowId)
                }}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}
