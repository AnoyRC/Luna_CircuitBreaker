"use client";

import { Urbanist } from "next/font/google";
import {
  Dialog,
  Card,
  CardBody,
  CardFooter,
  Typography,
  CardHeader,
  Stepper,
  Step,
} from "@material-tailwind/react";
import { useDispatch, useSelector } from "react-redux";
import { toggleTransferModal } from "@/redux/slice/modalSlice";
import Image from "next/image";
import { Bolt, Fingerprint, MapPin, Send } from "lucide-react";
import {
  setAddress,
  setAmount,
  setDomain,
  setPasskey,
  setStep,
} from "@/redux/slice/transferSlice";
import Step0 from "./transfer/Step0";
import Step1 from "./transfer/Step1";
import Step2 from "./transfer/Step2";
import Step3 from "./transfer/Step3";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

const TransferModal = () => {
  const dispatch = useDispatch();
  const open = useSelector((state) => state.modal.transferModal);
  const step = useSelector((state) => state.transfer.step);
  const isLoading = useSelector((state) => state.transfer.isLoading);

  const handleOpen = () => {
    dispatch(toggleTransferModal(false));
  };

  return (
    <>
      <Dialog size="xs" open={open} className="bg-transparent shadow-none">
        <div className="h-full w-full flex flex-col justify-center bg-white rounded-3xl pt-20 pb-5 items-center relative">
          <Card className="w-96 shadow-none bg-transparent">
            <CardHeader className="bg-transparent flex justify-center shadow-none">
              <Image
                src="/main/logo.png"
                alt="Celestial"
                width={140}
                height={140}
                className="mb-3"
              />
            </CardHeader>

            <CardBody className="flex flex-col gap-4 -mt-2">
              <Stepper activeStep={step} className="mb-3">
                <Step className="">
                  <Fingerprint className="h-5 w-5" />
                </Step>
                <Step className="">
                  <MapPin className="h-5 w-5" />
                </Step>
                <Step className="">
                  <Bolt className="h-5 w-5" />
                </Step>
                <Step className="">
                  <Send className="h-5 w-5" />
                </Step>
              </Stepper>

              {step === 0 && <Step0 />}
              {step === 1 && <Step1 />}
              {step === 2 && <Step2 />}
              {step === 3 && <Step3 />}
            </CardBody>

            <CardFooter className="pt-0 -mt-7">
              {!isLoading && (
                <Typography
                  variant="small"
                  className={"mt-4 flex justify-center " + urbanist.className}
                >
                  Back to
                  <Typography
                    variant="small"
                    color="blue-gray"
                    className={
                      "ml-1 font-bold hover:cursor-pointer " +
                      urbanist.className
                    }
                    onClick={() => {
                      handleOpen();
                      dispatch(setStep(0));
                      dispatch(setAmount(""));
                      dispatch(setAddress(""));
                      dispatch(setDomain(""));
                      dispatch(setPasskey(null));
                    }}
                  >
                    Dashboard
                  </Typography>
                </Typography>
              )}
            </CardFooter>
          </Card>
        </div>
      </Dialog>
    </>
  );
};

export default TransferModal;
