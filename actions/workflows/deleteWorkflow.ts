"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";

export async function DeleteWorkflow(id:string){
    //check authentication first
    const {userId}=auth();
    if(!userId){
        throw new Error("Not authenticated")
    }

    await prisma.workflow.delete({
        where:{
            id,    //if workflow belongs to the user than delete
            userId,
        },
    });
    revalidatePath("/workflows")
}