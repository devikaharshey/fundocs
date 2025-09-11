"use client";

import { FC, ReactNode } from "react";
import { motion } from "framer-motion";
import { AlertTriangle } from "lucide-react";

interface CustomConfirmProps {
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
}

export const CustomConfirm: FC<CustomConfirmProps> = ({
  message,
  onConfirm,
  onCancel,
  icon,
}) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <motion.div
        className="bg-gray-900 dark:bg-gray-800 rounded-xl p-6 w-80 max-w-full text-center shadow-lg border border-gray-700"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
      >
        {icon || (
          <AlertTriangle className="mx-auto mb-3 w-10 h-10 text-red-500" />
        )}
        <p className="text-gray-100 mb-4 text-sm md:text-base">{message}</p>
        <div className="flex justify-center gap-4">
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all"
          >
            Yes
          </button>
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
          >
            Cancel
          </button>
        </div>
      </motion.div>
    </div>
  );
};
