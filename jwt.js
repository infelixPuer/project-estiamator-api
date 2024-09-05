const { sha256 } = require('js-sha256');
const { readFileSync } = require('fs');
const { createSign, createVerify } = require('crypto');

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

function sign_jwt(header, payload, privateKey) {
    const data = base64UrlEncode(JSON.stringify(header)) + '.' + base64UrlEncode(JSON.stringify(payload));

    const sign = createSign('SHA256');
    sign.update(data);
    sign.end();

    const signature = base64UrlEncode(sign.sign(privateKey, 'base64'));
    const jwt = data + '.' + signature;
    return jwt;
}

function verify_jwt(jwt, publicKey) {
    const [headerB64, payloadB64, signatureB64] = jwt.split('.');

    const data = headerB64 + '.' + payloadB64;

    const verify = createVerify('SHA256');
    verify.update(data);
    verify.end();

    const isValid = verify.verify(publicKey, base64UrlDecode(signatureB64), 'base64');

    return isValid;
}

module.exports = { sign_jwt, verify_jwt };

// let data = base64UrlEncode(JSON.stringify(header)) + '.' + base64UrlEncode(JSON.stringify(payload));
// 
// const privateKey = readFileSync('private_key.pem', 'utf-8');
// const publicKey = readFileSync('public_key.pem', 'utf-8');
// 
// const sign = createSign('SHA256');
// sign.update(data);
// sign.end();
// 
// const signature = base64UrlEncode(sign.sign(privateKey, 'base64'));
// const jwt = data + '.' + signature;
// 
// const [headerB64, payloadB64, signatureB64] = jwt.split('.');
// data = headerB64 + '.' + payloadB64;
// 
// const verify = createVerify('SHA256');
// verify.update(data);
// verify.end();
// 
// const isValid = verify.verify(publicKey, base64UrlDecode(signatureB64), 'base64');
