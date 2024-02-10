"use client";

import { client } from "@passwordless-id/webauthn";
import { useDispatch, useSelector } from "react-redux";
import useLuna from "./useLuna";
import {
  setAddress,
  setAmount,
  setDomain,
  setIsLoading,
  setPasskey,
  setStep,
} from "@/redux/slice/transferSlice";
import { toast } from "sonner";
import { v4 } from "uuid";
import axios from "axios";
import useCircuits from "./useCircuits";
import { ethers } from "ethers";
import { LunaFactory, LunaSavingManager } from "@/lib/abis/AddressManager";
import LunaFactoryABI from "@/lib/abis/LunaFactory.json";
import LunaSavingManagerABI from "@/lib/abis/LunaSavingManager.json";
import { toggleTransferModal } from "@/redux/slice/modalSlice";
import { evaluateTotalAmount } from "@/lib/SavingEvaluater";
import useRelay from "./useRelay";
import useWalletData from "./useWalletData";
import useSavings from "./useSavings";

export default function useTransfer() {
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state.user.user.pubKey);
  const name = useSelector((state) => state.user.user.username);
  const { getCredentialId, getPublicKeys, verifyPasskey } = useLuna();
  const passkey = useSelector((state) => state.transfer.passkey);
  const { passkey_prove } = useCircuits();
  const savings = useSelector((state) => state.data.savings);
  const ethPrice = useSelector((state) => state.data.ethPrice);
  const balance = useSelector((state) => state.data.balance);
  const amount = useSelector((state) => state.transfer.amount);
  const recipient = useSelector((state) => state.transfer.address);
  const { fetchBalance, fetchTransactions } = useWalletData();
  const { fetchSavings } = useSavings();
  const { execute } = useRelay();

  const handlePasskey = async () => {
    dispatch(setIsLoading(true));

    try {
      const credentialId = await getCredentialId(walletAddress);

      const randomMessage = v4();

      console.log(randomMessage);

      const authentication = await client.authenticate(
        [credentialId],
        randomMessage,
        {
          authenticatorType: "auto",
          userVerification: "required",
          timeout: 60000,
        }
      );

      dispatch(setPasskey(authentication));
      toast.success("Passkey added successfully.");
    } catch (e) {
      toast.error("An error occurred. Please try again.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  const handleTransfer = async () => {
    dispatch(setIsLoading(true));
    try {
      const publicKeys = await getPublicKeys(walletAddress);

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
        walletAddress,
        proof,
        response.data.messageHex
      );

      if (!verified) {
        toast.error("Passkey verification failed. Please try again.");
        return;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const factory = new ethers.Contract(
        LunaFactory,
        LunaFactoryABI,
        provider
      );

      const amountInDollars = amount * ethPrice;
      const totalAmount = evaluateTotalAmount(amountInDollars);

      const totalSavings = totalAmount - amountInDollars;

      let data;
      if (
        !savings ||
        savings[2] === 0 ||
        totalSavings <= 0 ||
        totalSavings + amountInDollars > balance * ethPrice
      ) {
        data = factory.interface.encodeFunctionData("executeLunaTx", [
          name + "@luna",
          proof,
          response.data.messageHex,
          recipient,
          (amount * 10 ** 18).toFixed(0),
          "0x",
        ]);
      } else {
        const savingContract = new ethers.Contract(
          LunaSavingManager,
          LunaSavingManagerABI,
          provider
        );

        const savingsData = savingContract.interface.encodeFunctionData(
          "deposit",
          []
        );

        data = factory.interface.encodeFunctionData("executeLunaBatchTx", [
          name + "@luna",
          proof,
          response.data.messageHex,
          [recipient, LunaSavingManager],
          [
            (amount * 10 ** 18).toFixed(0),
            ((totalSavings / ethPrice) * 10 ** 18).toFixed(0),
          ],
          ["0x", savingsData],
        ]);
      }

      const txId = await execute(data);

      console.log(txId);

      toast.success("Amount Transfered!");

      dispatch(setStep(0));
      dispatch(setDomain(""));
      dispatch(setAmount(0));
      dispatch(setAddress(""));
      dispatch(setIsLoading(false));
      dispatch(toggleTransferModal(false));
      dispatch(setPasskey(null));
      fetchBalance(walletAddress);
      fetchTransactions(walletAddress);
      fetchSavings(walletAddress);
    } catch (e) {
      console.log(e);
      dispatch(setStep(0));
      dispatch(setDomain(""));
      dispatch(setAmount(0));
      dispatch(setAddress(""));
      dispatch(setIsLoading(false));
      dispatch(toggleTransferModal(false));
      dispatch(setPasskey(null));
      toast.error("An error occurred. Please try again.");
    } finally {
      dispatch(setIsLoading(false));
    }
  };

  return { handlePasskey, handleTransfer };
}
