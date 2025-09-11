"use client";

import { useState, useMemo } from "react";
import { motion, easeOut, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Image from "next/image";

interface TechDoc {
  id: number;
  title: string;
  url: string;
  categories: string[];
  description: string;
  logo?: string;
}

const docsData: TechDoc[] = [
  {
    id: 1,
    title: "Next.js",
    url: "https://nextjs.org/docs",
    categories: ["Frontend", "Fullstack", "UI", "Programming"],
    description: "Next.js official docs",
    logo: "/logos/nextjs.png",
  },
  {
    id: 2,
    title: "Appwrite",
    url: "https://appwrite.io/docs",
    categories: ["Backend", "Fullstack", "Database", "Cloud"],
    description: "Appwrite docs",
    logo: "/logos/appwrite.png",
  },
  {
    id: 3,
    title: "Framer Motion",
    url: "https://motion.dev/docs",
    categories: ["Animations", "Frontend", "UI"],
    description: "Motion.dev docs",
    logo: "/logos/motion.png",
  },
  {
    id: 4,
    title: "Tailwind CSS",
    url: "https://tailwindcss.com/docs",
    categories: ["Frontend", "UI", "Programming"],
    description: "Tailwind CSS docs",
    logo: "/logos/tailwindcss.png",
  },
  {
    id: 5,
    title: "shadcn/ui",
    url: "https://ui.shadcn.com/docs",
    categories: ["UI", "Frontend", "Fullstack"],
    description: "Shadcn UI docs",
    logo: "/logos/shadcn.png",
  },
  {
    id: 6,
    title: "Three.js",
    url: "https://threejs.org/docs/",
    categories: ["Graphics", "Frontend", "Animations"],
    description: "Three.js docs",
    logo: "/logos/threejs.png",
  },
  {
    id: 7,
    title: "GSAP",
    url: "https://gsap.com/docs/v3/",
    categories: ["Animations", "Frontend", "UI"],
    description: "GSAP docs",
    logo: "/logos/gsap.svg",
  },
  {
    id: 8,
    title: "Git",
    url: "https://git-scm.com/doc",
    categories: ["Tools", "Programming", "Fullstack"],
    description: "Git official docs",
    logo: "/logos/git.png",
  },
  {
    id: 9,
    title: "GitHub",
    url: "https://docs.github.com/en",
    categories: ["Tools", "Fullstack", "Programming"],
    description: "GitHub docs",
    logo: "/logos/github.webp",
  },
  {
    id: 10,
    title: "Python",
    url: "https://docs.python.org/3/",
    categories: ["Programming", "Backend", "AI"],
    description: "Python docs",
    logo: "/logos/python.png",
  },
  {
    id: 11,
    title: "Java",
    url: "https://docs.oracle.com/en/java/",
    categories: ["Programming", "Backend", "Fullstack"],
    description: "Java docs",
    logo: "/logos/java.png",
  },
  {
    id: 12,
    title: "MDN Web Docs",
    url: "https://developer.mozilla.org/en-US/",
    categories: ["Frontend", "Programming", "UI"],
    description: "Mozilla Developer Network",
    logo: "/logos/mdn.png",
  },
  {
    id: 13,
    title: "Vapi AI",
    url: "https://docs.vapi.ai/quickstart/introduction",
    categories: ["AI", "Tools", "Fullstack"],
    description: "Vapi AI docs",
    logo: "/logos/vapi.png",
  },
  {
    id: 14,
    title: "OpenAI API",
    url: "https://platform.openai.com/docs/overview",
    categories: ["AI", "Backend", "Fullstack"],
    description: "OpenAI API docs",
    logo: "/logos/openai.png",
  },
  {
    id: 15,
    title: "Google Gemini",
    url: "https://ai.google.dev/gemini-api/docs",
    categories: ["AI", "Cloud", "Backend"],
    description: "Google Gemini docs",
    logo: "/logos/gemini.png",
  },
  {
    id: 16,
    title: "C#",
    url: "https://learn.microsoft.com/en-us/dotnet/csharp/",
    categories: ["Programming", "Backend", "Fullstack"],
    description: "C# docs",
    logo: "/logos/cs.png",
  },
  {
    id: 17,
    title: "C++",
    url: "https://devdocs.io/cpp/",
    categories: ["Programming", "Backend", "Fullstack"],
    description: "C++ docs",
    logo: "/logos/cpp.png",
  },
  {
    id: 18,
    title: "C",
    url: "https://devdocs.io/c/",
    categories: ["Programming", "Backend"],
    description: "C docs",
    logo: "/logos/c.png",
  },
  {
    id: 19,
    title: "TypeScript",
    url: "https://www.typescriptlang.org/docs/",
    categories: ["Frontend", "Programming", "Fullstack"],
    description: "TypeScript docs",
    logo: "/logos/typescript.png",
  },
  {
    id: 20,
    title: "Auth.js",
    url: "https://authjs.dev/reference/overview",
    categories: ["Backend", "Fullstack", "Tools"],
    description: "Auth.js docs",
    logo: "/logos/authjs.webp",
  },
  {
    id: 21,
    title: "React",
    url: "https://react.dev/learn",
    categories: ["Frontend", "UI", "Fullstack"],
    description: "React docs",
    logo: "/logos/react.png",
  },
  {
    id: 22,
    title: "Postman",
    url: "https://learning.postman.com/",
    categories: ["Tools", "Backend", "Fullstack"],
    description: "Postman docs",
    logo: "/logos/postman.svg",
  },
  {
    id: 23,
    title: "Blender",
    url: "https://docs.blender.org/",
    categories: ["Graphics", "Animations", "Tools"],
    description: "Blender docs",
    logo: "/logos/blender.png",
  },
  {
    id: 24,
    title: "Google Cloud",
    url: "https://cloud.google.com/docs",
    categories: ["Cloud", "Backend", "Fullstack"],
    description: "Google Cloud docs",
    logo: "/logos/google-cloud.png",
  },
  {
    id: 25,
    title: "AWS",
    url: "https://docs.aws.amazon.com/",
    categories: ["Cloud", "Backend", "Fullstack"],
    description: "AWS docs",
    logo: "/logos/aws.png",
  },
  {
    id: 26,
    title: "Microsoft Docs",
    url: "https://learn.microsoft.com/en-us/docs/",
    categories: ["Programming", "Backend", "Fullstack"],
    description: "Microsoft Docs",
    logo: "/logos/microsoft.webp",
  },
  {
    id: 27,
    title: "Vite",
    url: "https://vite.dev/guide/",
    categories: ["Frontend", "Fullstack", "Tools"],
    description: "Vite docs",
    logo: "/logos/vite.png",
  },
  {
    id: 28,
    title: "MongoDB",
    url: "https://www.mongodb.com/docs/",
    categories: ["Database", "Backend", "Fullstack"],
    description: "MongoDB docs",
    logo: "/logos/mongodb.png",
  },
  {
    id: 29,
    title: "Vercel",
    url: "https://vercel.com/docs",
    categories: ["Frontend", "Fullstack", "Cloud"],
    description: "Vercel docs",
    logo: "/logos/vercel.png",
  },
  {
    id: 30,
    title: "PostgreSQL",
    url: "https://www.postgresql.org/docs/",
    categories: ["Database", "Backend", "Fullstack"],
    description: "PostgreSQL docs",
    logo: "/logos/postgre.png",
  },
  {
    id: 31,
    title: "npm",
    url: "https://docs.npmjs.com/",
    categories: ["Backend", "Tools", "Fullstack"],
    description: "NPM docs",
    logo: "/logos/npm.png",
  },
  {
    id: 32,
    title: "Node.js",
    url: "https://nodejs.org/docs/latest/api/",
    categories: ["Backend", "Fullstack", "Programming"],
    description: "Node.js docs",
    logo: "/logos/nodejs.png",
  },
];

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06, delayChildren: 0.12 },
  },
};

