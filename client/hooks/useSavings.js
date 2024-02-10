"use client";

import { LunaSavingManager } from "@/lib/abis/AddressManager";
import { ethers } from "ethers";
import LunaSavingManagerABI from "@/lib/abis/LunaSavingManager.json";
import { useDispatch } from "react-redux";
import { setSavings } from "@/redux/slice/dataSlice";

export default function useSavings() {
  const dispatch = useDispatch();

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

  return { fetchSavings };
}
