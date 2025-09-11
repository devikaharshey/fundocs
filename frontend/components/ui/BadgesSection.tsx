"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Award,
  Flame,
  Star,
  Target,
  Trophy,
  Crown,
  Zap,
  Rocket,
  Medal,
  Diamond,
} from "lucide-react";

/* Badge Styles */
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

/* Badge Icons */
const badgeIcons: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  "Consistency Champ": Flame,
  "Streak Star": Flame,
  "Streak Legend": Flame,
  Unstoppable: Flame,
  "Layout Sprout": Star,
  "Progress Pioneer": Star,
  "Going Strong": Star,
  "Rising Coder": Star,
  "Challenge Master": Target,
  "XP Grinder": Zap,
  "Elite Learner": Crown,
  "Knowledge Titan": Diamond,
  "Fast Starter": Rocket,
  "Dedication Pro": Trophy,
  "Ultimate Scholar": Medal,
  default: Award,
};

export function BadgesSection({ badges }: { badges: string[] }) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");

  const filteredBadges = badges.filter((badge) => {
    const matchesSearch = badge.toLowerCase().includes(search.toLowerCase());
    const matchesFilter =
      filter === "all"
        ? true
        : filter === "streak"
        ? [
            "Consistency Champ",
            "Streak Star",
            "Streak Legend",
            "Unstoppable",
          ].includes(badge)
        : filter === "xp"
        ? [
            "Layout Sprout",
            "Progress Pioneer",
            "Going Strong",
            "Rising Coder",
            "Challenge Master",
            "XP Grinder",
            "Elite Learner",
            "Knowledge Titan",
          ].includes(badge)
        : filter === "special"
        ? ["Fast Starter", "Dedication Pro", "Ultimate Scholar"].includes(badge)
        : true;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="w-full max-w-5xl mb-6 p-4 bg-gray-800 rounded-xl shadow-md border border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg sm:text-xl font-bold text-gray-100">
          🏅 Badges
        </h2>
        {badges.length > 3 && (
          <Dialog>
            <DialogTrigger asChild>
              <button className="text-sm text-primary hover:underline">
                View All
              </button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl w-[95vw] sm:w-[90vw] md:w-[80vw] lg:w-[70vw] max-h-[90vh] bg-gray-900 text-gray-100 border border-gray-700 rounded-xl flex flex-col">
              <DialogHeader>
                <DialogTitle className="text-xl font-bold">
                  All Badges
                </DialogTitle>
              </DialogHeader>

              {/* Search + Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-4">
                <Input
                  placeholder="Search badges..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="flex-1 bg-gray-800 border-gray-700 text-gray-100"
                />
                <Select value={filter} onValueChange={setFilter}>
                  <SelectTrigger className="w-full sm:w-40 bg-gray-800 border-gray-700 text-gray-100">
                    <SelectValue placeholder="Filter" />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="all">All</SelectItem>
                    <SelectItem value="streak">Streak</SelectItem>
                    <SelectItem value="xp">XP</SelectItem>
                    <SelectItem value="special">Special</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Scrollable Badge Grid */}
              <div className="overflow-y-auto pr-2 max-h-[65vh]">
                <div
                  className="
    grid
    grid-cols-[repeat(auto-fit,minmax(120px,1fr))]
    gap-6
    pb-4
  "
                >
                  {filteredBadges.length ? (
                    filteredBadges.map((badge) => {
                      const Icon = badgeIcons[badge] || badgeIcons.default;
                      const styles = badgeStyles[badge] || badgeStyles.default;
                      return (
                        <motion.div
                          key={badge}
                          className="flex flex-col items-center justify-start text-center"
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ type: "spring", stiffness: 200 }}
                        >
                          <div
                            className={`w-14 h-14 flex items-center justify-center rounded-full border-2 shadow ${styles.bg} ${styles.border}`}
                          >
                            <Icon className={`w-6 h-6 ${styles.icon}`} />
                          </div>
                          <span
                            className="mt-2 text-[11px] sm:text-xs font-medium text-gray-200 text-center truncate max-w-[100px]"
                            title={badge}
                          >
                            {badge}
                          </span>
                        </motion.div>
                      );
                    })
                  ) : (
                    <p className="col-span-full text-center text-gray-400">
                      No badges match your search/filter
                    </p>
                  )}
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Preview Grid for Dashboard */}
      <div
        className="
          grid
          grid-cols-3
          sm:grid-cols-4
          md:grid-cols-5
          lg:grid-cols-6
          gap-4
        "
      >
        {badges.length ? (
          badges.slice(0, 12).map((badge) => {
            const Icon = badgeIcons[badge] || badgeIcons.default;
            const styles = badgeStyles[badge] || badgeStyles.default;
            return (
              <motion.div
                key={badge}
                className="flex flex-col items-center justify-start w-20 h-24 text-center mx-auto"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ type: "spring", stiffness: 200 }}
              >
                <div
                  className={`w-12 h-12 flex items-center justify-center rounded-full shadow-md border-2 ${styles.bg} ${styles.border}`}
                >
                  <Icon className={`w-5 h-5 ${styles.icon}`} />
                </div>
                <span className="mt-2 text-[10px] sm:text-xs font-medium text-gray-200 text-center break-words max-w-[70px]">
                  {badge}
                </span>
              </motion.div>
            );
          })
        ) : (
          <p className="col-span-full text-gray-400">No badges earned yet</p>
        )}
      </div>
    </div>
  );
}
