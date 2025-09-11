"use client";

import { useEffect, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { account } from "@/lib/appwrite";
import { motion } from "framer-motion";
import { Loader2 } from "lucide-react";
import { toast, Toaster } from "sonner";

export default function VerifyPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<
    "pending" | "loading" | "success" | "error"
  >("pending");

  useEffect(() => {
    const checkUser = async () => {
      try {
        // Check if user is logged in
        const user = await account.get();
        if (!user) {
          router.replace("/signup");
          return;
        }

        const mode = searchParams.get("mode");
        const userId = searchParams.get("userId");
        const secret = searchParams.get("secret");

        // If already verified → profile
        if (user.emailVerification) {
          setStatus("success");
          setTimeout(() => {
            router.push("/profile");
          }, 2000);
          return;
        }

        // Case 1: Just signed up → waiting for email
        if (mode === "pending") {
          setStatus("pending");
          return;
        }

        // Case 2: Email link clicked → verify
        if (userId && secret) {
          setStatus("loading");
          try {
            await account.updateVerification(userId, secret);
            setStatus("success");
            setTimeout(() => {
              router.push("/profile");
            }, 3000);
          } catch (err) {
            toast.error("Verification Error:" + (err as Error).message);
            setStatus("error");
          }
        }
      } catch {
        router.replace("/signup"); // no session found
      }
    };

    checkUser();
  }, [searchParams, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-background to-muted px-6">
      <Toaster position="top-center" richColors />
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-4xl font-bold tracking-tight mb-6 text-primary"
      >
        Email Verification
      </motion.h1>

      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 100, damping: 15 }}
        className="rounded-2xl shadow-lg bg-gray-800 p-8 w-full max-w-md text-center border border-gray-600"
      >
        {status === "pending" && (
          <div>
            <p className="text-lg font-medium text-white mb-2">
              📩 Check your inbox
            </p>
            <p className="text-muted-foreground">
              Please verify your email address using the link sent to your
              email.
            </p>
          </div>
        )}

        {status === "loading" && (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">
              Verifying your email, please wait...
            </p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-green-500 text-white text-3xl"
            >
              ✓
            </motion.div>
            <p className="text-lg font-medium text-green-500">
              Your email has been verified!
            </p>
            <p className="text-muted-foreground">
              Redirecting you to your profile...
            </p>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center gap-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 150, damping: 12 }}
              className="w-14 h-14 flex items-center justify-center rounded-full bg-red-500 text-white text-3xl"
            >
              !
            </motion.div>
            <p className="text-lg font-medium text-red-500">
              Verification failed
            </p>
            <p className="text-muted-foreground">
              The link may have expired or is invalid. Please request a new one.
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
