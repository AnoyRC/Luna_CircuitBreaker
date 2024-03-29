const crypto = require("crypto");
require("dotenv").config();
const ethers = require("ethers");
const asn1 = require("asn1.js");

// Define the ASN.1 schema for an ECDSA signature
const ECDSASignature = asn1.define("ECDSASignature", function () {
  this.seq().obj(this.key("r").int(), this.key("s").int());
});

function bufferFromBase64(value) {
  return Buffer.from(value, "base64");
}

async function derToRS(der) {
  const rLength = der.readUInt8(3);
  const rStart = 4;
  const rEnd = rStart + rLength;
  const r = der.slice(rStart, rEnd);

  const sLength = der.readUInt8(rEnd + 1);
  const sStart = rEnd + 2;
  const sEnd = sStart + sLength;
  const s = der.slice(sStart, sEnd);

  return [r, s];
}

function derToRawSignature(derSignature) {
  // Parse the DER signature
  const signature = ECDSASignature.decode(derSignature, "der");

  // Convert r and s to 32-byte buffers
  const r = Buffer.from(signature.r.toArrayLike(Buffer, "be", 32));
  const s = Buffer.from(signature.s.toArrayLike(Buffer, "be", 32));

  // Concatenate r and s
  const rawSignature = Buffer.concat([r, s]);

  return new Uint8Array(rawSignature);
}

function concatenateBuffers(buffer1, buffer2) {
  var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
  tmp.set(new Uint8Array(buffer1), 0);
  tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
  return tmp;
}

function bufferToHex(buffer) {
  return "0x".concat(
    [...new Uint8Array(buffer)]
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("")
  );
}

async function getKey(pubkey) {
  const algoParams = {
    name: "ECDSA",
    namedCurve: "P-256",
    hash: "SHA-256",
  };
  return await crypto.subtle.importKey("spki", pubkey, algoParams, true, [
    "verify",
  ]);
}

async function getCordinates(pubkey) {
  const pubKeyBuffer = bufferFromBase64(pubkey);
  const rawPubkey = await crypto.subtle.exportKey(
    "jwk",
    await getKey(pubKeyBuffer)
  );
  const { x, y } = rawPubkey;

  const xBuffer = bufferFromBase64(x);
  const yBuffer = bufferFromBase64(y);

  const pubkeyHex = [bufferToHex(xBuffer), bufferToHex(yBuffer)];

  //   const uint8ArrayPubkey = concatenateBuffers(xBuffer, yBuffer);
  //   console.log("uint8ArrayPubkey: ", uint8ArrayPubkey);

  //   let pubkeyBytes32Array = [];
  //   let i = 0;
  //   for (i; i < uint8ArrayPubkey.length; i++) {
  //     pubkeyBytes32Array[i] = ethers.utils.hexZeroPad(
  //       `0x${uint8ArrayPubkey[i].toString(16)}`,
  //       32
  //     );
  //   }

  //   console.log("pubkeyBytes32Array: ", pubkeyBytes32Array);
  return pubkeyHex;
}

const getArray = (hex) => {
  return ethers.utils.arrayify(hex);
};

async function getSignature(_signature) {
  const signatureParsed = await derToRS(bufferFromBase64(_signature));

  const signature = ethers.BigNumber.from(
    bufferToHex(signatureParsed[0]) + bufferToHex(signatureParsed[1]).slice(2)
  );

  return signature;
}

function parseUint8ArrayToStrArray(value) {
  let array = [];
  for (let i = 0; i < value.length; i++) {
    array[i] = value[i].toString();
  }
  return array;
}

function computeMessage(authenticatorData, clientData) {
  const authenticatorDataBytes = ethers.utils.arrayify(authenticatorData);

  const clientDataHash = ethers.utils.sha256(clientData);

  const concatenatedData = ethers.utils.concat([
    authenticatorDataBytes,
    clientDataHash,
  ]);

  return ethers.utils.sha256(concatenatedData);
}

module.exports = {
  bufferFromBase64,
  derToRS,
  concatenateBuffers,
  bufferToHex,
  getKey,
  getCordinates,
  getArray,
  getSignature,
  parseUint8ArrayToStrArray,
  computeMessage,
  derToRawSignature,
};
