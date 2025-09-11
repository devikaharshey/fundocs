"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { motion } from "framer-motion";
import Link from "next/link";
import SignupForm from "@/components/auth-ui/SignupForm";
import { Toaster } from "sonner";

export default function SignupPage() {
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
          Create Your Account
        </h1>

        <SignupForm />

        <p className="mt-6 text-sm text-center text-gray-400">
          Already have an account?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
