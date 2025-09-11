"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { account } from "@/lib/appwrite";
import { Models } from "appwrite";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CustomConfirm } from "@/components/ui/CustomConfirm";

interface AuthContextType {
  user: Models.User<Models.Preferences> | null;
  loading: boolean;
  signup: (
    email: string,
    password: string,
    name?: string,
    avatarFileId?: string
  ) => Promise<void>;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteAccount: () => void;
}

const FRONTEND_URL =
  process.env.NEXT_PUBLIC_FRONTEND_URL || "http://localhost:3000";
const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [user, setUser] = useState<Models.User<Models.Preferences> | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  const [showConfirm, setShowConfirm] = useState(false);
  const [confirmCallback, setConfirmCallback] = useState<() => void>(() => {});

  useEffect(() => {
    const checkUser = async () => {
      try {
        const current = await account.get();
        setUser(current);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    };
    checkUser();
  }, []);

  const signup = async (
    email: string,
    password: string,
    name?: string,
    avatarFileId?: string
  ) => {
    try {
      await account.create("unique()", email, password, name);

      await account.createEmailPasswordSession(email, password);

      if (avatarFileId) {
        await account.updatePrefs({ avatar: avatarFileId });
      }

      await account.createVerification(`${FRONTEND_URL}/verify`);

      router.push("/verify?mode=pending");

      const current = await account.get();
      setUser(current);

      toast.success("Account created! Please check your email to verify.");
    } catch (err: unknown) {
      console.error("Signup Error:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Signup failed");
      } else {
        toast.error("Signup failed");
      }
    }
  };

  const login = async (email: string, password: string) => {
    try {
      await account.createEmailPasswordSession(email, password);
      const current = await account.get();
      setUser(current);
      toast.success("Logged in successfully!");
      router.push("/profile");
    } catch (err: unknown) {
      console.error("Login Error:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Login failed");
      } else {
        toast.error("Login failed");
      }
    }
  };

  const logout = async () => {
    try {
      await account.deleteSession("current");
      setUser(null);
      toast.success("Logged out successfully!");
      router.push("/login");
    } catch (err: unknown) {
      console.error("Logout Error:", err);
      if (err instanceof Error) {
        toast.error(err.message || "Logout failed");
      } else {
        toast.error("Logout failed");
      }
    }
  };

  const deleteAccount = () => {
    if (!user) return;

    setConfirmCallback(() => async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/delete-account`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId: user.$id }),
        });

        const data = await res.json();

        if (!res.ok) {
          console.error("Delete failed:", data);
          toast.error(data?.error || "Failed to delete account");
          return;
        }

        setUser(null);
        toast.success("Your account and all documents have been deleted.");
        router.push("/login");
      } catch (err) {
        console.error("Delete Account Error:", err);
        toast.error(
          "An unexpected error occurred while deleting your account."
        );
      } finally {
        setShowConfirm(false);
      }
    });

    setShowConfirm(true);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, signup, login, logout, deleteAccount }}
    >
      {children}
      {showConfirm && (
        <CustomConfirm
          message="Are you sure you want to delete your account? This action cannot be undone."
          onConfirm={confirmCallback}
          onCancel={() => setShowConfirm(false)}
        />
      )}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
