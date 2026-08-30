import React from "react";
import { Inbox } from "lucide-react";
import type { ProgressAvatar } from "@/types/student-progress";

// ── Avatar helpers ──────────────────────────────────────────────────────────

export function resolveAvatar(avatar: ProgressAvatar): string | undefined {
  if (!avatar) return undefined;
  if (typeof avatar === "string") return avatar;
  return avatar.url;
}

export function initials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? "")
    .join("");
}

// ── Progress bar ────────────────────────────────────────────────────────────

export function ProgressBar({ value, className = "" }: { value: number; className?: string }) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct >= 100 ? "bg-[#00E676]"
    : pct >= 60 ? "bg-[#1c81ff]"
    : pct >= 30 ? "bg-[#f6b60b]"
    : "bg-gray-300 dark:bg-white/20";

  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-gray-100 dark:bg-white/10 ${className}`}>
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ── Empty / error state ─────────────────────────────────────────────────────

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: typeof Inbox;
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center gap-3 py-16 text-center">
      <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
        <Icon className="h-5 w-5 text-gray-400 dark:text-gray-600" />
      </div>
      <div>
        <p className="text-[14px] font-bold text-gray-900 dark:text-white">{title}</p>
        <p className="mt-0.5 text-[13px] text-gray-500 dark:text-gray-400">{description}</p>
      </div>
      {action}
    </div>
  );
}
