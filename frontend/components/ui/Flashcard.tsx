"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface FlashcardProps {
  question: string;
  answer: string;
  onCopy?: () => void;
  copied?: boolean;
  id: string;
}

export default function Flashcard({
  question,
  answer,
  onCopy,
  copied,
}: FlashcardProps) {
  const [flipped, setFlipped] = useState(false);

  return (
    <motion.div
      className="w-full h-52 sm:h-48 perspective cursor-pointer"
      whileHover={{
        scale: 1.05,
        y: -2,
        boxShadow: "0px 8px 20px rgba(0,0,0,0.4)",
      }}
      onClick={() => setFlipped(!flipped)}
    >
      <motion.div
        className="relative w-full h-full"
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Front Side */}
        <div
          className="absolute w-full h-full rounded-lg backface-hidden p-4 flex flex-col justify-between shadow-xl border-2 border-primary/35"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #000000, #2A2A2A, #000000)",
            backgroundSize: "400% 400%",
            backgroundRepeat: "no-repeat",
            animation: "gradientShift 8s ease infinite",
          }}
        >
          <p className="text-primary-light font-semibold text-sm sm:text-base">
            {question}
          </p>
          {onCopy && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCopy();
              }}
              className={`mt-4 self-end text-xs sm:text-sm px-3 py-1 rounded transition-colors ${
                copied
                  ? "bg-green-500 text-white hover:bg-green-600"
                  : "bg-gray-800 text-gray-200 hover:bg-gray-700"
              }`}
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          )}
        </div>

        {/* Back Side */}
        <div
          className="absolute w-full h-full rounded-lg backface-hidden p-4 flex flex-col justify-center rotateY-180 shadow-xl border border-gray-600"
          style={{
            backgroundImage:
              "linear-gradient(135deg, #C52652, #FF5A85, #C52652)",
            backgroundSize: "400% 400%",
            backgroundRepeat: "no-repeat",
            animation: "gradientShift 10s ease infinite",
          }}
        >
          <p className="text-white font-medium text-sm sm:text-[13px]">
            {answer}
          </p>
        </div>
      </motion.div>
    </motion.div>
  );
}
