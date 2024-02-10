"use client";

import { client } from "@passwordless-id/webauthn";
import { useDispatch, useSelector } from "react-redux";
import useLuna from "./useLuna";
import { setIsLoading, setPasskey } from "@/redux/slice/transferSlice";
import { toast } from "sonner";
import { v4 } from "uuid";
import axios from "axios";
import useCircuits from "./useCircuits";

export default function useTransfer() {
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state.user.user.pubKey);
  const { getCredentialId, getPublicKeys, verifyPasskey } = useLuna();
  const passkey = useSelector((state) => state.transfer.passkey);
  const { passkey_prove } = useCircuits();

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

    const isVerified = await verifyPasskey(
      walletAddress,
      proof,
      response.data.messageHex
    );
    console.log(isVerified);
  };

  return { handlePasskey, handleTransfer };
}
