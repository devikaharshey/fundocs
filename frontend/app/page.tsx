"use client";

import Link from "next/link";
import { easeInOut, motion, AnimatePresence } from "framer-motion";
import {
  Book,
  Gamepad,
  BookOpen,
  List,
  Puzzle,
  Clipboard,
  Trophy,
  Users,
} from "lucide-react";
import React, { useState, useEffect, useCallback } from "react";

// FlipWords component
export const FlipWords = ({
  words,
  duration = 3000,
  className,
}: {
  words: string[];
  duration?: number;
  className?: string;
}) => {
  const [currentWord, setCurrentWord] = useState(words[0]);
  const [isAnimating, setIsAnimating] = useState(false);

  const startAnimation = useCallback(() => {
    const currentIndex = words.indexOf(currentWord);
    const nextWord = words[currentIndex + 1] || words[0];
    setCurrentWord(nextWord);
    setIsAnimating(true);
  }, [currentWord, words]);

  useEffect(() => {
    if (!isAnimating) {
      const timer = setTimeout(() => startAnimation(), duration);
      return () => clearTimeout(timer);
    }
  }, [isAnimating, duration, startAnimation]);

  return (
    <AnimatePresence onExitComplete={() => setIsAnimating(false)}>
      <motion.span
        key={currentWord}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{
          opacity: 0,
          y: -20,
          scale: 0.8,
          filter: "blur(2px)",
          position: "absolute",
        }}
        transition={{ duration: 0.5, ease: easeInOut }}
        className={`inline-block relative ${className}`}
      >
        {currentWord.split(" ").map((word, wIdx) => (
          <motion.span
            key={word + wIdx}
            initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ delay: wIdx * 0.2, duration: 0.3 }}
            className="inline-block whitespace-nowrap"
          >
            {word.split("").map((letter, lIdx) => (
              <motion.span
                key={letter + lIdx}
                initial={{ opacity: 0, y: 10, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ delay: wIdx * 0.2 + lIdx * 0.03, duration: 0.2 }}
                className="inline-block"
              >
                {letter}
              </motion.span>
            ))}
            <span className="inline-block">&nbsp;</span>
          </motion.span>
        ))}
      </motion.span>
    </AnimatePresence>
  );
};

