"use client";
import {
  setIsLoading,
  setName,
  setPasskey,
  setStep,
} from "@/redux/slice/signupSlice";
import { client } from "@passwordless-id/webauthn";
import axios from "axios";
import { ethers } from "ethers";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import useCircuits from "./useCircuits";
import useRelay from "./useRelay";
import { useRouter } from "next/navigation";
import { Magic } from "magic-sdk";
import { LunaFactory } from "@/lib/abis/AddressManager";
import LunaFactoryABI from "@/lib/abis/LunaFactory.json";
import useLuna from "./useLuna";
import { updatePubkey, updateUsername } from "@/redux/slice/userSlice";

export default function useSignup() {
  const dispatch = useDispatch();
  const { hashInput } = useCircuits();
  const { execute } = useRelay();
  const router = useRouter();
  const passkey = useSelector((state) => state.signup.passkey);
  const name = useSelector((state) => state.signup.name);
  const { getLunaAddress } = useLuna();

  const handlePasskey = async () => {
    const challenge = "LUNA_SIGNIN";

    const registration = await client.register("Luna", challenge, {
      authenticatorType: "auto",
      userVerification: "discouraged",
      timeout: 60000,
      attestation: false,
      debug: false,
    });

    console.log(registration);

    dispatch(setPasskey(registration));
  };

  const handleSignup = async (email) => {
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

      const signature = await signer.signMessage("Celestial_New_User_Sign_Up");

      const pubKey_uncompressed = ethers.utils.recoverPublicKey(
        ethers.utils.hashMessage(
          ethers.utils.toUtf8Bytes("Celestial_New_User_Sign_Up")
        ),
        signature
      );

      let pubKey = pubKey_uncompressed.slice(4);
      let pub_key_x = pubKey.substring(0, 64);

      const recovery_hash = await hashInput("0x" + pub_key_x);

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
        "createAccount",
        [name + "@luna", passkey_inputs, recovery_hash, email, 1]
      );

      const txId = await execute(data);

      console.log(txId);

      toast.success("Account created!");

      const lunaAddress = await getLunaAddress(name);
      dispatch(updatePubkey(lunaAddress));
      dispatch(updateUsername(name + "@luna"));
      dispatch(setStep(0));
      dispatch(setName(""));
      dispatch(setPasskey(null));

      router.push("/dashboard");

      dispatch(setIsLoading(false));
    } catch (e) {
      console.error(e);
      dispatch(setIsLoading(false));
      toast.error("Something went wrong!");
    }
  };

  return { handlePasskey, handleSignup };
}
