export enum PackId {
    SMALL="SMALL",
    MEDIUM="MEDIUM",
    LARGE="LARGE",
}
export type CreditsPack={
    id:PackId;
    name:string;
    label:string;
    credits:number;
    price:number;
};
export const CreditsPack:CreditsPack[]=[
    {
        id:PackId.SMALL,
        name:"Small Pack",
        label:"1,000 credits",
        credits:1000,
        price:999,//writing the price in cents
    },
    {
        id:PackId.MEDIUM,
        name:"Medium Pack",
        label:"5,000 credits",
        credits:5000,
        price:3999,//writing the price in cents
    },
    {
        id:PackId.LARGE,
        name:"Large Pack",
        label:"10,000 credits",
        credits:10000,
        price:6999,//writing the price in cents
    }
]
export const getCreditsPack=(id:PackId)=>CreditsPack.find((p)=>p.id===id)