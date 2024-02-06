const express = require("express");
const router = express.Router();
require("dotenv").config();
const ethers = require("ethers");
const utils = require("../../lib/utils");
const { Noir } = require("@noir-lang/noir_js");
const { BarretenbergBackend } = require("@noir-lang/backend_barretenberg");
const poseidonHash = require("../../lib/poseidon_hash.json");

router.post("/passkey/inputs", async (req, res) => {
  const { pubkey, credentialId, authenticatorData, clientData } = req.body;

  if (!pubkey || !credentialId || !authenticatorData || !clientData) {
    return res.status(400).json({ msg: "Please enter all fields" });
  }

  const backend = new BarretenbergBackend(poseidonHash);
  const noir = new Noir(poseidonHash, backend);

  const authDataBuffer = utils.bufferFromBase64(authenticatorData);
  const clientDataBuffer = utils.bufferFromBase64(clientData);

  const challengeOffset =
    clientDataBuffer.indexOf("226368616c6c656e6765223a", 0, "hex") + 12 + 1;

  const authDataHex = utils.bufferToHex(authDataBuffer);
  const clientDataHex = utils.bufferToHex(clientDataBuffer);

  const pubKeyCoordinates = await utils.getCordinates(pubkey);

  const pubkey_x_hash = await noir.execute({
    input: Array.from(ethers.utils.arrayify(pubKeyCoordinates[0])),
  });

  const abiCoder = new ethers.utils.AbiCoder();

  const inputs = abiCoder.encode(
    ["bytes32", "string", "bytes", "bytes1", "bytes", "uint"],
    [
      pubkey_x_hash.returnValue,
      credentialId,
      authDataHex,
      0x05,
      clientDataHex,
      challengeOffset,
    ]
  );

  res.json({
    inputs: inputs,
    pubKeyCoordinates: pubKeyCoordinates,
    pubkey_x_hash: pubkey_x_hash.returnValue,
    credentialId: credentialId,
    authDataHex: authDataHex,
    clientDataHex: clientDataHex,
    challengeOffset: challengeOffset,
  });
});

module.exports = router;