const cardVariants = {
  hidden: { opacity: 0, y: 18 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: easeOut } },
};

export default function ExplorePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [sortOption, setSortOption] = useState("Most Popular");
  const [currentPage, setCurrentPage] = useState(1);

  const itemsPerPage = 12;

  const allCategories = [
    "Frontend",
    "Backend",
    "Fullstack",
    "AI",
    "Programming",
    "Animations",
    "UI",
    "Tools",
    "Graphics",
    "Cloud",
    "Database",
  ];

  const filteredDocs = useMemo(() => {
    let filtered = docsData.slice();

    if (selectedCategories.length > 0) {
      filtered = filtered.filter((doc) =>
        doc.categories.some((cat) => selectedCategories.includes(cat))
      );
    }

    if (searchQuery) {
      filtered = filtered.filter((d) =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    switch (sortOption) {
      case "Alphabetical":
        filtered.sort((a, b) => a.title.localeCompare(b.title));
        break;
      case "Latest":
        filtered.sort((a, b) => b.id - a.id);
        break;
      case "Most Popular":
      default:
        filtered.sort((a, b) => a.id - b.id);
        break;
    }

    return filtered;
  }, [searchQuery, selectedCategories, sortOption]);

  const totalPages = Math.max(1, Math.ceil(filteredDocs.length / itemsPerPage));
  const paginatedDocs = filteredDocs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const gridKey = `${currentPage}-${searchQuery}-${sortOption}-${selectedCategories.join(
    "|"
  )}`;

  return (
    <motion.div
      className="min-h-screen bg-gray-900 py-10 px-3 sm:px-6 lg:px-10 relative"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-transparent to-transparent blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Title */}
        <motion.div
          className="w-full flex flex-col items-center mb-10 text-center"
          variants={cardVariants}
        >
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-primary mb-3">
            Explore Tech Docs
          </h1>
          <motion.p
            className="text-sm sm:text-base md:text-lg text-gray-200 max-w-xl mt-2 leading-relaxed"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Some of the popular tech documentation sites and resources ✨
          </motion.p>
        </motion.div>

        {/* Search + Filter + Sort */}
        <motion.div
          className="flex flex-col sm:flex-row sm:justify-between gap-3 mb-8 items-stretch sm:items-center"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, delay: 0.06 }}
        >
          {/* Search */}
          <Input
            placeholder="Search docs..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full sm:max-w-sm border border-gray-600"
          />

          {/* Filters + Sort */}
          <div className="flex flex-col sm:flex-row gap-3 sm:ml-auto w-full sm:w-auto">
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="border border-gray-700 bg-gray-800 w-full sm:w-auto"
                >
                  Filter Categories ({selectedCategories.length})
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-64 bg-gray-800 border border-gray-700">
                <div className="flex flex-col gap-2">
                  {allCategories.map((cat) => (
                    <div key={cat} className="flex items-center gap-2">
                      <Checkbox
                        checked={selectedCategories.includes(cat)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setSelectedCategories((prev) => [...prev, cat]);
                          } else {
                            setSelectedCategories((prev) =>
                              prev.filter((c) => c !== cat)
                            );
                          }
                          setCurrentPage(1);
                        }}
                        className="border border-gray-600"
                      />
                      <span className="text-gray-200">{cat}</span>
                    </div>
                  ))}
                </div>
              </PopoverContent>
            </Popover>

            <Select
              value={sortOption}
              onValueChange={(value) => {
                setSortOption(value);
                setCurrentPage(1);
              }}
            >
              <SelectTrigger className="w-full sm:w-44 bg-gray-800 border border-gray-700 text-gray-200">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border border-gray-700">
                {["Most Popular", "Latest", "Alphabetical"].map((opt) => (
                  <SelectItem key={opt} value={opt}>
                    {opt}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </motion.div>

        {/* Grid */}
        <div className="max-w-6xl mx-auto relative z-10">
          <AnimatePresence mode="wait">
            <motion.div
              key={gridKey}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.38, ease: "easeInOut" }}
              variants={containerVariants}
            >
              {paginatedDocs.map((doc) => (
                <motion.a
                  key={doc.id}
                  href={doc.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative p-3 sm:p-4 bg-gray-800 rounded-2xl border border-gray-600 shadow-lg flex justify-between overflow-hidden group"
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{
                    scale: 1.05,
                    rotateX: 2,
                    rotateY: -2,
                    transition: { duration: 0.35, ease: "easeOut" },
                  }}
                  whileTap={{ scale: 0.97 }}
                  layout
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/20 via-primary/10 to-primary/20 opacity-30 group-hover:opacity-70 transition-opacity duration-300 pointer-events-none" />

                  <div className="flex flex-col flex-1 pr-3 relative z-10">
                    <motion.h3
                      className="text-base sm:text-lg font-bold text-white mb-1"
                      whileHover={{ x: 4 }}
                      transition={{ type: "spring", stiffness: 200 }}
                    >
                      {doc.title}
                    </motion.h3>

                    <div className="flex flex-wrap gap-1 mb-2">
                      {doc.categories.map((cat) => (
                        <span
                          key={cat}
                          className="px-2 py-0.5 rounded-full bg-primary/20 text-primary text-xs font-medium"
                        >
                          {cat}
                        </span>
                      ))}
                    </div>

                    <p className="text-gray-300 text-xs sm:text-sm flex-1">
                      {doc.description}
                    </p>
                  </div>

                  {doc.logo && (
                    <motion.div
                      whileHover={{ y: -6, rotate: 5 }}
                      transition={{ type: "spring", stiffness: 150 }}
                      className="relative z-10 flex-shrink-0"
                    >
                      <Image
                        src={doc.logo}
                        alt={`${doc.title} logo`}
                        width={40}
                        height={40}
                        className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
                      />
                    </motion.div>
                  )}
                </motion.a>
              ))}
            </motion.div>
          </AnimatePresence>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-wrap justify-center items-center gap-2 mt-8">
              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className="border border-gray-700 rounded-xl"
              >
                Prev
              </Button>

              {Array.from({ length: totalPages }, (_, i) => (
                <Button
                  key={i + 1}
                  size="sm"
                  variant={currentPage === i + 1 ? "default" : "outline"}
                  onClick={() => setCurrentPage(i + 1)}
                  className="border border-gray-700 rounded-xl"
                >
                  {i + 1}
                </Button>
              ))}

              <Button
                variant="outline"
                size="sm"
                disabled={currentPage === totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className="border border-gray-700 rounded-xl"
              >
                Next
              </Button>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
