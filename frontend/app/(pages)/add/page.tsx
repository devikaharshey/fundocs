"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Tab } from "@headlessui/react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Markdown } from "@/components/ui/markdown";
import { ClipboardIcon, Loader2, RocketIcon, CheckCircle2 } from "lucide-react";
import { account } from "@/lib/appwrite";
import Flashcard from "@/components/ui/Flashcard";
import { toast, Toaster } from "sonner";
import ChallengeSubmissionModal from "@/components/ui/ChallengeSubmissionModal";
import { ProtectedRoute } from "@/components/auth-ui/ProtectedRoute";

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

export default function AddDocPage() {
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const [story, setStory] = useState<string | null>(null);
  const [steps, setSteps] = useState<string[]>([]);
  const [challenges, setChallenges] = useState<string | null>(null);
  const [flashcards, setFlashcards] = useState<
    { question: string; answer: string }[]
  >([]);
  const [copied, setCopied] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [currentDocId, setCurrentDocId] = useState("");

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const handleSubmit = async () => {
    if (!source.trim()) {
      toast.error("Please enter a URL or text");
      return;
    }

    setLoading(true);
    setStory(null);
    setSteps([]);
    setChallenges(null);
    setFlashcards([]);

    try {
      const user = await account.get();
      const userId = user.$id;

      const fetchResp = await fetch(`${BACKEND_URL}/api/fetch_clean_doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ source, userId }),
      });

      const fetchData = await fetchResp.json();
      if (!fetchResp.ok) throw new Error(fetchData.error || "Backend error");

      const doc = fetchData.doc;
      const docId = doc.$id;
      setCurrentDocId(docId);

      toast.success("Document saved successfully!");

      const text = doc.text?.trim() || source.trim();

      const genResp = await fetch(`${BACKEND_URL}/api/generate_all`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, userId, docId }),
      });

      const genData = await genResp.json();
      if (!genResp.ok)
        throw new Error(genData.error || "Failed to generate content");

      setStory(genData.story || null);
      setSteps(genData.steps || []);
      setChallenges(genData.challenges || null);

      let flashcardsArray: { question: string; answer: string }[] = [];
      if (genData.flashcards) {
        if (typeof genData.flashcards === "string") {
          try {
            flashcardsArray = JSON.parse(genData.flashcards);
          } catch (err) {
            console.error("Failed to parse flashcards:", err);
          }
        } else if (Array.isArray(genData.flashcards)) {
          flashcardsArray = genData.flashcards;
        }
      }
      setFlashcards(flashcardsArray);

      setSubmitted(true);
    } catch (err: unknown) {
      console.error(err);
      toast.error("Failed to save document or generate content. Try again.");
    } finally {
      setLoading(false);
    }
  };

  const challengeList = challenges
    ? challenges
        .split(/Challenge Ended/i)
        .map((c) => c.trim())
        .filter((c) => c.length > 0)
    : [];

  return (
    <ProtectedRoute>
      <div className="relative font-sans w-full min-h-screen flex flex-col items-center px-4 sm:px-6 md:px-8 pt-28 bg-gray-900">
        <Toaster position="top-right" richColors />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none z-0" />

        <motion.h1
          className="text-4xl sm:text-5xl md:text-5xl font-extrabold text-primary mb-10 text-center"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          Add Your Documentation
        </motion.h1>

        {!submitted && (
          <Card className="w-full max-w-2xl sm:max-w-3xl mb-10 shadow-2xl border border-gray-700 bg-gray-800/70 backdrop-blur flex flex-col max-h-[80vh] sm:max-h-[70vh]">
            <CardHeader className="border-b border-gray-700">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-100">
                🚀 Paste your doc or link
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 overflow-y-auto scrollbar-hidden p-4">
              <Textarea
                placeholder="Paste a URL or raw documentation text..."
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="bg-gray-900/80 text-gray-200 border border-gray-700 focus:border-primary resize-none min-h-[120px] sm:min-h-[150px]"
              />
            </CardContent>

            <div className="p-4 border-t border-gray-700 flex flex-col sm:flex-row justify-end gap-3">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                className="flex items-center justify-center gap-2 w-full sm:w-auto"
              >
                {loading ? (
                  <>
                    <Loader2 className="animate-spin w-4 h-4" /> Processing...
                  </>
                ) : (
                  <>
                    <RocketIcon className="w-4 h-4" /> Save Documentation
                  </>
                )}
              </Button>
            </div>
          </Card>
        )}

        {submitted && (
          <Tab.Group
            selectedIndex={activeTab}
            onChange={setActiveTab}
            as={motion.div}
            className="w-full max-w-3xl"
          >
            <Tab.List className="flex flex-wrap gap-2 sm:gap-4 bg-gray-800/80 p-2 rounded-xl mb-6 shadow-inner justify-center">
              {["📖 Story", "🎞️ Steps", "📝 Challenges", "🃏 Flashcards"].map(
                (tab, i) => (
                  <Tab
                    key={i}
                    className={({ selected }) =>
                      `px-3 sm:px-4 py-1 sm:py-2 rounded-lg font-semibold transition text-sm sm:text-base ${
                        selected
                          ? "bg-primary text-white shadow"
                          : "text-gray-400 hover:bg-gray-700"
                      }`
                    }
                  >
                    {tab}
                  </Tab>
                )
              )}
            </Tab.List>

            <Tab.Panels>
              {/* Story */}
              <Tab.Panel>
                <AnimatePresence mode="wait">
                  {story && (
                    <motion.div
                      key="story-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4, ease: "easeOut" }}
                    >
                      <Card className="shadow-lg border border-gray-700 bg-gray-800/70 w-full">
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <CardTitle className="text-gray-100">
                            📖 Story Mode
                          </CardTitle>
                          <Button
                            variant={copied === "story" ? "default" : "outline"}
                            size="sm"
                            onClick={() => handleCopy("story", story)}
                            className={
                              copied === "story"
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : ""
                            }
                          >
                            {copied === "story" ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                                Copied!
                              </>
                            ) : (
                              <>
                                Copy{" "}
                                <ClipboardIcon className="inline w-4 h-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </CardHeader>
                        <CardContent className="prose prose-invert max-w-none">
                          <Markdown content={story} />
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Tab.Panel>

              {/* Steps */}
              <Tab.Panel>
                <AnimatePresence mode="wait">
                  {steps.length > 0 && (
                    <motion.div
                      key="steps-card"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                    >
                      <Card className="shadow-lg border border-gray-700 bg-gray-800/70 w-full">
                        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                          <CardTitle className="text-gray-100">
                            🎞️ Step-by-Step Explanation
                          </CardTitle>
                          <Button
                            variant={copied === "steps" ? "default" : "outline"}
                            size="sm"
                            onClick={() =>
                              handleCopy("steps", steps.join("\n"))
                            }
                            className={
                              copied === "steps"
                                ? "bg-green-600 text-white hover:bg-green-700"
                                : ""
                            }
                          >
                            {copied === "steps" ? (
                              <>
                                <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                                Copied!
                              </>
                            ) : (
                              <>
                                Copy{" "}
                                <ClipboardIcon className="inline w-4 h-4 ml-1" />
                              </>
                            )}
                          </Button>
                        </CardHeader>
                        <CardContent>
                          <motion.ul
                            className="list-decimal list-inside space-y-3"
                            initial="hidden"
                            animate="visible"
                            variants={{
                              hidden: { opacity: 0 },
                              visible: {
                                opacity: 1,
                                transition: { staggerChildren: 0.08 },
                              },
                            }}
                          >
                            {steps.map((step, i) => (
                              <motion.li
                                key={i}
                                variants={{
                                  hidden: { opacity: 0, x: -20 },
                                  visible: { opacity: 1, x: 0 },
                                }}
                                className="p-3 bg-gray-900/50 rounded-lg border border-gray-700"
                              >
                                <Markdown content={step} />
                              </motion.li>
                            ))}
                          </motion.ul>
                        </CardContent>
                      </Card>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Tab.Panel>

              {/* Challenges */}
              <Tab.Panel>
                <AnimatePresence mode="wait">
                  {challengeList.length > 0 && (
                    <motion.div
                      key="challenges-card"
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.9 }}
                      transition={{ duration: 0.3 }}
                      className="space-y-6"
                    >
                      {challengeList.map((ch, idx) => (
                        <motion.div
                          key={`challenge-${idx}`}
                          initial={{ opacity: 0, y: 15 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: idx * 0.1 }}
                        >
                          <Card className="shadow-lg border border-gray-700 bg-gray-800/70 w-full">
                            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                              <CardTitle className="text-gray-100">
                                📝 Challenge {idx + 1}
                              </CardTitle>

                              <div className="flex flex-col sm:flex-row gap-2">
                                <Button
                                  variant={
                                    copied === `challenge-${idx}`
                                      ? "default"
                                      : "outline"
                                  }
                                  size="sm"
                                  onClick={() =>
                                    handleCopy(`challenge-${idx}`, ch)
                                  }
                                  className={
                                    copied === `challenge-${idx}`
                                      ? "bg-green-600 text-white hover:bg-green-700"
                                      : ""
                                  }
                                >
                                  {copied === `challenge-${idx}` ? (
                                    <>
                                      <CheckCircle2 className="w-4 h-4 mr-1" />{" "}
                                      Copied!
                                    </>
                                  ) : (
                                    <>
                                      Copy{" "}
                                      <ClipboardIcon className="inline w-4 h-4 ml-1" />
                                    </>
                                  )}
                                </Button>

                                <Button
                                  variant="secondary"
                                  size="sm"
                                  onClick={() => {
                                    setCurrentChallenge(ch);
                                    setModalOpen(true);
                                  }}
                                  className="flex items-center gap-1 bg-primary text-white hover:bg-primary/90"
                                >
                                  Take Challenge
                                </Button>
                              </div>
                            </CardHeader>

                            <CardContent className="space-y-4">
                              <Markdown content={ch} />
                            </CardContent>
                          </Card>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Tab.Panel>

              {/* Flashcards */}
              <Tab.Panel>
                <AnimatePresence mode="wait">
                  {flashcards.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                      {flashcards.map((card, idx) => (
                        <Flashcard
                          key={idx}
                          id={`flashcard-${idx}`}
                          question={card.question}
                          answer={card.answer}
                          copied={copied === `flashcard-${idx}`}
                          onCopy={() =>
                            handleCopy(
                              `flashcard-${idx}`,
                              `Q: ${card.question}\nA: ${card.answer}`
                            )
                          }
                        />
                      ))}
                    </div>
                  )}
                </AnimatePresence>
              </Tab.Panel>
            </Tab.Panels>
          </Tab.Group>
        )}

        {modalOpen && (
          <ChallengeSubmissionModal
            challengeText={currentChallenge}
            docId={currentDocId}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}
      </div>
    </ProtectedRoute>
  );
}
