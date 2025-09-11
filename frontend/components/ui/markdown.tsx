"use client";

import React from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { materialDark } from "react-syntax-highlighter/dist/esm/styles/prism";

interface MarkdownProps {
  content: string;
  className?: string;
}

interface CodeProps {
  inline?: boolean;
  className?: string;
  children?: React.ReactNode;
}

function cleanContent(content: string) {
  return content
    .split("\n")
    .filter((line) => line.trim() !== "**" && line.trim() !== "__")
    .join("\n")
    .trim();
}

export function Markdown({ content, className }: MarkdownProps) {
  const cleaned = cleanContent(content);

  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert",
        "max-w-3xl break-words whitespace-pre-wrap",
        "prose-headings:mt-6 prose-headings:mb-3 prose-p:mb-4 prose-li:mb-2 prose-pre:rounded-xl",
        className
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ inline, className, children, ...props }: CodeProps) {
            const match = /language-(\w+)/.exec(className || "");
            if (!inline && match) {
              return (
                <SyntaxHighlighter
                  language={match[1]}
                  style={
                    materialDark as unknown as {
                      [key: string]: React.CSSProperties;
                    }
                  }
                  PreTag="div"
                  wrapLongLines
                  customStyle={{
                    borderRadius: "0.75rem",
                    padding: "1rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {String(children).replace(/\n$/, "")}
                </SyntaxHighlighter>
              );
            } else {
              return (
                <code
                  className={cn(
                    "bg-gray-800 text-yellow-400 px-1.5 py-0.5 rounded-md text-sm",
                    className
                  )}
                  {...props}
                >
                  {children}
                </code>
              );
            }
          },
        }}
      >
        {cleaned}
      </ReactMarkdown>
    </div>
  );
}
