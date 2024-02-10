"use client";
import useWalletData from "@/hooks/useWalletData";
import { useEffect } from "react";
import { useSelector } from "react-redux";
import useSavings from "@/hooks/useSavings";

export default function WalletProvider({ children }) {
  const walletAddress = useSelector((state) => state.user.user.pubKey);
  const { fetchBalance, fetchPrice, fetchTransactions } = useWalletData();
  const { fetchSavings } = useSavings();
  var currentTimeout = null;

  useEffect(() => {
    if (walletAddress) {
      fetchBalance(walletAddress);
      fetchPrice();
      fetchTransactions(walletAddress);
      fetchSavings(walletAddress);
    }
  }, [walletAddress]);

  useEffect(() => {
    currentTimeout = setInterval(() => {
      fetchPrice();
      if (walletAddress) {
        fetchBalance(walletAddress);
        fetchTransactions(walletAddress);
        fetchSavings(walletAddress);
        // mintSummaryNFT(walletAddress);
      }
    }, 10000);

    return () => {
      clearInterval(currentTimeout);
    };
  }, []);

  return <>{children}</>;
}
