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

  const getPublicKeys = async (address) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const luna = new Contract(address, LunaABI, provider);

      const publicKeys = await luna.getPublicKey();

      return publicKeys;
    } catch (e) {
      throw new Error(e);
    }
  };

  const verifyPasskey = async (address, proof, message) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const luna = new Contract(address, LunaABI, provider);

      const verified = await luna.verifyPasskey(proof, message);

      return verified;
    } catch (e) {
      throw new Error(e);
    }
  };

  const getEmail = async (address) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const luna = new Contract(address, LunaABI, provider);

      const email = await luna.email();

      return email;
    } catch (e) {
      return false;
    }
  };

  const verifyEmail = async (address, proof) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const luna = new Contract(address, LunaABI, provider);

      const isVerified = await luna.verifyRecovery(proof);

      return isVerified;
    } catch (e) {
      return false;
    }
  };

  return {
    isValidLuna,
    getLunaAddress,
    getCredentialId,
    getNonce,
    getPublicKeys,
    verifyPasskey,
    getEmail,
    verifyEmail,
  };
}
