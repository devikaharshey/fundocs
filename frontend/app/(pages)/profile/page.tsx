"use client";

import { useAuth } from "@/context/AuthContext";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { ProtectedRoute } from "@/components/auth-ui/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Tab } from "@headlessui/react";
import { Markdown } from "@/components/ui/markdown";
import Flashcard from "@/components/ui/Flashcard";
import { toast, Toaster } from "sonner";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChallengeSubmissionModal from "@/components/ui/ChallengeSubmissionModal";
import ReportModal from "@/components/ui/ReportModal";

interface AppUser {
  $id: string;
  name: string;
  email: string;
  avatar?: string;
  prefs?: { avatar?: string };
}

interface Doc {
  $id: string;
  title: string;
  text?: string;
  story?: string;
  steps?: string[];
  challenges?: string;
  flashcards?: { question: string; answer: string }[];
  createdAt: string;
}

export default function ProfilePage() {
  const { user, logout, deleteAccount, loading } = useAuth();
  const router = useRouter();
  const [docs, setDocs] = useState<Doc[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [selectedDoc, setSelectedDoc] = useState<Doc | null>(null);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [currentChallenge, setCurrentChallenge] = useState("");
  const [currentDocId, setCurrentDocId] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [report, setReport] = useState<string>("");
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);

  const userTyped = user as AppUser;

  const BACKEND_URL =
    process.env.NEXT_PUBLIC_BACKEND_URL || "http://127.0.0.1:5000";

  const fetchUserDocs = useCallback(async () => {
    if (!userTyped) return;
    setLoadingDocs(true);
    try {
      const resp = await fetch(
        `${BACKEND_URL}/api/fetch_user_docs?userId=${userTyped.$id}`
      );
      const data = await resp.json();
      if (resp.ok) {
        const normalizedDocs = (data.docs || []).map((doc: Doc) => ({
          ...doc,
          steps: Array.isArray(doc.steps)
            ? doc.steps
            : typeof doc.steps === "string"
            ? (doc.steps as string)
                .split("\n")
                .map((s: string) => s.trim())
                .filter(Boolean)
            : [],
          flashcards: Array.isArray(doc.flashcards)
            ? doc.flashcards
            : typeof doc.flashcards === "string" &&
              (doc.flashcards as string).trim() !== ""
            ? (() => {
                try {
                  return JSON.parse(doc.flashcards as string);
                } catch {
                  return [];
                }
              })()
            : [],
        }));
        setDocs(normalizedDocs);
      }
    } catch (err) {
      toast.error("Failed to fetch docs:" + (err as Error).message);
    } finally {
      setLoadingDocs(false);
    }
  }, [BACKEND_URL, userTyped]);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
    else fetchUserDocs();
  }, [user, loading, router, fetchUserDocs]);

  const handleDeleteDoc = async (docId: string) => {
    if (!userTyped) return;
    try {
      const resp = await fetch(`${BACKEND_URL}/api/delete-doc`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: userTyped.$id, docId }),
      });
      if (resp.ok) setDocs(docs.filter((d) => d.$id !== docId));
      if (selectedDoc?.$id === docId) setSelectedDoc(null);
    } catch (err) {
      toast.error("Failed to delete doc:" + (err as Error).message);
    }
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(null), 2000);
  };

  const filteredDocs = docs
    .filter((doc) =>
      doc.title.toLowerCase().includes(searchQuery.toLowerCase())
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return (
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
      } else {
        return (
          new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        );
      }
    });

  const generateReport = async () => {
    if (!userTyped) return;
    setLoadingReport(true);
    try {
      const res = await fetch(`${BACKEND_URL}/api/generate_report`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ user_id: userTyped.$id }),
      });

      if (!res.ok) {
        toast.error("Failed to generate report:" + (await res.text()));
        return;
      }

      const data = await res.json();
      setReport(data.report ?? "No report available.");
      setIsReportModalOpen(true);
    } catch (err) {
      toast.error("Error:" + (err as Error).message);
    } finally {
      setLoadingReport(false);
    }
  };

  if (loading || !user)
    return (
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
          Loading Profile...
        </motion.p>
      </div>
    );

  const avatarUrl = userTyped.prefs?.avatar
    ? `${process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT}/storage/buckets/${process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID}/files/${userTyped.prefs.avatar}/view?project=${process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID}`
    : "/default-avatar.png";

  const challengeList = selectedDoc?.challenges
    ? selectedDoc.challenges
        .split(/Challenge Ended/i)
        .map((c) => c.trim())
        .filter(Boolean)
    : [];

  return (
    <ProtectedRoute>
      <Toaster position="top-right" richColors />
      <div className="relative font-sans w-full min-h-screen flex flex-col items-center pt-24 px-4 sm:px-6 md:px-8 bg-gray-900">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

        {/* Profile Info */}
        <motion.div
          className="max-w-2xl w-full mb-6 p-6 flex flex-col items-center"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        >
          <Image
            src={avatarUrl}
            alt={`${userTyped.name || "User"} avatar`}
            width={96}
            height={96}
            className="w-24 h-24 rounded-full mb-4 object-cover border-2 border-gray-700"
          />
          <h1 className="text-2xl font-bold text-primary text-center">
            {userTyped.name || "Unnamed User"}
          </h1>
          <p className="text-gray-200 text-center">{userTyped.email}</p>

          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 mt-4 w-full">
            <Button
              onClick={logout}
              className="bg-primary hover:bg-primary-dark w-full sm:w-auto"
            >
              Logout
            </Button>
            <Button
              variant="destructive"
              onClick={deleteAccount}
              className="bg-red-600 hover:bg-red-700 w-full sm:w-auto"
            >
              Delete Account
            </Button>
            <Button
              onClick={generateReport}
              disabled={loadingReport}
              className="border border-white text-white bg-gray-800 hover:bg-gray-500/30 hover:text-gray-300 hover:border-gray-300 w-full sm:w-auto"
            >
              {loadingReport ? "Generating..." : "Generate Current Progress"}
            </Button>
          </div>
        </motion.div>

        {/* Docs Table */}
        <motion.div
          className="max-w-5xl w-full mb-6 p-4 bg-gray-900 rounded-xl shadow-md border border-gray-600 overflow-x-auto"
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 0.2 }}
        >
          <h2 className="text-xl font-bold mb-4 text-gray-100">
            Your Documents
          </h2>

          {/* Search and Filter */}
          <div className="flex flex-col md:flex-row md:justify-between mb-4 gap-2">
            <Input
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="max-w-full md:max-w-sm border-gray-600 flex-1"
            />
            <Select
              value={sortOrder}
              onValueChange={(val: "newest" | "oldest") => setSortOrder(val)}
            >
              <SelectTrigger className="w-full md:w-40">
                <SelectValue placeholder="Sort by Date" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest First</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {loadingDocs ? (
            <p className="text-gray-400 text-center">
              Loading your documents...
            </p>
          ) : filteredDocs.length === 0 ? (
            <p className="text-gray-400 text-center">No documents found.</p>
          ) : (
            <table className="w-full text-left text-gray-200 border-collapse min-w-[400px] md:min-w-full">
              <thead className="bg-gray-800">
                <tr>
                  <th className="p-3 text-sm font-semibold">Title</th>
                  <th className="p-3 text-sm font-semibold">Created At</th>
                  <th className="p-3 text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDocs.map((doc, index) => (
                  <motion.tr
                    key={doc.$id}
                    className="hover:bg-gray-800 transition-colors duration-200"
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: "easeOut",
                    }}
                  >
                    <td className="p-3">{doc.title}</td>
                    <td className="p-3">
                      {new Date(doc.createdAt).toLocaleString()}
                    </td>
                    <td className="p-3 flex flex-wrap gap-2">
                      <Button size="sm" onClick={() => setSelectedDoc(doc)}>
                        View
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => handleDeleteDoc(doc.$id)}
                        className="bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </Button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </motion.div>

        {/* Selected Doc Panel */}
        <AnimatePresence>
          {selectedDoc && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-3xl p-6 overflow-y-auto max-h-[90vh] bg-gray-900 rounded-xl shadow-lg scrollbar-hidden"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-4">
                  <h2 className="text-xl font-bold text-gray-100">
                    {selectedDoc.title}
                  </h2>
                  <Button
                    variant="ghost"
                    onClick={() => setSelectedDoc(null)}
                    className="border border-gray-600 bg-gray-900 hover:bg-gray-600"
                  >
                    Close
                  </Button>
                </div>

                <Tab.Group selectedIndex={activeTab} onChange={setActiveTab}>
                  <Tab.List className="flex flex-wrap gap-2 p-2 rounded-xl mb-6 border-b border-gray-700">
                    {[
                      "📖 Story",
                      "🎞️ Steps",
                      "📝 Challenges",
                      "🃏 Flashcards",
                    ].map((tab, i) => (
                      <Tab
                        key={i}
                        className={({ selected }) =>
                          `px-4 py-2 rounded-lg font-semibold transition ${
                            selected
                              ? "bg-primary text-white"
                              : "text-gray-400 hover:bg-gray-800"
                          }`
                        }
                      >
                        {tab}
                      </Tab>
                    ))}
                  </Tab.List>

                  <Tab.Panels>
                    {/* Story */}
                    <Tab.Panel>
                      {selectedDoc.story ? (
                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.3 }}
                          className="mb-4"
                        >
                          <Markdown content={selectedDoc.story} />
                        </motion.div>
                      ) : (
                        <p className="text-gray-400">No story available.</p>
                      )}
                    </Tab.Panel>

                    {/* Steps */}
                    <Tab.Panel>
                      {selectedDoc.steps && selectedDoc.steps.length > 0 ? (
                        <motion.ul
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="list-decimal list-inside space-y-2"
                        >
                          {selectedDoc.steps.map((step, i) => (
                            <li key={i} className="text-gray-200">
                              <Markdown content={step} />
                            </li>
                          ))}
                        </motion.ul>
                      ) : (
                        <p className="text-gray-400">No steps available.</p>
                      )}
                    </Tab.Panel>

                    {/* Challenges */}
                    <Tab.Panel>
                      {challengeList.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="space-y-3"
                        >
                          {challengeList.map((c, i) => (
                            <div
                              key={i}
                              className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 p-4 bg-gray-800 rounded-lg"
                            >
                              <div className="flex-1 text-gray-200">
                                <Markdown content={c} />
                              </div>
                              <Button
                                variant="secondary"
                                size="sm"
                                onClick={() => {
                                  setCurrentChallenge(c);
                                  setCurrentDocId(selectedDoc.$id);
                                  setModalOpen(true);
                                }}
                                className="flex items-center gap-1 bg-primary text-white hover:bg-primary/90"
                              >
                                Take Challenge
                              </Button>
                            </div>
                          ))}
                        </motion.div>
                      ) : (
                        <p className="text-gray-400">
                          No challenges available.
                        </p>
                      )}
                    </Tab.Panel>

                    {/* Flashcards */}
                    <Tab.Panel>
                      {selectedDoc.flashcards &&
                      selectedDoc.flashcards.length > 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.4 }}
                          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
                        >
                          {selectedDoc.flashcards.map((f, i) => (
                            <Flashcard
                              key={i}
                              id={`flashcard-${i}`}
                              question={f.question}
                              answer={f.answer}
                              copied={copied === `flashcard-${i}`}
                              onCopy={() =>
                                handleCopy(
                                  `flashcard-${i}`,
                                  `Q: ${f.question}\nA: ${f.answer}`
                                )
                              }
                            />
                          ))}
                        </motion.div>
                      ) : (
                        <p className="text-gray-400">
                          No flashcards available.
                        </p>
                      )}
                    </Tab.Panel>
                  </Tab.Panels>
                </Tab.Group>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {modalOpen && (
          <ChallengeSubmissionModal
            challengeText={currentChallenge}
            docId={currentDocId}
            open={modalOpen}
            onClose={() => setModalOpen(false)}
          />
        )}
        <ReportModal
          isOpen={isReportModalOpen}
          onClose={() => setIsReportModalOpen(false)}
          report={report}
        />
      </div>
    </ProtectedRoute>
  );
}
