import React from "react";
import { Inbox } from "lucide-react";
import type { ProgressAvatar } from "@/types/student-progress";

// ---------------------------------------------------------------------------
// Avatar helpers
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Progress bar
// ---------------------------------------------------------------------------

export function ProgressBar({
  value,
  className = "",
}: {
  value: number;
  className?: string;
}) {
  const pct = Math.min(100, Math.max(0, value));
  const color =
    pct >= 100
      ? "bg-emerald-500"
      : pct >= 60
        ? "bg-blue-500"
        : pct >= 30
          ? "bg-amber-500"
          : "bg-muted-foreground/40";

  return (
    <div className={`h-1.5 overflow-hidden rounded-full bg-muted ${className}`}>
      <div
        className={`h-full rounded-full transition-all ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Empty / error state
// ---------------------------------------------------------------------------

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
    <div className="flex flex-col items-center gap-2 py-16 text-center">
      <Icon className="h-5 w-5 text-muted-foreground" />
      <div>
        <p className="text-sm font-medium text-foreground">{title}</p>
        <p className="mt-0.5 text-sm text-muted-foreground">{description}</p>
      </div>
      {action}
    </div>
  );
}
