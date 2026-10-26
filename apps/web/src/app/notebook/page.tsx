"use client";

import React, { useState, useEffect } from "react";
import {
  Bookmark,
  Plus,
  CheckCircle2,
  BookOpen,
  Headphones,
  Edit3,
  Mic,
  Loader2,
  X,
} from "lucide-react";
import { MistakeNoteData } from "@/server/services/notebook.service";

export default function MistakeNotebookPage() {
  const [mistakes, setMistakes] = useState<MistakeNoteData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSkill, setSelectedSkill] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newNote, setNewNote] = useState({
    skill: "reading" as "reading" | "listening" | "writing" | "speaking",
    errorTag: "keyword trap",
    questionPrompt: "",
    studentAnswer: "",
    reasoning: "",
  });
  const [addingNote, setAddingNote] = useState(false);

  const fetchMistakes = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (selectedSkill !== "all") params.append("skill", selectedSkill);
      if (selectedStatus !== "all") params.append("retryStatus", selectedStatus);

      const res = await fetch(`/api/notebook?${params.toString()}`);
      const json = await res.json();
      if (json.success) {
        setMistakes(json.mistakes);
      }
    } catch (e: unknown) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    if (selectedSkill !== "all") params.append("skill", selectedSkill);
    if (selectedStatus !== "all") params.append("retryStatus", selectedStatus);

    fetch(`/api/notebook?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (!isMounted) return;
        if (json.success) {
          setMistakes(json.mistakes);
        }
      })
      .catch((e: unknown) => {
        console.error(e);
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSkill, selectedStatus]);

  const handleToggleStatus = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "mastered" ? "pending" : "mastered";

    // Optimistic UI update
    setMistakes((prev) =>
      prev.map((m) => (m.id === id ? { ...m, retryStatus: nextStatus } : m))
    );

    try {
      await fetch("/api/notebook", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ noteId: id, retryStatus: nextStatus }),
      });
    } catch {
      fetchMistakes();
    }
  };

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNote.questionPrompt || !newNote.studentAnswer || !newNote.reasoning) return;
    setAddingNote(true);
    try {
      const res = await fetch("/api/notebook", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newNote,
          sourceAttemptId: null, // Always safe UUID or null
          questionId: null,
        }),
      });
      const json = await res.json();
      if (json.success) {
        setAddModalOpen(false);
        setNewNote({
          skill: "reading",
          errorTag: "keyword trap",
          questionPrompt: "",
          studentAnswer: "",
          reasoning: "",
        });
        fetchMistakes();
      }
    } catch {}
    setAddingNote(false);
  };

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "listening":
        return <Headphones className="w-4 h-4 text-sky-600" />;
      case "writing":
        return <Edit3 className="w-4 h-4 text-amber-600" />;
      case "speaking":
        return <Mic className="w-4 h-4 text-indigo-600" />;
      default:
        return <BookOpen className="w-4 h-4 text-[#25A995]" />;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/15 text-rose-600 text-xs font-bold uppercase tracking-wider">
            <Bookmark className="w-3.5 h-3.5" />
            <span>Targeted Error Diagnostics</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            IELTS Mistake Notebook
          </h2>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl">
            Analyze why mistakes occurred (keyword traps, paraphrase misses, pluralization, or time pressure) to prevent repeating them on test day.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Log New Error Note</span>
        </button>
      </section>

      {/* Filter Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedSkill}
            onChange={(e) => setSelectedSkill(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
          >
            <option value="all">All Skills</option>
            <option value="reading">Reading</option>
            <option value="listening">Listening</option>
            <option value="writing">Writing</option>
            <option value="speaking">Speaking</option>
          </select>

          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending Review</option>
            <option value="mastered">Mastered / Resolved</option>
          </select>
        </div>

        <div className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
          {mistakes.filter((m) => m.retryStatus !== "mastered").length} unresolved items
        </div>
      </div>

      {/* Mistake Cards */}
      {loading ? (
        <div className="space-y-4 animate-pulse">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-36 bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
      ) : mistakes.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-2">
          <p className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            No mistake notes found
          </p>
          <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
            As you practice mock exams, log questions you missed here for targeted review.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {mistakes.map((note) => (
            <div
              key={note.id}
              className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs space-y-4"
            >
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995] inline-flex items-center gap-1">
                    {getSkillIcon(note.skill)}
                    {note.skill}
                  </span>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300">
                    {note.errorTag}
                  </span>
                </div>

                <button
                  onClick={() => handleToggleStatus(note.id, note.retryStatus)}
                  className={`text-[11px] font-bold px-3 py-1 rounded-full border transition-colors cursor-pointer flex items-center gap-1.5 ${
                    note.retryStatus === "mastered"
                      ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300"
                      : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-300"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{note.retryStatus === "mastered" ? "Mastered" : "Mark Mastered"}</span>
                </button>
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#67839A] dark:text-[#A0C5C1] block mb-1">
                  Question Prompt
                </span>
                <p className="text-xs sm:text-sm font-semibold text-[#123C3A] dark:text-[#F4FAF8]">
                  {note.questionPrompt}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-3.5 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/40 text-xs">
                  <span className="font-bold text-rose-700 dark:text-rose-300 block mb-1">
                    My Incorrect Response:
                  </span>
                  <span className="text-rose-950 dark:text-rose-200 font-mono">
                    {note.studentAnswer}
                  </span>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-900/40 text-xs">
                  <span className="font-bold text-emerald-700 dark:text-emerald-300 block mb-1">
                    Correct Reasoning:
                  </span>
                  <span className="text-emerald-950 dark:text-emerald-200">
                    {note.reasoning}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Mistake Note Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
              <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                Log Question Error to Notebook
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-[#67839A] hover:bg-[#F4FAF8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                    Skill *
                  </label>
                  <select
                    value={newNote.skill}
                    onChange={(e) =>
                      setNewNote({
                        ...newNote,
                        skill: e.target.value as "reading" | "listening" | "writing" | "speaking",
                      })
                    }
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                  >
                    <option value="reading">Reading</option>
                    <option value="listening">Listening</option>
                    <option value="writing">Writing</option>
                    <option value="speaking">Speaking</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                    Error Diagnosis Tag *
                  </label>
                  <select
                    value={newNote.errorTag}
                    onChange={(e) => setNewNote({ ...newNote, errorTag: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                  >
                    <option value="keyword trap">Keyword Trap</option>
                    <option value="paraphrase miss">Paraphrase Miss</option>
                    <option value="inference trap">Inference Trap</option>
                    <option value="singular/plural">Singular / Plural Misspelling</option>
                    <option value="word limit">Exceeded Word Limit</option>
                    <option value="grammar">Grammar / Cohesion Error</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                  Question Prompt *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newNote.questionPrompt}
                  onChange={(e) => setNewNote({ ...newNote, questionPrompt: e.target.value })}
                  placeholder="Paste or summarize the exact test question..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                  My Incorrect Answer *
                </label>
                <input
                  type="text"
                  required
                  value={newNote.studentAnswer}
                  onChange={(e) => setNewNote({ ...newNote, studentAnswer: e.target.value })}
                  placeholder="What you wrote during the test..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                  Correct Reasoning & Key Learning *
                </label>
                <textarea
                  required
                  rows={3}
                  value={newNote.reasoning}
                  onChange={(e) => setNewNote({ ...newNote, reasoning: e.target.value })}
                  placeholder="Why is this correct? What clue in the passage or audio explains it?"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#D4E8E3] text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={addingNote}
                  className="px-4 py-2 rounded-xl bg-[#25A995] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {addingNote && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save Error Note</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
