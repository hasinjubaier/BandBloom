"use client";

import React, { useState } from "react";
import {
  Bot,
  Send,
  Loader2,
  ShieldCheck,
  User,
} from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  citations?: string[];
  suggestedFollowUps?: string[];
}

const DEFAULT_MESSAGES: Message[] = [
  {
    id: "init-1",
    role: "assistant",
    content:
      "Hello! I am your **BandBloom IELTS AI Tutor**. I provide targeted guidance grounded in official IELTS Academic and General Training assessment criteria.\n\nAsk me about essay structures, tricky Reading question types, Speaking Part 2 cue cards, or grammar corrections from your Mistake Notebook.",
    citations: ["BandBloom Assessment Criteria Engine v2.0"],
    suggestedFollowUps: [
      "How do I achieve Band 8.0 in Task 2 Writing?",
      "Explain the difference between False and Not Given.",
      "How are Fluency and Coherence graded in Speaking?",
    ],
  },
];

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>(DEFAULT_MESSAGES);
  const [inputPrompt, setInputPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const idCounterRef = React.useRef(0);

  const nextMsgId = (prefix: string) => {
    idCounterRef.current += 1;
    return `${prefix}-${idCounterRef.current}`;
  };

  const handleSend = async (textToSend?: string) => {
    const query = (textToSend || inputPrompt).trim();
    if (!query || loading) return;

    const userMsg: Message = {
      id: nextMsgId("u"),
      role: "user",
      content: query,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputPrompt("");
    setLoading(true);

    try {
      const res = await fetch("/api/tutor/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: query }),
      });

      const data = await res.json();
      if (data.success) {
        const assistantMsg: Message = {
          id: nextMsgId("a"),
          role: "assistant",
          content: data.reply,
          citations: data.citations,
          suggestedFollowUps: data.suggestedFollowUps,
        };
        setMessages((prev) => [...prev, assistantMsg]);
      } else {
        const errorMsg: Message = {
          id: nextMsgId("err"),
          role: "assistant",
          content: data.error || "Sorry, I could not process your query at this moment.",
        };
        setMessages((prev) => [...prev, errorMsg]);
      }
    } catch {
      const errorMsg: Message = {
        id: nextMsgId("err"),
        role: "assistant",
        content: "Network error. Please verify your connection and try again.",
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 max-w-4xl mx-auto flex flex-col h-[calc(100vh-140px)]">
      {/* Header Banner */}
      <section className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-[#25A995]/15 text-[#25A995] flex items-center justify-center">
            <Bot className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-[#123C3A] dark:text-[#F4FAF8]">
              Grounded IELTS AI Tutor
            </h2>
            <div className="text-[11px] text-[#67839A] dark:text-[#A0C5C1] flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#25A995]" />
              <span>Grounded in Official IELTS Band Descriptors & Assessment Criteria</span>
            </div>
          </div>
        </div>
      </section>

      {/* Chat Messages Body */}
      <div className="flex-1 overflow-y-auto space-y-4 p-4 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-start gap-3 ${
              msg.role === "user" ? "flex-row-reverse" : "flex-row"
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-xs font-bold ${
                msg.role === "user"
                  ? "bg-[#123C3A] dark:bg-[#25A995] text-white"
                  : "bg-[#25A995]/15 text-[#25A995]"
              }`}
            >
              {msg.role === "user" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
            </div>

            <div
              className={`max-w-[85%] sm:max-w-[75%] p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-[#25A995] text-white rounded-tr-xs"
                  : "bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] rounded-tl-xs whitespace-pre-line"
              }`}
            >
              {msg.content}

              {/* Citations */}
              {msg.citations && msg.citations.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#D4E8E3]/60 dark:border-[#205653] text-[10px] text-[#67839A] dark:text-[#A0C5C1]">
                  <span className="font-bold uppercase tracking-wider block mb-1">
                    Verified Sources:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5">
                    {msg.citations.map((c, idx) => (
                      <li key={idx}>{c}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Suggested Follow-Ups */}
              {msg.suggestedFollowUps && msg.suggestedFollowUps.length > 0 && (
                <div className="mt-3 pt-2.5 border-t border-[#D4E8E3]/60 dark:border-[#205653] space-y-1.5">
                  <span className="text-[10px] font-bold text-[#67839A] dark:text-[#A0C5C1] uppercase tracking-wider block">
                    Suggested Questions:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {msg.suggestedFollowUps.map((q, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSend(q)}
                        className="text-[11px] font-medium text-left px-2.5 py-1 rounded-lg bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] text-[#123C3A] dark:text-[#F4FAF8] transition-colors"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 p-3 text-xs text-[#67839A] dark:text-[#A0C5C1]">
            <Loader2 className="w-4 h-4 text-[#25A995] animate-spin" />
            <span>Consulting official IELTS criteria...</span>
          </div>
        )}
      </div>

      {/* Input Prompt Box */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSend();
        }}
        className="p-2 sm:p-3 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex items-center gap-2 shrink-0"
      >
        <input
          type="text"
          value={inputPrompt}
          onChange={(e) => setInputPrompt(e.target.value)}
          placeholder="Ask a question about Writing Task 2, TFNG reading, or speaking rubrics..."
          className="flex-1 px-4 py-2 text-xs sm:text-sm bg-transparent border-0 focus:outline-none text-[#123C3A] dark:text-[#F4FAF8] placeholder:text-[#8AA4B7]"
        />
        <button
          type="submit"
          disabled={loading || !inputPrompt.trim()}
          className="px-4 py-2 rounded-xl bg-[#25A995] hover:bg-[#123C3A] disabled:opacity-50 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors shadow-xs"
        >
          <Send className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Ask Tutor</span>
        </button>
      </form>
    </div>
  );
}
