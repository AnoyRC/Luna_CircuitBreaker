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

  const getCredentialId = async (address) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const luna = new Contract(address, LunaABI, provider);

      const credentialId = await luna.getCredentialId();

      return credentialId;
    } catch (e) {
      throw new Error(e);
    }
  };

  const getNonce = async (address) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const luna = new Contract(address, LunaABI, provider);

      const nonce = await luna.getNonce();

      return nonce;
    } catch (e) {
      throw new Error(e);
    }
  };

  return { isValidLuna, getLunaAddress, getCredentialId, getNonce };
}
