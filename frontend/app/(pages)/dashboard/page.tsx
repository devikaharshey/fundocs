"use client";

import { useAuth } from "@/context/AuthContext";
import { motion, easeOut } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { ProtectedRoute } from "@/components/auth-ui/ProtectedRoute";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";
import { BadgesSection } from "@/components/ui/BadgesSection";

const BACKEND_URL =
  process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: easeOut },
  }),
};

const badgeStyles: Record<
  string,
  { bg: string; border: string; icon: string }
> = {
  "Consistency Champ": {
    bg: "bg-orange-500/20",
    border: "border-orange-400",
    icon: "text-orange-300",
  },
  "Streak Star": {
    bg: "bg-yellow-500/20",
    border: "border-yellow-400",
    icon: "text-yellow-300",
  },
  "Streak Legend": {
    bg: "bg-red-500/20",
    border: "border-red-400",
    icon: "text-red-300",
  },
  Unstoppable: {
    bg: "bg-pink-500/20",
    border: "border-pink-400",
    icon: "text-pink-300",
  },
  "Layout Sprout": {
    bg: "bg-green-500/20",
    border: "border-green-400",
    icon: "text-green-300",
  },
  "Progress Pioneer": {
    bg: "bg-teal-500/20",
    border: "border-teal-400",
    icon: "text-teal-300",
  },
  "Going Strong": {
    bg: "bg-sky-500/20",
    border: "border-sky-400",
    icon: "text-sky-300",
  },
  "Rising Coder": {
    bg: "bg-blue-500/20",
    border: "border-blue-400",
    icon: "text-blue-300",
  },
  "Challenge Master": {
    bg: "bg-indigo-500/20",
    border: "border-indigo-400",
    icon: "text-indigo-300",
  },
  "XP Grinder": {
    bg: "bg-violet-500/20",
    border: "border-violet-400",
    icon: "text-violet-300",
  },
  "Elite Learner": {
    bg: "bg-purple-500/20",
    border: "border-purple-400",
    icon: "text-purple-300",
  },
  "Knowledge Titan": {
    bg: "bg-fuchsia-500/20",
    border: "border-fuchsia-400",
    icon: "text-fuchsia-300",
  },
  "Fast Starter": {
    bg: "bg-lime-500/20",
    border: "border-lime-400",
    icon: "text-lime-300",
  },
  "Dedication Pro": {
    bg: "bg-rose-500/20",
    border: "border-rose-400",
    icon: "text-rose-300",
  },
  "Ultimate Scholar": {
    bg: "bg-emerald-500/20",
    border: "border-emerald-400",
    icon: "text-emerald-300",
  },
  default: {
    bg: "bg-gray-600/30",
    border: "border-gray-400",
    icon: "text-gray-300",
  },
};

