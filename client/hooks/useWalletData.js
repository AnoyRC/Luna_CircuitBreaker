"use client";
import { ethers } from "ethers";
import axios from "axios";
import { useDispatch } from "react-redux";
import {
  setBalance,
  setEthPrice,
  setMarketData,
  setTransactions,
} from "@/redux/slice/dataSlice";
import {
  LunaFactory,
  PasskeyUltraVerifier,
  RecoveryUltraVerifier,
} from "@/lib/abis/AddressManager";

export default function useWalletData() {
  const dispatch = useDispatch();
  const fetchBalance = async (address) => {
    try {
      const provider = new ethers.providers.JsonRpcProvider(
        process.env.NEXT_PUBLIC_RPC_URL
      );
      const balance = await provider.getBalance(address);
      dispatch(setBalance(ethers.utils.formatEther(balance)));
    } catch (e) {
      dispatch(setBalance(0));
    }
  };

  const fetchPrice = async () => {
    try {
      const res = await axios.get(
        "https://optimism.blockscout.com/api/v2/stats/charts/market"
      );
      dispatch(setEthPrice(res.data.chart_data[0].closing_price));
      dispatch(setMarketData(res.data.chart_data));
    } catch (e) {
      dispatch(setEthPrice(0));
    }
  };

  const fetchTransactions = async (address) => {
    try {
      const res = await axios.get(
        `https://api-sepolia.scrollscan.com/api?module=account&action=txlist&address=${address}&page=1&offset=20`
      );

      const internalres = await axios.get(
        `https://api-sepolia.scrollscan.com/api?module=account&action=txlistinternal&address=${address}&page=1&offset=20`
      );

      const transactions = res.data.result.concat(internalres.data.result);
      transactions.sort((a, b) => b.timeStamp - a.timeStamp);
      const filteredTx = transactions.filter((tx) => {
        return tx.to !== null
          ? tx.to !== "0x9dc6640f365a266f5c43fc375b28583031c03dc9" &&
              tx.to !== PasskeyUltraVerifier.toLowerCase() &&
              tx.to !== RecoveryUltraVerifier.toLowerCase() &&
              tx.from !== LunaFactory.toLowerCase()
          : false;
      });
      dispatch(setTransactions(filteredTx));
    } catch (e) {
      dispatch(setTransactions([]));
    }
  };

  return { fetchBalance, fetchPrice, fetchTransactions };
}