export default function Home() {
  const ctaButtons = [
    {
      href: "/explore",
      label: "Explore Docs",
      style: "bg-primary text-white hover:bg-primary/90",
    },
    {
      href: "/add",
      label: "Add Your Docs",
      style: "border border-gray-700 text-white hover:bg-gray-800/80",
    },
  ];

  const features = [
    {
      title: "Docs Explorer",
      desc: "Browse your docs with a visual level map.",
      bg: "from-purple-500/20 to-purple-900/20",
      border: "border-purple-500",
      text: "text-purple-500",
      col: "sm:col-span-2",
      row: "row-span-1",
      icon: Book,
    },
    {
      title: "Docs-to-Quests",
      desc: "Turn any doc into interactive quests.",
      bg: "from-pink-500/20 to-pink-900/20",
      border: "border-pink-500",
      text: "text-pink-500",
      col: "sm:col-span-1",
      row: "row-span-2",
      icon: Gamepad,
    },
    {
      title: "Story Mode",
      desc: "Fun, story-driven explanations.",
      bg: "from-green-500/20 to-green-900/20",
      border: "border-green-500",
      text: "text-green-500",
      col: "sm:col-span-1",
      row: "row-span-1",
      icon: BookOpen,
    },
    {
      title: "Step-by-step Explainer",
      desc: "Break complex topics into clear, ordered steps.",
      bg: "from-yellow-500/20 to-yellow-900/20",
      border: "border-yellow-500",
      text: "text-yellow-500",
      col: "sm:col-span-2",
      row: "row-span-1",
      icon: List,
    },
    {
      title: "Challenges",
      desc: "Solve coding challenges with instant validation.",
      bg: "from-indigo-500/20 to-indigo-900/20",
      border: "border-indigo-500",
      text: "text-indigo-500",
      col: "sm:col-span-1",
      row: "row-span-1",
      icon: Puzzle,
    },
    {
      title: "Flashcards & Quizzes",
      desc: "Auto-generate flashcards and quizzes.",
      bg: "from-red-500/20 to-red-900/20",
      border: "border-red-500",
      text: "text-red-500",
      col: "sm:col-span-1",
      row: "row-span-1",
      icon: Clipboard,
    },
    {
      title: "Gamification",
      desc: "Earn XP, unlock badges, build streaks.",
      bg: "from-teal-500/20 to-teal-900/20",
      border: "border-teal-500",
      text: "text-teal-500",
      col: "sm:col-span-2",
      row: "row-span-1",
      icon: Trophy,
    },
    {
      title: "Community Tips",
      desc: "Share and browse tips on the Community Tips page.",
      bg: "from-orange-500/20 to-orange-900/20",
      border: "border-orange-500",
      text: "text-orange-500",
      col: "sm:col-span-1",
      row: "row-span-1",
      icon: Users,
    },
  ];

  const textVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: { delay: i * 0.1, duration: 0.6, ease: easeInOut },
    }),
  };

  return (
    <div className="relative font-sans w-full min-h-screen flex flex-col items-center text-center overflow-x-hidden">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      {/* Hero */}
      <div className="relative z-10 flex flex-col items-center px-4 sm:px-8 lg:px-20 max-w-5xl mx-auto pt-32 md:pt-40 pb-40">
        <motion.h1
          className="text-5xl sm:text-6xl md:text-7xl font-extrabold text-primary mb-6 flex items-center justify-center gap-0"
          initial="hidden"
          animate="visible"
          variants={textVariants}
          custom={0}
        >
          <span>Fun</span>
          <Book className="inline-block w-13 h-13 sm:w-15 sm:h-15 md:w-17 md:h-17 text-primary -mt-2" />
          <span>ocs</span>
        </motion.h1>
        <motion.h2
          className="text-2xl sm:text-3xl md:text-4xl font-bold leading-snug mb-6 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={textVariants}
          custom={1}
        >
          Make Documentations Fun & Interactive!
        </motion.h2>

        {/* FlipWords motion p */}
        <motion.div
          className="text-gray-400 sm:text-lg max-w-2xl mb-8 overflow-hidden"
          initial="hidden"
          animate="visible"
          variants={textVariants}
          custom={2}
        >
          FunDocs transforms boring docs into {"   "}
          <span className="font-semibold text-primary-light">
            <FlipWords
              words={[
                "fun stories",
                "flashcards",
                "interactive challenges",
                "step-by-step guides",
                "quests",
                "gamified learning",
              ]}
            />
          </span>
          <br />
          Learn faster while enjoying the journey 🚀
        </motion.div>

        {/* Hero CTA */}
        <motion.div
          className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto justify-center"
          initial="hidden"
          animate="visible"
          variants={textVariants}
          custom={3}
        >
          {ctaButtons.map((btn, idx) => (
            <motion.div
              key={idx}
              whileHover={{ y: -4, rotateX: 2, rotateY: 2 }}
              transition={{ type: "tween", duration: 0.5, ease: "easeInOut" }}
            >
              <Link
                href={btn.href}
                className={`flex items-center justify-center gap-2 px-5 py-2 rounded-xl font-medium transition shadow-md ${btn.style}`}
              >
                {btn.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </div>

      {/* Features Title */}
      <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-8 pb-10">
        <div className="text-center mb-10">
          <motion.h2
            className="text-4xl sm:text-5xl font-extrabold text-primary overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut" }}
          >
            Core Features
          </motion.h2>
          <motion.p
            className="text-white max-w-2xl mx-auto mt-5 overflow-hidden"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeInOut", delay: 0.1 }}
          >
            Turn boring docs into quests, challenges, and story-driven
            adventures.
          </motion.p>
        </div>
      </div>

      {/* Bento Features */}
      <motion.section
        className="grid grid-cols-1 sm:grid-cols-4 auto-rows-[200px] gap-6 max-w-6xl mx-auto px-4 sm:px-8 pb-16"
        initial="hidden"
        whileInView="visible"
        viewport={{ once: true, amount: 0.2 }}
        variants={{
          hidden: {},
          visible: { transition: { staggerChildren: 0.12 } },
        }}
      >
        {features.map((feature, idx) => {
          const Icon = feature.icon;
          return (
            <motion.div
              key={idx}
              className={`relative rounded-3xl p-6 md:p-8 text-left bg-gradient-to-br ${feature.bg} border ${feature.border} shadow-lg ${feature.col} ${feature.row}`}
              variants={{
                hidden: { opacity: 0, y: 20, scale: 0.95 },
                visible: { opacity: 1, y: 0, scale: 1 },
              }}
              whileHover={{
                y: -6,
                rotateX: 3,
                rotateY: 3,
                scale: 1.03,
                boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              }}
              whileTap={{ scale: 0.97 }}
              transition={{
                type: "spring",
                stiffness: 120,
                damping: 12,
                duration: 0.5,
              }}
            >
              <h3 className={`font-semibold text-xl ${feature.text} mb-3`}>
                {feature.title}
              </h3>
              <p className="text-gray-200 text-base leading-relaxed">
                {feature.desc}
              </p>
              <Icon
                className={`absolute bottom-0 right-0 ${feature.text} opacity-20 w-28 h-28 pointer-events-none`}
              />
            </motion.div>
          );
        })}
      </motion.section>

      {/* Signup/Login CTA */}
      <div className="w-full bg-gradient-to-b from-transparent/20 to-primary/10 py-20 flex flex-col items-center px-4 sm:px-8 shadow-inner">
        {/* Heading */}
        <motion.h2
          className="text-3xl sm:text-4xl font-extrabold text-white mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut" }}
        >
          Join the <span className="text-primary">FunDocs</span> <br />{" "}
          Community
        </motion.h2>

        {/* Buttons */}
        <motion.div
          className="flex flex-col sm:flex-row gap-8 sm:gap-6 justify-center items-center mt-5"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeInOut", delay: 0.15 }}
        >
          <motion.div
            whileHover={{
              y: -4,
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
            }}
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
          >
            <Link
              href="/signup"
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-primary/80 text-white font-semibold shadow-md hover:from-primary/90 hover:to-primary/70 transition"
            >
              Sign Up
            </Link>
          </motion.div>

          <motion.div
            whileHover={{
              y: -4,
              scale: 1.05,
              boxShadow: "0 10px 25px rgba(0,0,0,0.35)",
            }}
            transition={{ type: "tween", duration: 0.4, ease: "easeInOut" }}
          >
            <Link
              href="/login"
              className="px-6 py-3 rounded-xl border border-gray-600 text-white font-semibold hover:bg-gray-700/50 transition shadow-md"
            >
              Log In
            </Link>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
