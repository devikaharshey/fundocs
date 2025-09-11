import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/ui/Navbar";
import { AuthProvider } from "@/context/AuthContext";
import Footer from "@/components/ui/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "FunDocs",
  description: "Turn boring docs into fun, interactive journeys 🚀",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${inter.variable} bg-[#121212] text-white antialiased min-h-screen flex flex-col`}
      >
        <Navbar />

        <AuthProvider>
          <main className="flex-1">{children}</main>
        </AuthProvider>

        <Footer />
      </body>
    </html>
  );
}
