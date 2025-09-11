"use client";

import { useState, DragEvent } from "react";
import { motion } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/context/AuthContext";
import { storage, account } from "@/lib/appwrite";
import Image from "next/image";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";

export default function SignupForm() {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  // Upload avatar to Appwrite Storage
  const uploadAvatar = async (file: File) => {
    const response = await storage.createFile(
      "docs_images", 
      `avatar_${Date.now()}`,
      file
    );
    return response.$id;
  };

  // Validation for single fields
  const validateField = (field: string, value: string | File | null) => {
    let error = "";

    switch (field) {
      case "name":
        if (!value || (value as string).trim().length < 2) {
          error = "Name must be at least 2 characters.";
        }
        break;
      case "email":
        if (!value || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value as string)) {
          error = "Enter a valid email address.";
        }
        break;
      case "password":
        const pass = value as string;
        if (!pass || pass.length < 6) {
          error = "Password must be at least 6 characters.";
        } else if (!/[0-9]/.test(pass) || !/[!@#$%^&*]/.test(pass)) {
          error = "Password must include a number & special character.";
        }
        break;
      case "avatar":
        const file = value as File;
        if (file) {
          if (!file.type.startsWith("image/")) {
            error = "File must be an image.";
          }
          if (file.size > 2 * 1024 * 1024) {
            error = "Image size must be under 2MB.";
          }
        }
        break;
    }

    setErrors((prev) => ({ ...prev, [field]: error }));
    return error === "";
  };

  const validateAll = () => {
    const fields: [string, string | File | null][] = [
      ["name", name],
      ["email", email],
      ["password", password],
      ["avatar", avatarFile],
    ];
    return fields.map(([f, v]) => validateField(f, v)).every(Boolean);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    setLoading(true);

    try {
      let avatarFileId: string | null = null;
      if (avatarFile) {
        avatarFileId = await uploadAvatar(avatarFile);
      }

      await signup(email, password, name);

      if (avatarFileId) {
        await account.updatePrefs({ avatar: avatarFileId });
      }

      toast.success("Account created successfully!");
    } catch (err: unknown) {
      if (err instanceof Error) toast.error(err.message || "Signup failed");
      else toast.error("Signup failed");
    } finally {
      setLoading(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
  };

  const handleDrop = (e: DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      setAvatarFile(file);
      validateField("avatar", file);
    }
  };

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      {/* Name */}
      <div className="flex flex-col gap-1">
        <Input
          type="text"
          placeholder="Name"
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            validateField("name", e.target.value);
          }}
          className={`rounded-xl bg-gray-900/80 border ${
            errors.name ? "border-red-500" : "border-gray-700"
          } text-gray-200 focus:border-primary`}
        />
        {errors.name && <p className="text-red-500 text-sm">{errors.name}</p>}
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <Input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            validateField("email", e.target.value);
          }}
          className={`rounded-xl bg-gray-900/80 border ${
            errors.email ? "border-red-500" : "border-gray-700"
          } text-gray-200 focus:border-primary`}
        />
        {errors.email && <p className="text-red-500 text-sm">{errors.email}</p>}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1">
        <Input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            validateField("password", e.target.value);
          }}
          className={`rounded-xl bg-gray-900/80 border ${
            errors.password ? "border-red-500" : "border-gray-700"
          } text-gray-200 focus:border-primary`}
        />
        {errors.password && (
          <p className="text-red-500 text-sm">{errors.password}</p>
        )}
      </div>

      {/* Avatar Upload */}
      <div className="flex flex-col gap-1 items-center">
        {!avatarFile ? (
          <label
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            className={`cursor-pointer w-full flex flex-col items-center justify-center rounded-2xl p-6 border-2 border-dashed transition 
              ${dragActive ? "border-primary bg-primary/10" : "border-gray-600 hover:border-primary"}`}
          >
            <Upload className="w-8 h-8 text-gray-400 mb-2" />
            <span className="text-sm text-gray-400">
              {dragActive ? "Drop image here" : "Click or drag image to upload"}
            </span>
            <Input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0] || null;
                setAvatarFile(file);
                validateField("avatar", file);
              }}
              className="hidden"
            />
          </label>
        ) : (
          <div className="relative">
            <Image
              src={URL.createObjectURL(avatarFile)}
              alt="Avatar Preview"
              className="w-24 h-24 rounded-full object-cover border border-gray-700 shadow-md"
              width={96}
              height={96}
            />
            <button
              type="button"
              onClick={() => {
                setAvatarFile(null);
                validateField("avatar", null);
              }}
              className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 hover:bg-red-700"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
        {errors.avatar && <p className="text-red-500 text-sm">{errors.avatar}</p>}
      </div>

      <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
        <Button
          type="submit"
          disabled={loading}
          className="w-full rounded-2xl bg-primary text-white hover:bg-primary-dark shadow-soft"
        >
          {loading ? "Creating account..." : "Sign Up 🚀"}
        </Button>
      </motion.div>
    </motion.form>
  );
}
