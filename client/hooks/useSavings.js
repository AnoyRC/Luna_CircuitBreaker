"use client";

import { LunaFactory, LunaSavingManager } from "@/lib/abis/AddressManager";
import { ethers } from "ethers";
import LunaSavingManagerABI from "@/lib/abis/LunaSavingManager.json";
import { useDispatch, useSelector } from "react-redux";
import { setNfts, setSavings } from "@/redux/slice/dataSlice";
import { setIsLoading, handleDialog } from "@/redux/slice/startSavingSlice";
import { client } from "@passwordless-id/webauthn";
import useLuna from "./useLuna";
import axios from "axios";
import useCircuits from "./useCircuits";
import { toast } from "sonner";
import { v4 } from "uuid";
import useRelay from "./useRelay";
import LunaFactoryABI from "@/lib/abis/LunaFactory.json";
import { setIsLoading as setLoading } from "@/redux/slice/savingSlice";

export default function useSavings() {
  const dispatch = useDispatch();
  const address = useSelector((state) => state.user.user.pubKey);
  const name = useSelector((state) => state.user.user.username);
  const { passkey_prove } = useCircuits();
  const { getCredentialId, getPublicKeys, verifyPasskey } = useLuna();
  const { execute } = useRelay();

  const fetchSavings = async (address) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const contract = new ethers.Contract(
        LunaSavingManager,
        LunaSavingManagerABI,
        provider
      );

      const details = await contract.accounts(address);
      dispatch(setSavings(details));
    } catch (err) {
      console.log(err);
      dispatch(setSavings(null));
    }
  };

  const enableSaving = async (time) => {
    dispatch(setIsLoading(true));
    try {
      const credentialId = await getCredentialId(address);

      const randomMessage = v4();

      console.log(randomMessage);

      const passkey = await client.authenticate([credentialId], randomMessage, {
        authenticatorType: "auto",
        userVerification: "required",
        timeout: 60000,
      });

      const publicKeys = await getPublicKeys(address);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/utils/passkey/execute`,
        {
          authenticatorData: passkey.authenticatorData,
          clientData: passkey.clientData,
          signature: passkey.signature,
        }
      );

      const proof = await passkey_prove(
        publicKeys[0],
        publicKeys[1],
        response.data.signatureHex.hex,
        response.data.messageHex
      );

      const verified = await verifyPasskey(
        address,
        proof,
        response.data.messageHex
      );

      if (!verified) {
        toast.error("Something went wrong!");
        dispatch(setIsLoading(false));
        return false;
      }

      let unixTime;

      if (time === "1 Day") {
        unixTime = new Date().getTime() + 86400000;
      } else if (time === "1 Week") {
        unixTime = new Date().getTime() + 604800000;
      } else {
        unixTime = new Date().getTime() + 2592000000;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const SavingContracts = new ethers.Contract(
        LunaSavingManager,
        LunaSavingManagerABI,
        provider
      );

      const data = SavingContracts.interface.encodeFunctionData(
        "startAccount",
        [(unixTime / 1000).toFixed(0)]
      );

      const factory = new ethers.Contract(
        LunaFactory,
        LunaFactoryABI,
        provider
      );

      const payload = factory.interface.encodeFunctionData("executeLunaTx", [
        name + "@luna",
        proof,
        response.data.messageHex,
        LunaSavingManager,
        0,
        data,
      ]);

      const txId = await execute(payload);

      console.log(txId);

      dispatch(setIsLoading(false));
      dispatch(handleDialog());
      toast.success("Saving enabled");
      fetchSavings(address);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong!");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const redeemSaving = async () => {
    dispatch(setLoading(true));
    try {
      const credentialId = await getCredentialId(address);

      const randomMessage = v4();

      console.log(randomMessage);

      const passkey = await client.authenticate([credentialId], randomMessage, {
        authenticatorType: "auto",
        userVerification: "required",
        timeout: 60000,
      });

      const publicKeys = await getPublicKeys(address);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/utils/passkey/execute`,
        {
          authenticatorData: passkey.authenticatorData,
          clientData: passkey.clientData,
          signature: passkey.signature,
        }
      );

      const proof = await passkey_prove(
        publicKeys[0],
        publicKeys[1],
        response.data.signatureHex.hex,
        response.data.messageHex
      );

      const verified = await verifyPasskey(
        address,
        proof,
        response.data.messageHex
      );

      if (!verified) {
        toast.error("Something went wrong!");
        dispatch(setIsLoading(false));
        return false;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const SavingContracts = new ethers.Contract(
        LunaSavingManager,
        LunaSavingManagerABI,
        provider
      );

      const data = SavingContracts.interface.encodeFunctionData("redeem");

      const factory = new ethers.Contract(
        LunaFactory,
        LunaFactoryABI,
        provider
      );

      const payload = factory.interface.encodeFunctionData("executeLunaTx", [
        name + "@luna",
        proof,
        response.data.messageHex,
        LunaSavingManager,
        0,
        data,
      ]);

      const txId = await execute(payload);

      console.log(txId);

      toast.success("Saving Redeemed");
      fetchSavings(address);
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  const mintSummaryNFT = async () => {
    dispatch(setLoading(true));
    try {
      const credentialId = await getCredentialId(address);

      const randomMessage = v4();

      console.log(randomMessage);

      const passkey = await client.authenticate([credentialId], randomMessage, {
        authenticatorType: "auto",
        userVerification: "required",
        timeout: 60000,
      });

      const publicKeys = await getPublicKeys(address);

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/utils/passkey/execute`,
        {
          authenticatorData: passkey.authenticatorData,
          clientData: passkey.clientData,
          signature: passkey.signature,
        }
      );

      const proof = await passkey_prove(
        publicKeys[0],
        publicKeys[1],
        response.data.signatureHex.hex,
        response.data.messageHex
      );

      const verified = await verifyPasskey(
        address,
        proof,
        response.data.messageHex
      );

      if (!verified) {
        toast.error("Something went wrong!");
        dispatch(setIsLoading(false));
        return false;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const SavingContracts = new ethers.Contract(
        LunaSavingManager,
        LunaSavingManagerABI,
        provider
      );

      const details = await SavingContracts.accounts(address);

      if (
        details[0].toNumber() === 0 ||
        details[2].toNumber() === 0 ||
        details[1].toNumber() + 86400 > new Date().getTime() / 1000
      ) {
        const nfts = await SavingContracts.getAllNFTs(address);
        dispatch(setNfts(nfts));
        return;
      }

      const data = SavingContracts.interface.encodeFunctionData(
        "mintWeeklyNFT",
        [address]
      );

      const factory = new ethers.Contract(
        LunaFactory,
        LunaFactoryABI,
        provider
      );

      const payload = factory.interface.encodeFunctionData("executeLunaTx", [
        name + "@luna",
        proof,
        response.data.messageHex,
        LunaSavingManager,
        0,
        data,
      ]);

      const txId = await execute(payload);

      console.log(txId);

      const nfts = await SavingContracts.getAllNFTs(address);
      dispatch(setNfts(nfts));
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return { fetchSavings, enableSaving, redeemSaving, mintSummaryNFT };
}
