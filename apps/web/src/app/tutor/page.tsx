"use client";

import React, { useState } from "react";
import {
  BrainCircuit,
  Send,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Flag,
  Globe,
  RotateCcw,
  BookOpen,
} from "lucide-react";
import { MOCK_RAG_SOURCES } from "@/data/mockCurriculum";
import { useLanguage } from "@/context/LanguageContext";

interface ChatMessage {
  id: string;
  sender: "user" | "tutor";
  text: string;
  sources?: typeof MOCK_RAG_SOURCES;
  confidenceLabel?: "supported" | "limited" | "insufficient_evidence";
  timestamp: string;
}

export default function AITutorPage() {
  const { language } = useLanguage();
  const [inputMessage, setInputMessage] = useState("");
  const [selectedSkill, setSelectedSkill] = useState<"general" | "reading" | "listening" | "writing" | "speaking">("writing");
  const [tutorLanguage, setTutorLanguage] = useState<"en" | "bn">("en");
  const [isTyping, setIsTyping] = useState(false);
  const [reported, setReported] = useState<Record<string, boolean>>({});

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-init",
      sender: "tutor",
      text:
        tutorLanguage === "bn"
          ? "নমস্কার! আমি BandBloom-এর RAG-ভিত্তিক IELTS AI টিউটর। ব্রিটিশ কাউন্সিল ও কেমব্রিজের অফিসিয়াল সিলেবাস এবং মার্কিং রুব্রিক অনুযায়ী আপনার প্রশ্নের উত্তর দিতে প্রস্তুত। আপনি রাইটিং, রিডিং, লিসেনিং বা স্পিকিং সংক্রান্ত যেকোনো প্রশ্ন করতে পারেন।"
          : "Hello! I am BandBloom's RAG-grounded IELTS Preparation Tutor. I reference verified syllabus documentation, assessment rubrics, and computer-delivered exam guidelines. How can I assist your study today?",
      confidenceLabel: "supported",
      sources: [MOCK_RAG_SOURCES[0]],
      timestamp: "10:00 AM",
    },
  ]);

  const handleSendMessage = () => {
    if (!inputMessage.trim() || inputMessage.length < 3) return;

    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: "user",
      text: inputMessage,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputMessage("");
    setIsTyping(true);

    setTimeout(() => {
      setIsTyping(false);

      // Determine RAG response simulation
      let tutorText = "";
      let citedSource = MOCK_RAG_SOURCES[0];
      let confidence: "supported" | "limited" | "insufficient_evidence" = "supported";

      const lower = userMsg.text.toLowerCase();
      if (lower.includes("round") || lower.includes("calculate") || lower.includes("রাউন্ডিং") || lower.includes("গড়")) {
        citedSource = MOCK_RAG_SOURCES[2];
        tutorText =
          tutorLanguage === "bn"
            ? "অফিসিয়াল নিয়মে (Section 5.3): চারটি দক্ষতার স্কোরের গড় যদি .২৫-এ শেষ হয়, তবে তা পরবর্তী হাফ ব্যান্ডে (যেমন: ৬.২৫ -> ৬.৫) রাউন্ড আপ হয়। আর যদি .৭৫-এ শেষ হয়, তবে তা পরবর্তী পূর্ণ ব্যান্ডে (যেমন: ৬.৭৫ -> ৭.০) উন্নীত হয়।"
            : "Under official scoring regulations (Section 5.3): If the average of the 4 skill scores ends in .25, it is rounded up to the next half band (e.g., 6.25 -> 6.5). If it ends in .75, it is rounded up to the next full band (e.g., 6.75 -> 7.0).";
      } else if (lower.includes("paper") || lower.includes("computer") || lower.includes("2026") || lower.includes("retake")) {
        citedSource = MOCK_RAG_SOURCES[1];
        tutorText =
          tutorLanguage === "bn"
            ? "মার্চ ২০২৬-এর অফিসিয়াল আপডেট অনুসারে কম্পিউটার-ডেলিভার্ড পরীক্ষাকে বিশ্বব্যাপী প্রাথমিক ডেলিভারি মোড করা হয়েছে। এর আওতায় প্রার্থীরা পরীক্ষার ৬০ দিনের মধ্যে যেকোনো একটি দুর্বল স্কিলের জন্য 'One Skill Retake' দিতে পারেন।"
            : "According to official 2026 test delivery policies, Computer-Delivered IELTS is the primary global standard. Candidates are also eligible for 'One Skill Retake' within 60 days of their original test date to improve a single component.";
      } else if (lower.includes("task 2") || lower.includes("coherence") || lower.includes("thesis")) {
        citedSource = MOCK_RAG_SOURCES[0];
        tutorText =
          tutorLanguage === "bn"
            ? "Writing Task 2-এ Coherence & Cohesion ৭+ পেতে হলে প্রতিটি বডি প্যারাগ্রাফে একক কেন্দ্রীয় ধারণা (Topic Sentence) রাখুন। মেকানিক্যাল সংযোগকারী শব্দের পুনরাবৃত্তি না করে সাবলীল প্রোনাউন রেফারেন্স ও প্যারাফ্র্যাজিং ব্যবহার করুন।"
            : "To score 7.0+ in Task 2 Coherence & Cohesion, ensure clear progression throughout with a single central topic in each paragraph. Minimize mechanical linkers and emphasize lexical referencing and logical argumentation.";
      } else {
        tutorText =
          tutorLanguage === "bn"
            ? "আপনার প্রশ্নের উত্তর অনুসন্ধানে অফিসিয়াল সিলেবাস গাইডলাইন থেকে তথ্য সংগ্রহ করা হয়েছে। রুব্রিকের প্রতিটি শর্তপূরণ ও নির্দিষ্ট শব্দসীমা মেনে উত্তর লিখুন।"
            : "Based on official IELTS descriptors, high-scoring candidates consistently fulfill all parts of the task while adhering to required time and word count limits.";
      }

      const botMsg: ChatMessage = {
        id: `bot-${Date.now()}`,
        sender: "tutor",
        text: tutorText,
        confidenceLabel: confidence,
        sources: [citedSource],
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      };

      setMessages((prev) => [...prev, botMsg]);
    }, 1200);
  };

  const handleReport = (msgId: string) => {
    setReported((prev) => ({ ...prev, [msgId]: true }));
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex flex-col h-[calc(100vh-140px)]">
      {/* Top Controller Bar */}
      <div className="bg-white dark:bg-[#123C3A] p-4 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] flex flex-wrap items-center justify-between gap-4 mb-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#E8F7F4] dark:bg-[#25A995]/20 border border-[#25A995]/30 flex items-center justify-center text-[#25A995] shadow-sm">
            <BrainCircuit className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8] flex items-center gap-2">
              <span>Band<span className="text-[#25A995]">Bloom</span> RAG AI Tutor</span>
              <span className="w-2 h-2 rounded-full bg-[#25A995] animate-pulse" />
            </h1>
            <p className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1]">
              Grounded in verified official curriculum & rubric sources (Section 11)
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 text-xs">
          {/* Skill Context */}
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value as any)}
            className="bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] rounded-xl px-3 py-1.5 focus:outline-none focus:border-[#25A995]"
          >
            <option value="general">All Skills / General</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="writing">Writing</option>
            <option value="speaking">Speaking</option>
          </select>

          {/* Tutor Language */}
          <div className="flex items-center bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-xl p-0.5">
            <button
              onClick={() => setTutorLanguage("en")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                tutorLanguage === "en" ? "bg-[#25A995] text-white shadow-sm" : "text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setTutorLanguage("bn")}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-colors ${
                tutorLanguage === "bn" ? "bg-[#25A995] text-white shadow-sm" : "text-[#3D6462] dark:text-[#A0C5C1]"
              }`}
            >
              বাংলা
            </button>
          </div>
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-[#123C3A] p-6 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] space-y-5 mb-4 shadow-sm">
        {messages.map((m) => (
          <div
            key={m.id}
            className={`flex flex-col ${
              m.sender === "user" ? "items-end" : "items-start"
            }`}
          >
            <div
              className={`max-w-2xl rounded-2xl p-4 text-xs leading-relaxed ${
                m.sender === "user"
                  ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/20"
                  : "bg-[#F4FAF8] dark:bg-[#0A1C1B]/90 border border-[#D4E8E3] dark:border-[#205653] text-[#123C3A] dark:text-[#F4FAF8] space-y-3"
              }`}
            >
              <p className="whitespace-pre-line text-sm">{m.text}</p>

              {/* RAG Metadata drawer */}
              {m.sources && m.sources.length > 0 && (
                <div className="pt-3 border-t border-[#D4E8E3] dark:border-[#205653] space-y-2">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="flex items-center gap-1 font-semibold text-[#25A995]">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Evidence Verified
                    </span>

                    {/* Report False Answer button (Section 8.3) */}
                    <button
                      onClick={() => handleReport(m.id)}
                      className="text-[#3D6462] hover:text-[#FF8A65] dark:text-[#A0C5C1] dark:hover:text-[#FF8A65] text-[10px] flex items-center gap-1 transition-colors"
                    >
                      <Flag className="w-3 h-3 text-[#FF8A65]" />
                      <span>{reported[m.id] ? "Reported to Reviewers" : "Report Inaccuracy"}</span>
                    </button>
                  </div>

                  <div className="space-y-1">
                    {m.sources.map((s) => (
                      <a
                        key={s.id}
                        href={s.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#123C3A]/80 border border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] text-[#3D6462] hover:text-[#123C3A] dark:text-[#A0C5C1] dark:hover:text-[#F4FAF8] transition-all text-[11px]"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          <BookOpen className="w-3 h-3 text-[#25A995] shrink-0" />
                          <span className="truncate">{s.title}</span>
                        </div>
                        <ExternalLink className="w-3 h-3 text-[#3D6462] dark:text-[#A0C5C1] shrink-0 ml-2" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <span className="text-[10px] text-[#3D6462] dark:text-[#A0C5C1] mt-1 px-1">
              {m.timestamp}
            </span>
          </div>
        ))}

        {isTyping && (
          <div className="flex items-center gap-2 text-xs text-[#3D6462] dark:text-[#A0C5C1] p-3 bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] rounded-2xl w-fit">
            <Sparkles className="w-4 h-4 text-[#25A995] animate-spin" />
            <span>Searching syllabus knowledge base & generating answer...</span>
          </div>
        )}
      </div>

      {/* Input Form */}
      <div className="bg-white dark:bg-[#123C3A] p-3 rounded-2xl border border-[#D4E8E3] dark:border-[#205653] flex items-center gap-3 shadow-sm">
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
          placeholder={
            tutorLanguage === "bn"
              ? "IELTS সিলেবাস, রুব্রিক বা কোনো প্রশ্ন সম্পর্কে জিজ্ঞাসা করুন..."
              : "Ask any question about test format, marking rubrics, or strategy..."
          }
          className="flex-1 bg-transparent px-3 py-2 text-sm text-[#123C3A] dark:text-[#F4FAF8] placeholder:text-[#3D6462] dark:placeholder:text-[#A0C5C1] focus:outline-none"
        />

        <button
          onClick={handleSendMessage}
          disabled={!inputMessage.trim() || isTyping}
          className="p-3 rounded-xl bg-[#25A995] hover:bg-[#1D8B7A] disabled:opacity-40 text-white shadow-md shadow-[#25A995]/20 border border-transparent transition-all flex items-center justify-center shrink-0"
        >
          <Send className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
