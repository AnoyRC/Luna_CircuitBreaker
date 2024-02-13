const express = require("express");
const router = express.Router();
require("dotenv").config();
const ethers = require("ethers");
const utils = require("../../lib/utils");
const base64url = require("base64url");

router.post("/passkey/inputs", async (req, res) => {
  const { pubkey, credentialId, authenticatorData, clientData } = req.body;

  if (!pubkey || !credentialId || !authenticatorData || !clientData) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  const authDataBuffer = utils.bufferFromBase64(authenticatorData);
  const clientDataBuffer = utils.bufferFromBase64(clientData);

  const challengeOffset =
    clientDataBuffer.indexOf("226368616c6c656e6765223a", 0, "hex") + 12 + 1;

  const authDataHex = utils.bufferToHex(authDataBuffer);
  const clientDataHex = utils.bufferToHex(clientDataBuffer);

  const pubKeyCoordinates = await utils.getCordinates(pubkey);

  const abiCoder = new ethers.utils.AbiCoder();

  const inputs = abiCoder.encode(
    ["bytes32", "bytes32", "string"],
    [pubKeyCoordinates[0], pubKeyCoordinates[1], credentialId]
  );

  res.json({
    inputs: inputs,
    pubKeyCoordinates: pubKeyCoordinates,
    credentialId: credentialId,
    authDataHex: authDataHex,
    clientDataHex: clientDataHex,
    challengeOffset: challengeOffset,
    authenticatorDataFlagMask: 0x05,
  });
});

router.post("/passkey/execute", async (req, res) => {
  const { authenticatorData, clientData, signature } = req.body;

  if (!authenticatorData || !clientData || !signature) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  const authDataBuffer = utils.bufferFromBase64(authenticatorData);
  const clientDataBuffer = utils.bufferFromBase64(clientData);

  const challengeOffset =
    clientDataBuffer.indexOf("226368616c6c656e6765223a", 0, "hex") + 12 + 1;

  const authDataHex = utils.bufferToHex(authDataBuffer);
  const clientDataHex = utils.bufferToHex(clientDataBuffer);

  const message = await utils.computeMessage(authDataHex, clientDataHex);

  const signatureArray = await utils.derToRawSignature(
    utils.bufferFromBase64(signature)
  );
  const signatureHex = {
    hex: ethers.utils.hexlify(signatureArray),
  };

  return res.json({
    authDataHex,
    clientDataHex,
    signatureHex,
    messageHex: message,
  });
});

router.post("/recovery/inputs", async (req, res) => {
  const { signature, message } = req.body;

  if (!signature || !message) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  const pubKey_uncompressed = ethers.utils.recoverPublicKey(
    ethers.utils.hashMessage(ethers.utils.toUtf8Bytes(message)),
    signature
  );

  let pubKey = pubKey_uncompressed.slice(4);
  let pub_key_x = pubKey.substring(0, 64);
  let pub_key_y = pubKey.substring(64, 128);

  const signatureHex = await utils.getSignature(signature);
  const signatureArray = utils.getArray(signatureHex);
  const messageArray = ethers.utils.arrayify(
    ethers.utils.hashMessage(ethers.utils.toUtf8Bytes(message))
  );

  res.json({
    pub_key_x: pub_key_x,
    pub_key_y: pub_key_y,
    signature: Array.from(signatureArray),
    message: Array.from(messageArray),
  });
});

module.exports = router;
