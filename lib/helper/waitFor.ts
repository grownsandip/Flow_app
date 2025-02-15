export function waitFor(ms:number){
    return new Promise(resolve=>(setTimeout(resolve,ms))) //takes number as time duration and returns promise rresolved
}