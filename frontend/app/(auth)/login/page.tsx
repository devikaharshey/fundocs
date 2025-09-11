"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { motion } from "framer-motion";
import Link from "next/link";
import LoginForm from "@/components/auth-ui/LoginForm";
import { Toaster } from "sonner";

export default function LoginPage() {
  const router = useRouter();

  useEffect(() => {
    const checkSession = async () => {
      try {
        const user = await account.get();
        if (user) {
          router.replace("/profile");
        }
      } catch {
        // no active session
      }
    };

    checkSession();
  }, [router]);

  return (
    <div className="relative font-sans w-full min-h-screen flex flex-col items-center justify-center px-4 sm:px-6 bg-gray-900">
      <Toaster position="top-right" richColors />
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <motion.div
        className="w-full max-w-md p-8 rounded-2xl shadow-soft bg-gray-800 border border-gray-700 relative z-10"
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <h1 className="text-3xl font-extrabold text-primary mb-6 text-center">
          Welcome Back
        </h1>

        <LoginForm />

        <p className="mt-6 text-sm text-center text-gray-400">
          Don’t have an account?{" "}
          <Link href="/signup" className="text-primary hover:underline">
            Sign up
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
