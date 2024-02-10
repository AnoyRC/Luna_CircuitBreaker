const express = require("express");
const router = express.Router();
require("dotenv").config();
const ethers = require("ethers");
const utils = require("../../lib/utils");

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

  const signatureHex = await utils.getSignature(signature);

  return res.json({
    authDataHex,
    clientDataHex,
    signatureHex,
    messageHex: message,
  });
});

module.exports = router;
