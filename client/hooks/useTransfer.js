"use client";

import { client } from "@passwordless-id/webauthn";
import { useDispatch, useSelector } from "react-redux";
import useLuna from "./useLuna";
import { setIsLoading, setPasskey } from "@/redux/slice/transferSlice";
import { toast } from "sonner";
import { ethers } from "ethers";

export default function useTransfer() {
  const dispatch = useDispatch();
  const walletAddress = useSelector((state) => state.user.user.pubKey);
  const { getCredentialId, getNonce } = useLuna();

  const handlePasskey = async () => {
    dispatch(setIsLoading(true));

    try {
      const credentialId = await getCredentialId(walletAddress);
      const nonce = await getNonce(walletAddress);

      const authentication = await client.authenticate(
        [credentialId],
        ethers.utils.sha256(ethers.utils.hexZeroPad(nonce._hex, 32)).toString(),
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
    const credentialId = await getCredentialId(walletAddress);
    const response = await navigator.credentials.get({
      credentialId: credentialId,
    });

    console.log(response);
  };

  return { handlePasskey, handleTransfer };
}
