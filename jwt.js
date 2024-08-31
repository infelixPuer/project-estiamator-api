import { sha256 } from 'js-sha256';
import { readFileSync } from 'fs';
import { createSign, createVerify } from 'crypto';

const header = {
    "alg": "RS256",
    "typ": "jwt"
};

const payload = {
    "sub": "1234567890",
    "name": "John Doe",
    "admin": false
};

function base64UrlEncode(input) {
    return Buffer.from(input)
	.toString('base64')
	.replace(/=/g, '')
	.replace(/\+/g, '-')
	.replace(/\//g, '_');
}

function base64UrlDecode(input) {
    input = input.replace(/-/g, '+').replace(/_/g, '/');

    switch (input.length % 4) {
	case 2: input += '=='; break;
	case 3: input += '='; break;
    }

    return Buffer.from(input, 'base64').toString();
}

let data = base64UrlEncode(JSON.stringify(header)) + '.' + base64UrlEncode(JSON.stringify(payload));

const privateKey = readFileSync('private_key.pem', 'utf-8');
const publicKey = readFileSync('public_key.pem', 'utf-8');

const sign = createSign('SHA256');
sign.update(data);
sign.end();

const signature = base64UrlEncode(sign.sign(privateKey, 'base64'));
const jwt = data + '.' + signature;

const [headerB64, payloadB64, signatureB64] = jwt.split('.');
data = headerB64 + '.' + payloadB64;

const verify = createVerify('SHA256');
verify.update(data);
verify.end();

const isValid = verify.verify(publicKey, base64UrlDecode(signatureB64), 'base64');

if (isValid) {
    console.log("JWT is valid");
} else {
    console.log("JWT is invalid!");
}
