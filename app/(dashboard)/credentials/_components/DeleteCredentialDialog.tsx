"use client";
import { DeleteCredential } from '@/actions/credentials/deleteCredential';
import { AlertDialog,AlertDialogCancel,AlertDialogAction,AlertDialogContent,AlertDialogDescription,AlertDialogFooter,AlertDialogTitle,AlertDialogTrigger, AlertDialogHeader} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useMutation } from '@tanstack/react-query';
import { XIcon } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';
interface Props{
    name:string,
}
export const DeleteCredentialDialog = ({name}:Props) => {
    const [confirmText,setConfirmText]=useState("");
    const [open,setOpen]=useState(false);
    const deleteMutation=useMutation({
        mutationFn:DeleteCredential,
        onSuccess:()=>{
            toast.success("Credential deleted successfully",{id:name})
            setConfirmText("")
        },
        onError:()=>{
            toast.error("Something went wrong",{id:name})
        },
    })
  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
        <AlertDialogTrigger asChild>
            <Button variant={"destructive"} size={"icon"}>
                <XIcon size={18}/>
            </Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
            <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure</AlertDialogTitle>
                <AlertDialogDescription>If you delete this credential,it cannot be recovered.
                    <div className='flex flex-col py-4 gap-2'>
                        <p>If you are sure ,enter <b>{name}</b> to confirm:</p>
                        <Input value={confirmText} onChange={(e)=>setConfirmText(e.target.value)}/>
                    </div>
                </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
                <AlertDialogCancel onClick={()=>setConfirmText("")}>Cancel</AlertDialogCancel>
                <AlertDialogAction disabled={confirmText!==name||deleteMutation.isPending} className='text-destructive-foreground bg-destructive hover:bg-destructive/90'
                onClick={()=>{
                    toast.loading("Deleting Credential...",{id:name})
                    deleteMutation.mutate(name)
                }}>Delete</AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
    </AlertDialog>
  )
}