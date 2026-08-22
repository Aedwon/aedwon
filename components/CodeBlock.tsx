"use client";

import React, { useState, useMemo } from "react";
import hljs from "highlight.js/lib/core";
import dart from "highlight.js/lib/languages/dart";
import typescript from "highlight.js/lib/languages/typescript";
import javascript from "highlight.js/lib/languages/javascript";
import python from "highlight.js/lib/languages/python";
import sql from "highlight.js/lib/languages/sql";
import json from "highlight.js/lib/languages/json";
import bash from "highlight.js/lib/languages/bash";
import { Check, Copy } from "lucide-react";
import { useTheme } from "@/components/ThemeContext";

// Register key languages
hljs.registerLanguage("dart", dart);
hljs.registerLanguage("typescript", typescript);
hljs.registerLanguage("ts", typescript);
hljs.registerLanguage("javascript", javascript);
hljs.registerLanguage("js", javascript);
hljs.registerLanguage("python", python);
hljs.registerLanguage("py", python);
hljs.registerLanguage("sql", sql);
hljs.registerLanguage("json", json);
hljs.registerLanguage("bash", bash);
hljs.registerLanguage("sh", bash);

interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  className?: string;
}

export default function CodeBlock({
  code,
  language = "dart",
  filename,
  className = "",
}: CodeBlockProps) {
  const [copied, setCopied] = useState(false);
  let isNeobrutalist = false;

  try {
    const themeContext = useTheme();
    isNeobrutalist = themeContext.theme === "neobrutalist";
  } catch {
    isNeobrutalist = false;
  }

  const cleanCode = code.trim();

  // Syntax highlighting with fallback
  const highlighted = useMemo(() => {
    try {
      if (language && hljs.getLanguage(language)) {
        return hljs.highlight(cleanCode, { language }).value;
      }
      return hljs.highlightAuto(cleanCode).value;
    } catch {
      return cleanCode
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;");
    }
  }, [cleanCode, language]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(cleanCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const lines = cleanCode.split("\n");

  if (isNeobrutalist) {
    return (
      <div className={`my-4 border-[3px] border-black bg-white shadow-[4px_4px_0px_#000000] ${className}`}>
        {/* Header Bar */}
        <div className="flex justify-between items-center bg-[#FFE600] px-3 py-1.5 border-b-[2px] border-black font-mono text-[11px] font-black uppercase text-black">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-black inline-block" />
            <span>{filename || language || "CODE"}</span>
          </div>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 bg-white hover:bg-black hover:text-white px-2 py-0.5 border border-black text-[10.5px] font-black uppercase transition-colors cursor-pointer shadow-[1px_1px_0px_#000000] active:translate-x-[1px] active:translate-y-[1px]"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-green-600" />
                <span>COPIED</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>COPY</span>
              </>
            )}
          </button>
        </div>

        {/* Code Content */}
        <div className="bg-[#191613] p-4 overflow-x-auto">
          <pre className="font-mono text-[12px] leading-[1.65] text-[#EFEAE0]">
            <code
              className="hljs-code-content font-mono"
              dangerouslySetInnerHTML={{ __html: highlighted }}
            />
          </pre>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`my-4 rounded-xl border border-white/10 bg-[#0E0F12] shadow-md overflow-hidden ${className}`}
    >
      {/* Editor Top Bar */}
      <div className="flex justify-between items-center px-4 py-2 bg-[#16181D] border-b border-white/5 font-mono text-[11px] text-[#8E8E93]">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#FF5F56]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#FFBD2E]/80 inline-block" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27C93F]/80 inline-block" />
          </div>
          <span className="ml-2 font-mono text-[11px] text-[#9CA3AF] uppercase">
            {filename || language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-all text-[11px] cursor-pointer"
          title="Copy code"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              <span className="text-emerald-400">Copied</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code with Line Numbers */}
      <div className="flex p-4 overflow-x-auto text-[12.5px] leading-[1.65] font-mono">
        <div className="select-none text-gray-400 text-right pr-4 font-mono shrink-0 border-r border-white/5">
          {lines.map((_, i) => (
            <div key={i}>{i + 1}</div>
          ))}
        </div>
        <pre className="pl-4 overflow-x-auto flex-1 font-mono text-gray-200">
          <code
            className="hljs-code-content font-mono"
            dangerouslySetInnerHTML={{ __html: highlighted }}
          />
        </pre>
      </div>
    </div>
  );
}
