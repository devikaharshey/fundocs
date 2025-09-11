"use client";

import { useEffect, useState, useCallback } from "react";
import { databases, Models } from "@/lib/appwrite";
import { useAuth } from "@/context/AuthContext";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ThumbsUp, ThumbsDown, Trash2 } from "lucide-react";
import Image from "next/image";
import { Permission, Role, Query } from "appwrite";
import { motion, AnimatePresence } from "framer-motion";
import { ProtectedRoute } from "@/components/auth-ui/ProtectedRoute";
import { toast, Toaster } from "sonner";

interface AppUser {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  prefs?: { avatar?: string };
}

type Tip = {
  $id: string;
  user_id: string;
  tip_text: string;
  votes: number;
  voters: Record<string, "up" | "down">;
  username: string;
  avatar?: string;
};

export default function TipsPage() {
  const { user } = useAuth();
  const userTyped = user as AppUser | null;

  const [tips, setTips] = useState<Tip[]>([]);
  const [newTip, setNewTip] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingProgress, setLoadingProgress] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedTip, setSelectedTip] = useState<Tip | null>(null);

  const databaseId = process.env.NEXT_PUBLIC_APPWRITE_DATABASE_ID!;
  const tipsCollectionId = process.env.NEXT_PUBLIC_TIPS_COLLECTION_ID!;
  const bucketId = process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!;
  const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT!;
  const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID!;

  const getAvatarUrl = (avatarId?: string) =>
    avatarId
      ? `${endpoint}/storage/buckets/${bucketId}/files/${avatarId}/view?project=${projectId}`
      : "/default-avatar.png";

  const fetchTips = useCallback(async () => {
    setLoading(true);
    try {
      const res = await databases.listDocuments(databaseId, tipsCollectionId, [
        Query.orderDesc("votes"),
      ]);

      const normalizedTips: Tip[] = (res.documents as Models.Document[]).map(
        (doc) => {
          const data = doc as unknown as {
            $id: string;
            user_id: string;
            tip_text: string;
            votes: number;
            voters: string;
            username: string;
            avatar?: string;
          };
          return {
            $id: data.$id,
            user_id: data.user_id,
            tip_text: data.tip_text,
            votes: data.votes,
            voters: data.voters ? JSON.parse(data.voters) : {},
            username: data.username,
            avatar: data.avatar,
          };
        }
      );

      setTips(normalizedTips);
    } catch (err) {
      toast.error("Error fetching tips:" + (err as Error).message);
    } finally {
      setLoading(false);
      setLoadingProgress(false);
    }
  }, [databaseId, tipsCollectionId]);

  const addTip = async () => {
    if (!newTip.trim() || !userTyped) return;
    setLoading(true);
    try {
      await databases.createDocument(
        databaseId,
        tipsCollectionId,
        "unique()",
        {
          user_id: userTyped.$id,
          username: userTyped.name,
          avatar: userTyped.prefs?.avatar || userTyped.avatar,
          tip_text: newTip.trim(),
          votes: 0,
          voters: JSON.stringify({}),
          created_at: new Date().toISOString(),
        },
        [
          Permission.read(Role.users()),
          Permission.write(Role.users()),
          Permission.delete(Role.user(userTyped.$id)),
        ]
      );
      setNewTip("");
      setDialogOpen(false);
      fetchTips();
    } catch (err) {
      toast.error("Error adding tip:" + (err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  const voteTip = async (tip: Tip, direction: "up" | "down") => {
    if (!userTyped) return;

    const userId = userTyped.$id;
    const currentVote = tip.voters?.[userId];
    const newVoters = { ...tip.voters };
    let newVotes = tip.votes;

    if (currentVote === direction) {
      newVotes = direction === "up" ? tip.votes - 1 : tip.votes + 1;
      delete newVoters[userId];
    } else {
      if (currentVote === "up" && direction === "down")
        newVotes = tip.votes - 2;
      else if (currentVote === "down" && direction === "up")
        newVotes = tip.votes + 2;
      else newVotes = direction === "up" ? tip.votes + 1 : tip.votes - 1;

      newVoters[userId] = direction;
    }

    try {
      await databases.updateDocument(databaseId, tipsCollectionId, tip.$id, {
        votes: newVotes,
        voters: JSON.stringify(newVoters),
      });
      fetchTips();
    } catch (err) {
      toast.error("Error voting tip:" + (err as Error).message);
    }
  };

  const deleteTip = async (tipId: string) => {
    try {
      await databases.deleteDocument(databaseId, tipsCollectionId, tipId);
      fetchTips();
    } catch (err) {
      toast.error("Error deleting tip:" + (err as Error).message);
    }
  };

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  if (loading || !userTyped || loadingProgress) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              repeatType: "reverse",
            }}
            className="text-gray-400 text-lg"
          >
            Loading Tips...
          </motion.p>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <motion.div
        className="relative w-full min-h-screen px-6 pt-20 sm:pt-24 flex flex-col items-center bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <Toaster position="top-right" richColors />
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* Page Title */}
        <motion.h1
          className="text-4xl md:text-5xl font-extrabold text-primary mb-5 text-center relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Community Tips
        </motion.h1>

        <motion.h2
          className="text-md md:text-lg font-medium text-gray-200 tracking-wide text-center mb-5 relative z-10"
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <span className="inline-block px-2 py-0 rounded-full bg-primary/30 border border-primary">
            Learn • Share • Grow 🚀
          </span>
        </motion.h2>

        <motion.p
          className="text-sm md:text-base text-white max-w-md mx-auto text-center mb-5 leading-relaxed relative z-10"
          initial={{ opacity: 0, y: -40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Leave a short tip or note, earn upvotes from fellow users & build a
          better community together 💪🏻
        </motion.p>

        {/* Add Tip Button */}
        <div className="flex justify-center relative z-10">
          <Button onClick={() => setDialogOpen(true)}>Add Your Tip 💡</Button>
        </div>

        {/* Animated Dialog */}
        <AnimatePresence>
          {dialogOpen && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/60 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: 50, opacity: 0, scale: 0.95 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: 50, opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3 }}
                className="bg-black border-2 border-gray-600 rounded-xl w-full max-w-lg flex flex-col max-h-[80vh]"
              >
                {/* Header */}
                <div className="p-6 border-b border-gray-700">
                  <h2 className="text-xl font-bold">Your Tip</h2>
                </div>

                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto scrollbar-hidden p-6">
                  <Textarea
                    placeholder="Share a helpful note..."
                    value={newTip}
                    onChange={(e) => setNewTip(e.target.value)}
                    className="resize-none border-2 border-gray-600 min-h-[120px]"
                  />
                </div>

                {/* Footer */}
                <div className="p-6 border-t border-gray-700 flex gap-2">
                  <Button
                    onClick={addTip}
                    disabled={loading || !newTip.trim()}
                    className="flex-1"
                  >
                    {loading ? "Adding..." : "Add Tip"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setDialogOpen(false)}
                    className="flex-1 border-2 border-gray-600"
                  >
                    Cancel
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tips Grid */}
        <div className="px-4 relative z-10 w-full max-w-6xl mt-8">
          {tips.length === 0 ? (
            <p className="text-muted-foreground text-sm text-center">
              No tips yet. Be the first to add one!
            </p>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
            >
              <AnimatePresence>
                {tips.map((tip) => {
                  const avatarUrl = getAvatarUrl(tip.avatar);
                  const isUpVoted =
                    userTyped && tip.voters?.[userTyped.$id] === "up";
                  const isDownVoted =
                    userTyped && tip.voters?.[userTyped.$id] === "down";

                  return (
                    <motion.div
                      key={tip.$id}
                      layout
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Card className="relative h-[300px] flex flex-col bg-gray-800 border border-gray-600 rounded-xl shadow-md hover:border-primary/50 transition">
                        {/* Delete Button */}
                        {userTyped?.$id === tip.user_id && (
                          <button
                            onClick={() => deleteTip(tip.$id)}
                            className="absolute top-2 right-2 text-red-500 hover:text-red-700 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        )}

                        {/* Header: Avatar + Username */}
                        <div className="flex items-center gap-2 px-4 pt-4">
                          <Image
                            src={avatarUrl}
                            alt={`${tip.username} avatar`}
                            width={28}
                            height={28}
                            className="w-7 h-7 rounded-full border border-gray-700 object-cover"
                          />
                          <span className="text-primary text-sm font-semibold truncate max-w-[150px]">
                            {tip.username}
                          </span>
                        </div>

                        {/* Tip Content */}
                        <div className="flex-1 px-4 py-2 overflow-hidden">
                          <p className="text-sm text-gray-200 leading-relaxed line-clamp-5">
                            {tip.tip_text}
                          </p>
                        </div>

                        {/* Tiny View Full Tip Button */}
                        {tip.tip_text.length > 180 && (
                          <div className="px-4 mb-2">
                            <Button
                              variant="link"
                              size="sm"
                              className="text-primary px-0"
                              onClick={() => setSelectedTip(tip)}
                            >
                              View Full Tip →
                            </Button>
                          </div>
                        )}

                        {/* Footer: Voting */}
                        <div className="px-4 py-3 border-t border-gray-700 flex items-center justify-center">
                          <div className="flex items-center gap-2">
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => userTyped && voteTip(tip, "up")}
                            >
                              <ThumbsUp
                                className={`w-4 h-4 ${
                                  isUpVoted ? "text-green-500" : "text-gray-400"
                                }`}
                              />
                            </Button>
                            <span className="font-medium text-gray-300">
                              {tip.votes}
                            </span>
                            <Button
                              size="icon"
                              variant="ghost"
                              onClick={() => userTyped && voteTip(tip, "down")}
                            >
                              <ThumbsDown
                                className={`w-4 h-4 ${
                                  isDownVoted ? "text-red-500" : "text-gray-400"
                                }`}
                              />
                            </Button>
                          </div>
                        </div>
                      </Card>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </motion.div>
          )}
        </div>

        {/* Full Tip Modal */}
        <AnimatePresence>
          {selectedTip && (
            <motion.div
              className="fixed inset-0 flex items-center justify-center bg-black/70 z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: 50, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="bg-gray-800 border-2 border-gray-600 rounded-xl p-6 w-full max-w-2xl"
              >
                {/* Header */}
                <div className="flex items-center gap-2 mb-4">
                  <Image
                    src={getAvatarUrl(selectedTip.avatar)}
                    alt={`${selectedTip.username} avatar`}
                    width={32}
                    height={32}
                    className="w-8 h-8 rounded-full border border-gray-700 object-cover"
                  />
                  <span className="text-primary font-semibold">
                    {selectedTip.username}
                  </span>
                </div>

                {/* Full Tip */}
                <p className="text-gray-200 leading-relaxed whitespace-pre-line">
                  {selectedTip.tip_text}
                </p>

                {/* Close Button */}
                <div className="mt-6 text-right">
                  <Button
                    variant="outline"
                    className="border-gray-600"
                    onClick={() => setSelectedTip(null)}
                  >
                    Close
                  </Button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </ProtectedRoute>
  );
}
