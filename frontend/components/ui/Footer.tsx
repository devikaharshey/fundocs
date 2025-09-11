import Image from "next/image";
import { Linkedin, Mail } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-gray-800 py-6 px-6 text-gray-400 text-sm">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 items-center text-center sm:text-left gap-4">
        {/* Left: Built with Love */}
        <div className="flex justify-center sm:justify-start items-center gap-2">
          <span>Built with ❤️ by</span>
          <span className="font-medium text-white">Devika Harshey</span>
        </div>

        {/* Center: Powered by Appwrite */}
        <div className="flex justify-center items-center gap-2">
          <span>⚡ Powered by</span>
          <div className="flex items-center gap-1">
            <Image
              height={20}
              width={20}
              src="/logos/appwrite.png"
              alt="Appwrite Logo"
              className="h-5 w-5"
            />
            <span className="font-semibold text-primary-light">Appwrite</span>
          </div>
        </div>

        {/* Right: Social Icons */}
        <div className="flex justify-center sm:justify-end items-center gap-4">
          <a
            href="https://www.linkedin.com/in/devika-harshey-b4b961290/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-primary transition"
          >
            <Linkedin className="h-5 w-5" />
          </a>
          <a
            href="mailto:devika.harshey@gmail.com"
            className="hover:text-primary transition"
          >
            <Mail className="h-5 w-5" />
          </a>
        </div>
      </div>
    </footer>
  );
}
