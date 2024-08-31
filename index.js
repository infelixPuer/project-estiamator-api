import { createSign, createVerify } from 'crypto';
import { readFileSync } from 'fs';

const privateKey = readFileSync('private_key.pem', 'utf-8');
const publicKey = readFileSync('public_key.pem', 'utf-8');

const sign = createSign("SHA256");
const verify = createVerify("SHA256");

sign.write("hello world!");
sign.end();

const sig = sign.sign(privateKey, 'base64');

verify.write("hello world!");
verify.end();
console.log(verify.verify(publicKey, sig, 'base64'));
