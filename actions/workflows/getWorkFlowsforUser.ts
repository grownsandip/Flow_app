"use server";

import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";

const getWorkFlowsForUser=()=>{
    const {userId}=auth();
    if(!userId){
        throw new Error("unauthenticated");
    }
  return prisma.workflow.findMany({  //querying database for userId
    where:{
        userId,
    },
    orderBy:{
        createdAt:"asc" //getting workflows by ascending order of most recent worflow first
    }
  })
}
export default getWorkFlowsForUser;