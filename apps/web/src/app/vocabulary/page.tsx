"use client";

import React, { useState, useEffect } from "react";
import {
  SpellCheck,
  Search,
  Plus,
  Loader2,
  X,
} from "lucide-react";
import { VocabularyWord } from "@/server/services/vocabulary.service";

export default function VocabularyPage() {
  const [words, setWords] = useState<VocabularyWord[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedBand, setSelectedBand] = useState<string>("all");
  const [selectedMastery, setSelectedMastery] = useState<string>("all");

  const [addModalOpen, setAddModalOpen] = useState(false);
  const [newWord, setNewWord] = useState({
    word: "",
    partOfSpeech: "verb",
    bandLevel: "Band 7.5+",
    meaning: "",
    collocation: "",
    exampleSentence: "",
  });
  const [addingWord, setAddingWord] = useState(false);

  useEffect(() => {
    let isMounted = true;
    const params = new URLSearchParams();
    if (selectedBand !== "all") params.append("bandLevel", selectedBand);
    if (selectedMastery !== "all") params.append("mastery", selectedMastery);
    if (searchQuery.trim()) params.append("q", searchQuery.trim());

    fetch(`/api/vocabulary?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (isMounted && json.success) {
          setWords(json.vocabulary);
        }
      })
      .catch(() => {})
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedBand, selectedMastery, searchQuery]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const params = new URLSearchParams();
    if (selectedBand !== "all") params.append("bandLevel", selectedBand);
    if (selectedMastery !== "all") params.append("mastery", selectedMastery);
    if (searchQuery.trim()) params.append("q", searchQuery.trim());

    fetch(`/api/vocabulary?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setWords(json.vocabulary);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  const refreshVocabulary = () => {
    const params = new URLSearchParams();
    if (selectedBand !== "all") params.append("bandLevel", selectedBand);
    if (selectedMastery !== "all") params.append("mastery", selectedMastery);
    if (searchQuery.trim()) params.append("q", searchQuery.trim());

    fetch(`/api/vocabulary?${params.toString()}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setWords(json.vocabulary);
      })
      .catch(() => {});
  };

  const handleToggleMastery = async (id: string, currentMastery: string) => {
    const nextMap: Record<string, "learning" | "reviewing" | "mastered"> = {
      learning: "reviewing",
      reviewing: "mastered",
      mastered: "learning",
    };
    const nextMastery = nextMap[currentMastery] || "reviewing";

    // Optimistic update
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, mastery: nextMastery } : w))
    );

    try {
      await fetch("/api/vocabulary", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ vocabId: id, mastery: nextMastery }),
      });
    } catch {
      refreshVocabulary();
    }
  };

  const handleAddSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.word || !newWord.meaning) return;
    setAddingWord(true);
    try {
      const res = await fetch("/api/vocabulary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newWord),
      });
      const json = await res.json();
      if (json.success) {
        setAddModalOpen(false);
        setNewWord({
          word: "",
          partOfSpeech: "verb",
          bandLevel: "Band 7.5+",
          meaning: "",
          collocation: "",
          exampleSentence: "",
        });
        refreshVocabulary();
      }
    } catch {}
    setAddingWord(false);
  };

  const getMasteryColor = (mastery: string) => {
    switch (mastery) {
      case "mastered":
        return "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-200";
      case "reviewing":
        return "bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border-sky-200";
      default:
        return "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border-amber-200";
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header Banner */}
      <section className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#25A995]/15 text-[#25A995] text-xs font-bold uppercase tracking-wider">
            <SpellCheck className="w-3.5 h-3.5" />
            <span>Spaced Repetition Lexicon</span>
          </div>
          <h2 className="text-2xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
            Academic Vocabulary Bank
          </h2>
          <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1] max-w-xl">
            High-yield academic words categorized for Band 7.5 to 9.0 writing and speaking. Toggle spaced repetition mastery to optimize retention before exam day.
          </p>
        </div>

        <button
          onClick={() => setAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25A995] hover:bg-[#123C3A] text-white text-xs font-bold transition-all shadow-xs shrink-0 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Add Custom Word</span>
        </button>
      </section>

      {/* Filters & Search Toolbar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Search */}
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-[#8AA4B7] absolute left-3.5 top-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search words, collocations..."
            className="w-full pl-10 pr-4 py-2 bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] rounded-xl text-xs text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
          />
        </form>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Band Level Selector */}
          <select
            value={selectedBand}
            onChange={(e) => setSelectedBand(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
          >
            <option value="all">All Band Levels</option>
            <option value="Band 7.0+">Band 7.0+</option>
            <option value="Band 7.5+">Band 7.5+</option>
            <option value="Band 8.0+">Band 8.0+</option>
          </select>

          {/* Mastery Selector */}
          <select
            value={selectedMastery}
            onChange={(e) => setSelectedMastery(e.target.value)}
            className="px-3 py-1.5 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs font-semibold text-[#123C3A] dark:text-[#F4FAF8] focus:outline-none focus:border-[#25A995]"
          >
            <option value="all">All Mastery Levels</option>
            <option value="learning">Learning (1-day review)</option>
            <option value="reviewing">Reviewing (3-day review)</option>
            <option value="mastered">Mastered (7-day review)</option>
          </select>
        </div>
      </div>

      {/* Vocabulary Cards Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-pulse">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div
              key={i}
              className="h-44 bg-white dark:bg-[#123C3A] rounded-2xl border border-[#D4E8E3] dark:border-[#205653]"
            />
          ))}
        </div>
      ) : words.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-center space-y-2">
          <p className="text-sm font-bold text-[#123C3A] dark:text-[#F4FAF8]">
            No vocabulary items match your filter
          </p>
          <p className="text-xs text-[#67839A] dark:text-[#A0C5C1]">
            Try adjusting your search query or band level selection.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {words.map((w) => (
            <div
              key={w.id}
              className="p-5 rounded-3xl bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#25A995]/60 transition-all duration-200"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-[#E8F7F4] dark:bg-[#174A48] text-[#25A995]">
                    {w.bandLevel}
                  </span>
                  <button
                    onClick={() => handleToggleMastery(w.id, w.mastery)}
                    className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border cursor-pointer ${getMasteryColor(
                      w.mastery
                    )}`}
                    title="Click to cycle review status"
                  >
                    {w.mastery}
                  </button>
                </div>

                <div>
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-lg font-black text-[#123C3A] dark:text-[#F4FAF8]">
                      {w.word}
                    </h3>
                    <span className="text-xs italic text-[#67839A] dark:text-[#A0C5C1]">
                      ({w.partOfSpeech})
                    </span>
                  </div>
                  <p className="text-xs text-[#3D6462] dark:text-[#A0C5C1] mt-1 leading-relaxed">
                    {w.meaning}
                  </p>
                </div>

                {w.collocation && (
                  <div className="p-2.5 rounded-xl bg-[#F9FCFB] dark:bg-[#0E2F2D] text-[11px] text-[#123C3A] dark:text-[#F4FAF8]">
                    <span className="font-bold text-[#25A995]">Collocation: </span>
                    {w.collocation}
                  </div>
                )}

                {w.exampleSentence && (
                  <p className="text-[11px] italic text-[#67839A] dark:text-[#A0C5C1] pt-1">
                    &ldquo;{w.exampleSentence}&rdquo;
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Custom Word Modal */}
      {addModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
        >
          <div className="bg-white dark:bg-[#123C3A] rounded-3xl border border-[#D4E8E3] dark:border-[#205653] max-w-lg w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-[#D4E8E3] dark:border-[#205653]">
              <h3 className="text-base font-bold text-[#123C3A] dark:text-[#F4FAF8]">
                Add Academic Vocabulary Word
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="p-1 rounded-lg text-[#67839A] hover:bg-[#F4FAF8]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                    Word *
                  </label>
                  <input
                    type="text"
                    required
                    value={newWord.word}
                    onChange={(e) => setNewWord({ ...newWord, word: e.target.value })}
                    placeholder="e.g. Proliferate"
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                    Part of Speech
                  </label>
                  <select
                    value={newWord.partOfSpeech}
                    onChange={(e) => setNewWord({ ...newWord, partOfSpeech: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                  >
                    <option value="verb">Verb</option>
                    <option value="noun">Noun</option>
                    <option value="adjective">Adjective</option>
                    <option value="adverb">Adverb</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                  Band Level
                </label>
                <select
                  value={newWord.bandLevel}
                  onChange={(e) => setNewWord({ ...newWord, bandLevel: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                >
                  <option value="Band 7.0+">Band 7.0+</option>
                  <option value="Band 7.5+">Band 7.5+</option>
                  <option value="Band 8.0+">Band 8.0+</option>
                  <option value="Band 8.5+">Band 8.5+</option>
                  <option value="Band 9.0">Band 9.0</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                  Meaning *
                </label>
                <textarea
                  required
                  rows={2}
                  value={newWord.meaning}
                  onChange={(e) => setNewWord({ ...newWord, meaning: e.target.value })}
                  placeholder="Clear academic definition..."
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                  Common Collocation
                </label>
                <input
                  type="text"
                  value={newWord.collocation}
                  onChange={(e) => setNewWord({ ...newWord, collocation: e.target.value })}
                  placeholder="e.g. proliferate across urban centres"
                  className="w-full px-3 py-2 rounded-xl bg-[#F9FCFB] dark:bg-[#174A48] border border-[#D4E8E3] dark:border-[#205653] text-xs text-[#123C3A] dark:text-[#F4FAF8]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#123C3A] dark:text-[#F4FAF8] block mb-1">
                  Example Sentence
                </label>
                <textarea
                  rows={2}
                  value={newWord.exampleSentence}
                  onChange={(e) => setNewWord({ ...newWord, exampleSentence: e.target.value })}
                  placeholder="Task 2 or Speaking context..."
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
                  disabled={addingWord}
                  className="px-4 py-2 rounded-xl bg-[#25A995] text-white text-xs font-bold inline-flex items-center gap-1.5"
                >
                  {addingWord && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Save to Lexicon</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
