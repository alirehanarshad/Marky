import "./globals.css";
import AppLayout from "@/components/AppLayout";
import { Plus_Jakarta_Sans } from "next/font/google";

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-plus-jakarta",
});

export const metadata = {
  title: "Marky — Marketing Intelligence & Strategy Command",
  description: "Marky: Senior AI Marketing Consultant and Autonomous Marketing Intelligence Platform.",
  icons: {
    icon: "/marky-avatar.png",
    shortcut: "/favicon.ico",
    apple: "/marky-avatar.png",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`h-full bg-[#FCFBFA] antialiased ${plusJakartaSans.variable}`}>
      <body className="h-full m-0 p-0 overflow-hidden font-sans text-slate-900 bg-[#FCFBFA]">
        <AppLayout>{children}</AppLayout>
      </body>
    </html>
  );
}
