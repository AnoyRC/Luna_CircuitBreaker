"use client";

import { Noir } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { ethers } from "ethers";
import poseidon_hash from "@/lib/circuits/poseidon_hash";
import passkeyprove from "@/lib/circuits/passkey_prove";

export default function useCircuits() {
  const hashInput = async (input) => {
    const backend = new BarretenbergBackend(poseidon_hash, {
      threads: navigator.hardwareConcurrency,
    });

    const noir = new Noir(poseidon_hash, backend);

    const inputs = {
      input: Array.from(ethers.utils.arrayify(input)),
    };

    const output = await noir.execute(inputs);

    return output.returnValue;
  };

  const passkey_prove = async (pub_key_x, pub_key_y, signature, message) => {
    const backend = new BarretenbergBackend(passkeyprove, {
      threads: navigator.hardwareConcurrency,
    });

    const noir = new Noir(passkeyprove, backend);

    const inputs = {
      pub_key_x: Array.from(ethers.utils.arrayify(pub_key_x)),
      pub_key_y: Array.from(ethers.utils.arrayify(pub_key_y)),
      signature: Array.from(ethers.utils.arrayify(signature)),
      message: Array.from(ethers.utils.arrayify(message)),
    };

    console.log(JSON.stringify(inputs));

    const output = await noir.generateFinalProof(inputs);

    return ethers.utils.hexlify(output.proof);
  };

  return { hashInput, passkey_prove };
}
