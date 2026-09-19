import { ROLE_COLORS } from "./_types";

// ── Role badge ──────────────────────────────────────────────────────────────

export function RoleBadge({ name }: { name: string }) {
  const c = ROLE_COLORS[name.toLowerCase()] ?? {
    bg: "bg-gray-100 dark:bg-white/5",
    text: "text-gray-500 dark:text-gray-400",
  };
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] ${c.bg} ${c.text}`}
    >
      {name}
    </span>
  );
}
