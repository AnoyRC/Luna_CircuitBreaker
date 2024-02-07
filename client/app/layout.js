import { Urbanist } from "next/font/google";

import { store } from "@/redux/store";
import ReduxProvider from "@/providers/ReduxProvider";

import "./globals.css";
import { Toaster } from "sonner";

const urbanist = Urbanist({
  subsets: ["latin"],
  display: "swap",
});

export const metadata = {
  title: "Luna",
  description: "On-chain Non-Custodial Wallet",
  icons: {
    shortcut: [{ url: "/favicon.ico", sizes: "16x16", type: "image/ico" }],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={urbanist.className}>
        <ReduxProvider store={store}>
          <Toaster
            position="bottom-right"
            richColors
            closeButton
            style={{
              fontFamily: "var(--font-sans)",
              fontSize: "var(--text-sm)",
              fontWeight: "var(--font-semibold)",
              backgroundColor: "var(--bg-primary)",
              color: "var(--text-primary)",
            }}
          />
          {children}
        </ReduxProvider>
      </body>
    </html>
  );
}
