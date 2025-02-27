import crypto from 'crypto';
import "server-only";
const ALGO="aes-256-cbc";//key length is 32 byte
//https://generate-random.org/encryption-key-generator
//encryption function
export const symmetricEncrypt=(data:string)=>{
  const key=process.env.ENCRYPTION_KEY;
  if(!key){
    throw new Error("Encryption key not found")
  }
  const initial_vec=crypto.randomBytes(16);//this prevents same message resulting similar hash code if done multiple times but we need to store intialization vector with the message
  const cipher=crypto.createCipheriv(ALGO,Buffer.from(key,"hex"),initial_vec);
  let encrypted=cipher.update(data);
  encrypted=Buffer.concat([encrypted,cipher.final()]);
  return initial_vec.toString("hex")+":"+encrypted.toString("hex");//delimiter to indentify data and intial vector during decryption 
}
//decryption function
export const symmetricDecrypt=(encrypted:string)=>{
    const key=process.env.ENCRYPTION_KEY;
    if(!key){
      throw new Error("Encryption key not found")
    }
    const textParts=encrypted.split(":");
    const initial_vec=Buffer.from(textParts.shift() as string,"hex")
    const encryptedText=Buffer.from(textParts.join(":"),"hex");
    const decipher=crypto.createDecipheriv(ALGO,Buffer.from(key,"hex"),initial_vec);
    let decrypted=decipher.update(encryptedText)
    decrypted=Buffer.concat([decrypted,decipher.final()])
    return decrypted.toString();

}