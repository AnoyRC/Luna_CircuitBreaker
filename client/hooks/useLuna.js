"use client";

import { Contract, ethers } from "ethers";
import { LunaFactory } from "@/lib/abis/AddressManager";
import LunaFactoryABI from "@/lib/abis/LunaFactory.json";
import LunaABI from "@/lib/abis/Luna.json";

export default function useLuna() {
  const isValidLuna = async (name) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const factory = new Contract(LunaFactory, LunaFactoryABI, provider);

      const lunaDetails = await factory.getLuna(name + "@luna");

      return lunaDetails.isUsed;
    } catch (e) {
      return false;
    }
  };

  const getLunaAddress = async (name) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const factory = new Contract(LunaFactory, LunaFactoryABI, provider);

      const lunaDetails = await factory.getLuna(name + "@luna");

      return lunaDetails.walletAddress;
    } catch (e) {
      return false;
    }
  };

  return { isValidLuna, getLunaAddress };
}
