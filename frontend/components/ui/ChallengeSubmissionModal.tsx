"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/context/AuthContext";
import { AnimatePresence, motion } from "framer-motion";
import confetti from "canvas-confetti";

type Props = {
  challengeText: string;
  docId: string;
  open: boolean;
  onClose: () => void;
};

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:5000";

export default function ChallengeSubmissionModal({
  challengeText,
  docId,
  open,
  onClose,
}: Props) {
  const { user } = useAuth();
  const [solution, setSolution] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [xpAwarded, setXpAwarded] = useState<number | null>(null);
  const [showFeedbackModal, setShowFeedbackModal] = useState(false);

  const handleSubmit = async () => {
    if (!solution.trim()) return;
    setLoading(true);
    setFeedback(null);
    setXpAwarded(null);

    try {
      const res = await fetch(`${BACKEND_URL}/api/submit_challenge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          user_id: user?.$id,
          doc_id: docId,
          user_solution: solution,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      let cleanFeedback = data.feedback;

      if (typeof cleanFeedback === "string") {
        const match = cleanFeedback.match(
          /['"]feedback['"]\s*:\s*['"]([\s\S]+?)['"],?\s*['"]?xp['"]?/
        );
        if (match && match[1]) {
          cleanFeedback = match[1];
        }
      }

      setFeedback(cleanFeedback);
      setXpAwarded(data.xp_awarded);
      setShowFeedbackModal(true);

      // 🎉 Confetti on success
      if (data.xp_awarded > 0) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          zIndex: 9999,
        });
      }
    } catch (err: unknown) {
      let message = "An unknown error occurred";
      if (err instanceof Error) message = err.message;
      setFeedback(`Error: ${message}`);
      setShowFeedbackModal(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/60 backdrop-blur-sm"
          onClick={() => {
            if (!showFeedbackModal) onClose();
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          {/* Main submission modal */}
          <motion.div
            className="bg-gray-900 rounded-2xl w-full max-w-lg mx-4 shadow-2xl border border-gray-700 relative flex flex-col max-h-[85vh]"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {/* Close button */}
            <button
              onClick={() => {
                if (!showFeedbackModal) onClose();
              }}
              disabled={showFeedbackModal}
              className={`absolute top-3 right-3 font-bold ${
                showFeedbackModal
                  ? "text-gray-600 cursor-not-allowed"
                  : "text-gray-400 hover:text-gray-200"
              }`}
            >
              ✕
            </button>

            {/* Header */}
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-2xl font-bold text-white">
                🚀 Take Challenge
              </h2>
            </div>

            {/* Scrollable content */}
            <div className="flex-1 overflow-y-auto scrollbar-hidden p-6 space-y-4">
              <div className="p-4 border border-gray-700 rounded-lg bg-gray-800">
                <p className="text-sm text-gray-200 whitespace-pre-line">
                  {challengeText}
                </p>
              </div>

              <Textarea
                placeholder="Write your solution here..."
                value={solution}
                onChange={(e) => setSolution(e.target.value)}
                className="min-h-[120px] bg-gray-900 text-gray-200 border border-gray-700 focus:border-primary"
              />
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-gray-700">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="w-full"
              >
                {loading ? "Submitting..." : "Submit Solution"}
              </Button>
            </div>
          </motion.div>

          {/* Feedback modal */}
          <AnimatePresence>
            {showFeedbackModal && feedback && (
              <motion.div
                className={`fixed top-1/2 left-1/2 z-[2000] w-[90%] max-w-md ${
                  xpAwarded !== null && xpAwarded > 0
                    ? "bg-green-900 border-green-500"
                    : "bg-red-900 border-red-500"
                } border border-gray-700 rounded-xl shadow-xl p-6 -translate-x-1/2 -translate-y-1/2`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.8 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => setShowFeedbackModal(false)}
                  className="absolute top-2 right-3 text-gray-400 hover:text-gray-200 font-bold"
                >
                  ✕
                </button>
                <h3 className="text-lg font-semibold text-white mb-2">
                  📣 Feedback
                </h3>
                <div className="text-sm text-gray-200 mb-3 whitespace-pre-line">
                  {feedback}
                </div>
                {xpAwarded !== null && (
                  <p
                    className={`font-medium ${
                      xpAwarded > 0 ? "text-green-500" : "text-red-400"
                    }`}
                  >
                    {xpAwarded > 0
                      ? `🎉 Success! You earned +${xpAwarded} XP`
                      : "❌ No XP awarded this time. Try again!"}
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
