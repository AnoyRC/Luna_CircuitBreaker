"use client";
import { useDispatch, useSelector } from "react-redux";
import {
  handleDialog,
  setIsLoading,
  setPasskey,
  setProof,
  setSteps,
} from "@/redux/slice/forgotPasskeySlice";
import { toast } from "sonner";
import { Magic } from "magic-sdk";
import { ethers } from "ethers";
import axios from "axios";
import useCircuits from "./useCircuits";
import useLuna from "./useLuna";
import { client } from "@passwordless-id/webauthn";
import useRelay from "./useRelay";
import { LunaFactory } from "@/lib/abis/AddressManager";
import LunaFactoryABI from "@/lib/abis/LunaFactory.json";

export default function useForgotPasskey() {
  const { recovery_prove } = useCircuits();
  const { verifyEmail, getNonce } = useLuna();
  const walletAddress = useSelector((state) => state.user.user.pubKey);
  const dispatch = useDispatch();
  const name = useSelector((state) => state.user.user.username);
  const passkey = useSelector((state) => state.forgotPasskey.passkey);
  const { execute } = useRelay();
  const proof = useSelector((state) => state.forgotPasskey.proof);

  const verifyCurrentEmail = async (email) => {
    dispatch(setIsLoading(true));
    try {
      const magic = new Magic("pk_live_EC906C44C94A9773");
      await magic.auth.loginWithEmailOTP({ email });
      const userMetadata = await magic.user.isLoggedIn();
      if (!userMetadata) {
        dispatch(setIsLoading(false));
        toast.error("Validation failed!");
        return;
      }

      const provider = new ethers.providers.Web3Provider(magic.rpcProvider);
      const signer = provider.getSigner();

      const nonce = await getNonce(walletAddress);

      const signature = await signer.signMessage(nonce.toString());

      const body = {
        signature,
        message: nonce.toString(),
      };

      const res = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/utils/recovery/inputs`,
        body
      );

      const proof = await recovery_prove(
        "0x" + res.data.pub_key_x,
        "0x" + res.data.pub_key_y,
        Array.from(ethers.utils.arrayify(signature)),
        res.data.message
      );

      if (!proof) {
        dispatch(setIsLoading(false));
        toast.error("Error Verifying Email");
        return;
      }

      const isVerified = await verifyEmail(walletAddress, proof);

      if (!isVerified) {
        dispatch(setIsLoading(false));
        toast.error("Error Verifying Email");
        return;
      }

      dispatch(setProof(proof));
      dispatch(setIsLoading(false));
      dispatch(setSteps(1));
    } catch {
      dispatch(setIsLoading(false));
      toast.error("Something Went Wrong!");
      return;
    }
  };

  const handlePasskey = async () => {
    dispatch(setIsLoading(true));
    try {
      const challenge = "Luna_SIGNIN";

      const registration = await client.register(name + "@luna", challenge, {
        authenticatorType: "auto",
        userVerification: "discouraged",
        timeout: 60000,
        attestation: false,
        debug: false,
      });

      dispatch(setPasskey(registration));
      dispatch(setIsLoading(false));
    } catch {
      dispatch(setIsLoading(false));
      toast.error("Failed to create passkey!");
      return;
    }
  };

  const updatePasskey = async () => {
    dispatch(setIsLoading(true));
    try {
      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/utils/passkey/inputs`,
        {
          authenticatorData: passkey.authenticatorData,
          clientData: passkey.clientData,
          pubkey: passkey.credential.publicKey,
          credentialId: passkey.credential.id,
        }
      );

      const passkey_inputs = response.data.inputs;

      const dataProvider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const factoryContract = new ethers.Contract(
        LunaFactory,
        LunaFactoryABI,
        dataProvider
      );

      const data = factoryContract.interface.encodeFunctionData(
        "executeLunaPasskeyRecovery",
        [name + "@luna", proof, passkey_inputs]
      );

      const txId = await execute(data);

      console.log(txId);

      toast.success("Passkey updated successfully!");

      dispatch(setIsLoading(false));
      dispatch(setSteps(0));
      dispatch(setPasskey(null));
      dispatch(setProof(null));
      dispatch(handleDialog());
    } catch {
      dispatch(setIsLoading(false));
      toast.error("Failed to update passkey!");
      return;
    }
  };

  return {
    verifyCurrentEmail,
    handlePasskey,
    updatePasskey,
  };
}
