"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { ProtectedRoute } from "@/components/auth-ui/ProtectedRoute";
import Image from "next/image";
import { Crown, Flame, Medal, Star } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface AppUser {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  prefs?: { avatar?: string };
}

interface LeaderboardUser {
  $id?: string;
  name: string;
  xp: number;
  streak?: number;
  badges?: string[];
  avatar?: string;
  prefs?: { avatar?: string };
}

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

export default function LeaderboardPage() {
  const { user, loading } = useAuth();
  const [leaderboard, setLeaderboard] = useState<LeaderboardUser[]>([]);
  const [loadingLeaderboard, setLoadingLeaderboard] = useState(true);

  const userTyped = user as AppUser;

  useEffect(() => {
    if (!user) return;

    const fetchLeaderboard = async () => {
      setLoadingLeaderboard(true);
      try {
        const res = await fetch(`${BACKEND_URL}/api/leaderboard`);
        const data = await res.json();
        setLeaderboard(data.leaderboard || []);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      } finally {
        setLoadingLeaderboard(false);
      }
    };

    fetchLeaderboard();
  }, [user]);

  if (loading)
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
            Loading Leaderboard...
          </motion.p>
        </div>
      </ProtectedRoute>
    );

  const getAvatarUrl = (avatarId?: string) => {
    if (!avatarId) return "/default-avatar.png";
    return `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${avatarId}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`;
  };

  return (
    <ProtectedRoute>
      <motion.div
        className="relative w-full min-h-screen px-4 sm:px-6 md:px-12 pt-20 sm:pt-24 flex flex-col items-center bg-gray-900"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        {/* Background Glow */}
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        <motion.h1
          className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-10 text-center relative z-10"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Leaderboard 🏆
        </motion.h1>

        {/* Content Container */}
        <div className="relative z-10 w-full max-w-5xl space-y-10">
          <AnimatePresence mode="wait">
            {loadingLeaderboard ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {/* Shimmer Placeholders */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                  {[...Array(3)].map((_, i) => (
                    <div
                      key={i}
                      className="h-32 bg-gray-800/40 rounded-xl animate-pulse"
                    />
                  ))}
                </div>
                {/* Shimmer Placeholder */}
                <div className="h-64 bg-gray-800/40 rounded-xl animate-pulse" />
              </motion.div>
            ) : leaderboard.length === 0 ? (
              <motion.p
                key="empty"
                className="text-gray-400 text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                No users found.
              </motion.p>
            ) : (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.5 }}
                className="space-y-10"
              >
                {/* Podium for Top 3 */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                  {leaderboard.slice(0, 3).map((u, i) => (
                    <motion.div
                      key={u.$id || i}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.4, delay: i * 0.1 }}
                      className={`flex flex-col items-center p-4 rounded-2xl shadow-xl w-full sm:w-auto ${
                        i === 0
                          ? "bg-yellow-500/20 border-2 border-yellow-400"
                          : i === 1
                          ? "bg-gray-400/20 border-2 border-gray-300"
                          : "bg-orange-400/20 border-2 border-orange-300"
                      }`}
                    >
                      <Image
                        src={getAvatarUrl(u.avatar)}
                        alt={u.name}
                        width={64}
                        height={64}
                        className="w-16 h-16 rounded-full object-cover border-2 border-gray-700"
                      />
                      <p className="mt-3 font-semibold text-lg text-center">
                        {u.name}
                      </p>
                      <p className="flex items-center gap-1 text-sm text-gray-300">
                        <Star className="w-4 h-4 text-yellow-400" /> {u.xp} XP
                      </p>
                      {i === 0 && (
                        <Crown className="w-6 h-6 text-yellow-400 mt-2" />
                      )}
                    </motion.div>
                  ))}
                </div>

                {/* Leaderboard Table */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4, delay: 0.3 }}
                  className="overflow-x-auto rounded-xl shadow-lg bg-gray-900 border-2 border-gray-600"
                >
                  <table className="w-full text-gray-200 min-w-[400px] md:min-w-full">
                    <thead className="bg-gray-800/80 backdrop-blur">
                      <tr>
                        <th className="p-2 sm:p-3 text-sm sm:text-base text-center">
                          Rank
                        </th>
                        <th className="p-2 sm:p-3 text-sm sm:text-base text-left">
                          User
                        </th>
                        <th className="p-2 sm:p-3 text-sm sm:text-base text-center">
                          XP
                        </th>
                        <th className="p-2 sm:p-3 text-sm sm:text-base text-center">
                          Streak
                        </th>
                        <th className="p-2 sm:p-3 text-sm sm:text-base text-center">
                          Badges
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {leaderboard.map((u, i) => {
                        const isCurrentUser = u.$id === userTyped.$id;
                        let rankColor = "";
                        if (i === 0) rankColor = "text-yellow-400 font-bold";
                        else if (i === 1)
                          rankColor = "text-gray-300 font-semibold";
                        else if (i === 2)
                          rankColor = "text-orange-400 font-semibold";

                        return (
                          <tr
                            key={u.$id || i}
                            className={`hover:bg-gray-800/70 transition-colors duration-200 ${
                              isCurrentUser
                                ? "bg-primary/20 ring-2 ring-primary/50"
                                : i % 2 === 0
                                ? "bg-gray-900/40"
                                : ""
                            }`}
                          >
                            <td
                              className={`p-1 sm:p-2 md:p-3 text-center align-middle ${rankColor}`}
                            >
                              {i + 1}
                            </td>
                            <td className="p-1 sm:p-2 md:p-3 flex items-center gap-2 sm:gap-3 text-left align-middle">
                              <Image
                                src={getAvatarUrl(u.avatar)}
                                alt={u.name || "User avatar"}
                                width={32}
                                height={32}
                                className="w-6 h-6 sm:w-8 sm:h-8 rounded-full object-cover border border-gray-600"
                              />
                              <span>{u.name}</span>
                            </td>
                            <td className="p-1 sm:p-2 md:p-3 text-center align-middle">
                              <div className="flex items-center justify-center gap-1">
                                <Star className="w-4 h-4 text-yellow-400" />{" "}
                                {u.xp}
                              </div>
                            </td>
                            <td className="p-1 sm:p-2 md:p-3 text-center align-middle">
                              <div className="flex items-center justify-center gap-1">
                                <Flame className="w-4 h-4 text-orange-500" />{" "}
                                {u.streak ?? 0}
                              </div>
                            </td>
                            <td className="p-1 sm:p-2 md:p-3 text-center align-middle">
                              <div className="flex items-center justify-center gap-1">
                                <Medal className="w-4 h-4 text-blue-400" />{" "}
                                {Array.isArray(u.badges) ? u.badges.length : 0}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </ProtectedRoute>
  );
}
