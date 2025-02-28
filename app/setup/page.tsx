import { SetUpUser } from "@/actions/billing/setupUser";
import { waitFor } from "@/lib/helper/waitFor"

export default async function setUpPage(){
    return await SetUpUser(); //server action
}