"use client";

import { Urbanist } from "next/font/google";
import { useDispatch, useSelector } from "react-redux";
import { setStep } from "@/redux/slice/signupSlice";
import { Button } from "@material-tailwind/react";
import { Check, Fingerprint, Info, Loader2 } from "lucide-react";
import useSignup from "@/hooks/useSignup";
import { useState } from "react";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

export default function Step1() {
  const dispatch = useDispatch();
  const { handlePasskey } = useSignup();
  const [isLoading, setIsLoading] = useState(false);
  const passkey = useSelector((state) => state.signup.passkey);

  const handlePasskeyClick = async () => {
    try {
      setIsLoading(true);
      await handlePasskey();
      setIsLoading(false);
    } catch (e) {
      console.error(e);
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        color="white"
        className="w-full flex h-[5.7rem] px-3 border-[1px] bg-white border-black rounded-xl"
        onClick={handlePasskeyClick}
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
                ? "Add a passkey"
                : "Loading"
              : "Passkey added"}
          </h1>
          <p className="text-xs font-normal text-gray-500">
            {!passkey
              ? !isLoading
                ? "This will be used to execute transactions"
                : "Please wait while we generate your passkey."
              : "Passkey added successfully"}
          </p>
        </div>
      </Button>

      <Button
        variant="gradient"
        fullWidth
        className={urbanist.className + " mt-1"}
        onClick={() => {
          dispatch(setStep(2));
        }}
        disabled={!passkey || isLoading}
      >
        Next
      </Button>
    </>
  );
}
