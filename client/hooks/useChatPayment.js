"use client";
import { LunaFactory, LunaSavingManager } from "@/lib/abis/AddressManager";
import { useSelector } from "react-redux";
import LunaFactoryABI from "@/lib/abis/LunaFactory.json";
import LunaSavingManagerABI from "@/lib/abis/LunaSavingManager.json";
import useCircuits from "./useCircuits";
import { ethers } from "ethers";
import useRelay from "./useRelay";
import { evaluateTotalAmount } from "@/lib/SavingEvaluater";
import useLuna from "./useLuna";
import { toast } from "sonner";
import axios from "axios";
import { v4 } from "uuid";
import { client } from "@passwordless-id/webauthn";

export default function useChatPayment() {
  const amount = useSelector((state) => state.data.paymentAmount);
  const balance = useSelector((state) => state.data.balance);
  const ethPrice = useSelector((state) => state.data.ethPrice);
  const savings = useSelector((state) => state.data.savings);
  const address = useSelector((state) => state.user.user.pubKey);
  const name = useSelector((state) => state.user.user.username);
  const selectedContact = useSelector(
    (state) => state.contacts.selectedContact
  );
  const recipient = selectedContact
    ? selectedContact.users[0] === address
      ? selectedContact.users[1]
      : selectedContact.users[0]
    : "";
  const { passkey_prove } = useCircuits();
  const { getCredentialId, getPublicKeys, verifyPasskey } = useLuna();
  const { execute } = useRelay();

  const handlePayment = async () => {
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
        return false;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );

      const factory = new ethers.Contract(
        LunaFactory,
        LunaFactoryABI,
        provider
      );

      const totalAmount = evaluateTotalAmount(Number(amount));

      const totalSavings = totalAmount - amount;

      let data;
      if (
        !savings ||
        savings[2] === 0 ||
        totalSavings <= 0 ||
        Number(totalSavings) + Number(amount) > balance * ethPrice
      ) {
        data = factory.interface.encodeFunctionData("executeLunaTx", [
          name + "@luna",
          proof,
          response.data.messageHex,
          recipient,
          ((amount / ethPrice) * 10 ** 18).toFixed(0),
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
            ((amount / ethPrice) * 10 ** 18).toFixed(0),
            ((totalSavings / ethPrice) * 10 ** 18).toFixed(0),
          ],
          ["0x", savingsData],
        ]);
      }

      const txId = await execute(data);

      console.log(txId);

      toast.success("Amount Transfered!");

      return true;
    } catch (err) {
      console.log(err);
      toast.error("Something went wrong!");
      return false;
    }
  };

  return { handlePayment };
}