interface AppUser {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  prefs?: { avatar?: string };
}
interface Progress {
  xp: number;
  streak: number;
  badges: string[];
}
interface Activity {
  message: string;
  badges: string[];
  timestamp: number;
}

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const userTyped = user as AppUser | null;

  const [progress, setProgress] = useState<Progress>({
    xp: 0,
    streak: 0,
    badges: [],
  });
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loadingProgress, setLoadingProgress] = useState(true);

  const router = useRouter();

  const maxXP = 100;
  const level = Math.floor(progress.xp / maxXP) + 1;

  const fetchProgress = useCallback(async () => {
    if (!userTyped) return;
    setLoadingProgress(true);
    try {
      const res = await fetch(
        `${BACKEND_URL}/api/get_progress?user_id=${userTyped.$id}`
      );
      if (!res.ok) return toast.error("Backend error:" + (await res.text()));
      const data = await res.json();
      setProgress({
        xp: data.xp ?? 0,
        streak: data.streak ?? 0,
        badges: Array.isArray(data.badges) ? data.badges : [],
      });
      setActivities(Array.isArray(data.activities) ? data.activities : []);
    } catch (err) {
      toast.error("Error fetching progress:" + (err as Error).message);
    } finally {
      setLoadingProgress(false);
    }
  }, [userTyped]);

  useEffect(() => {
    if (!loading && !userTyped) return;
    fetchProgress();
  }, [userTyped, loading, fetchProgress]);

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
            Loading Dashboard...
          </motion.p>
        </div>
      </ProtectedRoute>
    );
  }

  const avatarUrl = userTyped.prefs?.avatar
    ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${userTyped.prefs.avatar}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    : "/default-avatar.png";

  return (
    <ProtectedRoute>
      <Toaster position="top-right" richColors />
      <motion.div
        className="relative font-sans w-full min-h-screen flex flex-col items-center pt-20 sm:pt-24 px-4 sm:px-6 lg:px-8 bg-gray-900"
        initial="hidden"
        animate="visible"
      >
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* User Info */}
        <motion.div
          className="w-full max-w-xl mb-8 p-4 sm:p-6 flex flex-col items-center bg-gray-800 rounded-xl shadow-md border border-gray-700"
          variants={fadeUp}
          custom={0}
        >
          <Image
            src={avatarUrl}
            alt={`${userTyped.name || "User"} avatar`}
            width={96}
            height={96}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full mb-3 object-cover border-2 border-gray-600"
          />
          <h1 className="text-xl sm:text-2xl font-bold text-primary text-center break-words">
            {userTyped.name}
          </h1>
          <p className="text-gray-200 text-sm sm:text-base text-center break-words">
            {userTyped.email}
          </p>
          <div className="flex gap-4 mt-4">
            <Button onClick={() => router.push("/tips")}>Community Tips</Button>
            <Button onClick={() => router.push("/leaderboard")}>
              View Leaderboard
            </Button>
          </div>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="w-full max-w-5xl mb-6 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4"
          variants={fadeUp}
          custom={1}
        >
          {[
            { label: "Level", value: level, color: "text-primary" },
            { label: "XP", value: `${progress.xp}`, color: "text-green-400" },
            {
              label: "Streak",
              value: `${progress.streak} day${
                progress.streak !== 1 ? "s" : ""
              }`,
              color: "text-yellow-400",
            },
            {
              label: "Badges",
              value: progress.badges.length,
              color: "text-purple-400",
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="p-3 sm:p-4 bg-gray-800 rounded-xl shadow-md border border-gray-700 flex flex-col items-center"
            >
              <p className="text-gray-400 text-sm sm:text-base">{stat.label}</p>
              <p className={`text-lg sm:text-2xl font-bold ${stat.color}`}>
                {stat.value}
              </p>
            </div>
          ))}
        </motion.div>

        {/* Badges */}
        <BadgesSection badges={progress.badges} />

        {/* Activities */}
        <motion.div
          className="w-full max-w-5xl mb-6 p-4 bg-gray-800 rounded-xl shadow-md border border-gray-700"
          variants={fadeUp}
          custom={3}
        >
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-gray-100">
            📝 Recent Activities
          </h2>
          {activities.length ? (
            <ul className="space-y-2 max-h-60 overflow-y-auto scrollbar-hidden pr-1">
              {activities.slice().map((act, i) => (
                <motion.li
                  key={i}
                  className="p-3 bg-gray-700 rounded-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2"
                  variants={fadeUp}
                  custom={i * 0.05}
                >
                  <span className="text-gray-200 text-sm sm:text-base">
                    {act.message}
                  </span>
                  {act.badges?.length > 0 && (
                    <div className="flex flex-wrap gap-1 sm:gap-2">
                      {act.badges.map((b, j) => {
                        const styles = badgeStyles[b] || badgeStyles.default;
                        return (
                          <span
                            key={j}
                            className={`px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-medium ${styles.bg} ${styles.border} ${styles.icon}`}
                          >
                            {b}
                          </span>
                        );
                      })}
                    </div>
                  )}
                  <span className="text-gray-400 text-xs whitespace-nowrap">
                    {new Date(act.timestamp * 1000).toLocaleString()}
                  </span>
                </motion.li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-400">No recent activities yet.</p>
          )}
        </motion.div>

        <Button onClick={fetchProgress} className="mt-4 w-full sm:w-auto">
          Refresh Progress
        </Button>
      </motion.div>
    </ProtectedRoute>
  );
}
