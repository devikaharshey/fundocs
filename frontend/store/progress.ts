import { create } from "zustand";

interface ProgressState {
  xp: number;
  streak: number;
  badges: string[];
  fetchProgress: (userId: string) => Promise<void>;
  updateProgress: (userId: string, xpEarned: number) => Promise<void>;
}

export const useProgressStore = create<ProgressState>((set) => ({
  xp: 0,
  streak: 0,
  badges: [],

  fetchProgress: async (userId: string) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/get_progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId }),
        }
      );
      const data = await res.json();
      set({ xp: data.xp, streak: data.streak, badges: data.badges });
    } catch (err) {
      console.error("Failed to fetch progress:", err);
    }
  },

  updateProgress: async (userId: string, xpEarned: number) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/update_progress`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ user_id: userId, xp_earned: xpEarned }),
        }
      );
      const data = await res.json();
      set({ xp: data.xp, streak: data.streak, badges: data.badges });
      return data;
    } catch (err) {
      console.error("Failed to update progress:", err);
    }
  },
}));
