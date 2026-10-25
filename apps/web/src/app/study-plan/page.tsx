"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Clock,
  CheckCircle2,
  Calendar,
  Layers,
  BookOpen,
  Headphones,
  FileText,
  Mic,
  Laptop,
  Plus,
} from "lucide-react";
import { useExam } from "@/context/ExamContext";
import { useLanguage } from "@/context/LanguageContext";

export default function StudyPlanPage() {
  const { language } = useLanguage();
  const { studyTasks, toggleTask, profile } = useExam();
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  const filteredTasks =
    selectedFilter === "all"
      ? studyTasks
      : studyTasks.filter((t) => t.skill === selectedFilter);

  const completedCount = studyTasks.filter((t) => t.completed).length;

  const getSkillIcon = (skill: string) => {
    switch (skill) {
      case "reading":
        return <BookOpen className="w-4 h-4 text-[#25A995]" />;
      case "listening":
        return <Headphones className="w-4 h-4 text-[#25A995]" />;
      case "writing":
        return <FileText className="w-4 h-4 text-[#FF8A65]" />;
      case "speaking":
        return <Mic className="w-4 h-4 text-[#25A995]" />;
      case "mock":
        return <Laptop className="w-4 h-4 text-[#FF8A65]" />;
      default:
        return <Layers className="w-4 h-4 text-[#3D6462]" />;
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
      {/* Header */}
      <div className="bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E8F7F4] dark:bg-[#0A1C1B] text-[#25A995] text-xs font-semibold border border-[#25A995]/30">
              <Calendar className="w-3.5 h-3.5" />
              <span>Adaptive Daily Curriculum</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#123C3A] dark:text-[#F4FAF8] tracking-tight">
              Personalized Study Schedule
            </h1>
            <p className="text-xs sm:text-sm text-[#3D6462] dark:text-[#A0C5C1]">
              Allocating {profile.dailyMinutes} minutes daily toward Band {profile.targetBand.toFixed(1)} by {profile.targetDate}.
            </p>
          </div>

          <div className="bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653] px-5 py-3 rounded-2xl text-center">
            <span className="text-[10px] uppercase tracking-wider text-[#3D6462] dark:text-[#A0C5C1] font-bold block mb-1">
              Progress
            </span>
            <span className="text-2xl font-black text-[#25A995]">
              {completedCount} / {studyTasks.length}
            </span>
            <span className="text-[11px] text-[#3D6462] dark:text-[#A0C5C1] block">Tasks Completed</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
        {["all", "reading", "listening", "writing", "speaking", "mock"].map((filter) => (
          <button
            key={filter}
            onClick={() => setSelectedFilter(filter)}
            className={`px-3.5 py-1.5 rounded-xl font-semibold capitalize transition-colors ${
              selectedFilter === filter
                ? "bg-[#25A995] text-white shadow-md shadow-[#25A995]/20"
                : "bg-white dark:bg-[#123C3A] border border-[#D4E8E3] dark:border-[#205653] text-[#3D6462] dark:text-[#A0C5C1] hover:text-[#123C3A] dark:hover:text-[#F4FAF8]"
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Task List */}
      <div className="space-y-3">
        {filteredTasks.map((task) => (
          <div
            key={task.id}
            onClick={() => toggleTask(task.id)}
            className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 shadow-sm ${
              task.completed
                ? "bg-[#E8F7F4]/60 dark:bg-[#123C3A]/50 border-[#25A995]/30 text-[#3D6462] dark:text-[#A0C5C1]"
                : "bg-white dark:bg-[#123C3A] border-[#D4E8E3] dark:border-[#205653] hover:border-[#25A995] text-[#123C3A] dark:text-[#F4FAF8]"
            }`}
          >
            <div className="flex items-center gap-3.5">
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center transition-colors ${
                  task.completed
                    ? "bg-[#25A995] border-[#25A995] text-white"
                    : "border-[#D4E8E3] dark:border-[#205653] bg-[#F4FAF8] dark:bg-[#0A1C1B]"
                }`}
              >
                {task.completed && <CheckCircle2 className="w-4 h-4" />}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-semibold text-[#3D6462] dark:text-[#A0C5C1]">{task.day}</span>
                  <span className="text-[#D4E8E3] dark:text-[#205653]">•</span>
                  <span className="capitalize text-[#25A995] font-semibold">{task.skill}</span>
                </div>
                <h3
                  className={`text-sm font-bold ${
                    task.completed ? "line-through text-[#3D6462] dark:text-[#A0C5C1]" : "text-[#123C3A] dark:text-[#F4FAF8]"
                  }`}
                >
                  {task.title}
                </h3>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs text-[#3D6462] dark:text-[#A0C5C1] flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {task.durationMinutes}m
              </span>
              <div className="p-2 rounded-xl bg-[#F4FAF8] dark:bg-[#0A1C1B] border border-[#D4E8E3] dark:border-[#205653]">
                {getSkillIcon(task.skill)}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
