"use client";

import { Noir } from "@noir-lang/noir_js";
import { BarretenbergBackend } from "@noir-lang/backend_barretenberg";
import { ethers } from "ethers";
import poseidon_hash from "@/lib/circuits/poseidon_hash";

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

  return { hashInput };
}
