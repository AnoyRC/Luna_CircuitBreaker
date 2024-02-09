"use client";

import { useDispatch, useSelector } from "react-redux";
import { Fingerprint, Loader2, Check } from "lucide-react";
import { Urbanist } from "next/font/google";
import { setStep } from "@/redux/slice/transferSlice";
import { Button } from "@material-tailwind/react";
import useTransfer from "@/hooks/useTransfer";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

export default function Step0() {
  const isLoading = useSelector((state) => state.transfer.isLoading);
  const passkey = useSelector((state) => state.transfer.passkey);
  const { handlePasskey } = useTransfer();
  const dispatch = useDispatch();

  return (
    <>
      <Button
        color="white"
        className="w-full flex h-[5.7rem] px-3 border-[1px] bg-white border-black rounded-xl"
        onClick={handlePasskey}
        disabled={isLoading || passkey}
      >
        <div className="flex items-center h-full bg-black/90 rounded-lg w-16 justify-center">
          {!passkey ? (
            !isLoading ? (
              <Fingerprint className="h-5 w-5 text-white" />
            ) : (
              <Loader2 className="h-5 w-5 animate-spin text-white" />
            )
          ) : (
            <Check className="h-5 w-5 text-white" />
          )}
        </div>

        <div
          className={
            "flex flex-col ml-3 text-start h-full justify-center normal-case w-56 " +
            urbanist.className
          }
        >
          <h1 className="text-xl">
            {!passkey
              ? !isLoading
                ? "Passkey Required"
                : "Loading"
              : "Passkey added"}
          </h1>
          <p className="text-xs font-normal text-gray-500">
            {!passkey
              ? !isLoading
                ? "You need a passkey to continue."
                : "Please wait.."
              : "Passkey added successfully"}
          </p>
        </div>
      </Button>

      <Button
        variant="gradient"
        fullWidth
        className={urbanist.className + " mt-1"}
        onClick={() => {
          dispatch(setStep(1));
        }}
        disabled={!passkey || isLoading}
      >
        Next
      </Button>
    </>
  );
}
