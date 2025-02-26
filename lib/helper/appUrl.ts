export function getAppUrl(path:string){
    const appUrl=process.env.NEXT_PUBLIC_APP_URL;//depending on where we deploy the application we can set the url in env file
    return `${appUrl}/${path}`;
}