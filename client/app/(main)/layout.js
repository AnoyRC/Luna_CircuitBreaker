// import ForgotPassword from "@/components/modal/ForgotPassword";

export default function LandingLayout({ children }) {
  return (
    <div className="h-screen max-h-screen w-screen relative bg-white overflow-hidden flex flex-col items-center">
      {children}
      {/* <ForgotPassword /> */}
    </div>
  );
}
