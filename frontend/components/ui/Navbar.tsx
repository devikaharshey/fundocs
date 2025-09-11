"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Book, Menu, X } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { href: "/", label: "Home" },
    { href: "/explore", label: "Explore" },
    { href: "/add", label: "Add Docs" },
    { href: "/dashboard", label: "Dashboard" },
    { href: "/profile", label: "Profile" },
  ];

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsOpen(true);
      } else {
        setIsOpen(false);
      }
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <nav className="sticky top-0 z-50 bg-gray-900/80 backdrop-blur-md border-b border-gray-800 shadow-lg">
      <div className="flex items-center justify-between px-6 py-4">
        {/* Brand */}
        <Link href="/">
          <h1 className="text-2xl font-extrabold text-primary tracking-wide flex items-center gap-0">
            <span>Fun</span>
            <Book className="inline-block w-6 h-6 text-primary -mt-1" />
            <span>ocs</span>
          </h1>
        </Link>

        {/* Right side: links + toggle */}
        <div className="flex items-center gap-4">
          {/* Nav Links */}
          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                transition={{ duration: 0.25 }}
                className="flex flex-col absolute top-full left-0 w-full bg-gray-900 md:bg-transparent md:static md:flex-row gap-3 md:gap-6 items-center p-4 md:p-0"
              >
                {links.map((link) => {
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className={`px-4 py-2 rounded-xl font-medium transition-all duration-200 ${
                        isActive
                          ? "bg-primary text-white shadow-md"
                          : "text-gray-300 hover:text-white hover:bg-gray-700/60"
                      }`}
                      onClick={() =>
                        window.innerWidth < 768 && setIsOpen(false)
                      }
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Toggle button (mobile) */}
          <button
            className="text-gray-300 hover:text-white transition md:hidden"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>
      </div>
    </nav>
  );
}
