import type { ManagementData } from "@/types/global";
import { Link, useNavigate } from "react-router";
import { ArrowRight, BookOpen, Boxes, Check, Route, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const data: ManagementData[] = [
  { name: "Tracks",  url: "/tracks"  },
  { name: "Modules", url: "/modules" },
  { name: "Lessons", url: "/lessons" },
];

interface SectionMeta {
  description: string;
  detail: string;
  capabilities: string[];
  icon: typeof Route;
  key: string;
}

const meta: Record<string, SectionMeta> = {
  Tracks: {
    description: "Program structure",
    detail:
      "Tracks are the top-level curriculum path a student enrolls in — e.g. Frontend Engineering or Backend Engineering. Each track groups a sequence of modules in the order students move through them.",
    capabilities: ["Create and reorder tracks", "Set the module sequence for each track", "Publish or archive a track"],
    icon: Route,
    key: "T",
  },
  Modules: {
    description: "Grouped units of learning",
    detail:
      'Modules sit inside a track and bundle related lessons into a single milestone — e.g. "React Fundamentals" inside the Frontend track. Reorder modules to change the path a student follows.',
    capabilities: ["Group lessons into a milestone", "Reorder modules within a track", "Move a module to a different track"],
    icon: Boxes,
    key: "M",
  },
  Lessons: {
    description: "Individual learning content",
    detail: "Lessons are the smallest unit — a single video, reading, or exercise inside a module. This is where you edit the actual content students see and complete.",
    capabilities: ["Edit lesson content and media", "Reorder lessons within a module", "Preview exactly what students see"],
    icon: BookOpen,
    key: "L",
  },
};

export default function IndexPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () => data.filter((item) => item.name.toLowerCase().includes(query.trim().toLowerCase())),
    [query]
  );

  useEffect(() => { setActiveIndex(0); }, [query]);

  const active = filtered[activeIndex];
  const activeInfo = active ? meta[active.name] : undefined;
  const ActiveIcon = activeInfo?.icon ?? Route;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") { setQuery(""); return; }
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setActiveIndex((i) => (i + 1) % filtered.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length); }
    else if (e.key === "Enter") { navigate(filtered[activeIndex].url); }
  };

  return (
    <div className="mx-auto w-full max-w-4xl space-y-8">
      {/* Header */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Admin</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Course Management
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Configure the building blocks of your curriculum.
        </p>
      </div>

      {/* Command palette card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-[300px_1fr]">
          {/* Left: search + list */}
          <div className="border-b border-gray-100 dark:border-white/5 md:border-r md:border-b-0">
            {/* Search */}
            <div className="flex items-center gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-3.5">
              <Search className="h-4 w-4 shrink-0 text-gray-400 dark:text-gray-600" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jump to a section…"
                className="w-full bg-transparent text-[14px] text-gray-900 dark:text-white outline-none placeholder:text-gray-400 dark:placeholder:text-gray-600"
              />
            </div>

            {/* Items */}
            <div className="p-2">
              {filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const info = meta[item.name];
                  const Icon = info?.icon ?? Route;
                  const isActive = index === activeIndex;
                  return (
                    <Link
                      key={item.url}
                      to={item.url}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3 transition-colors ${
                        isActive
                          ? "bg-[#1c81ff]/10 text-[#1c81ff]"
                          : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-white/5"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon className={`h-4 w-4 shrink-0 ${isActive ? "text-[#1c81ff]" : "text-gray-400 dark:text-gray-600"}`} />
                        <div>
                          <span className="block text-[14px] font-bold">{item.name}</span>
                          <span className={`block text-[12px] ${isActive ? "text-[#1c81ff]/70" : "text-gray-400 dark:text-gray-600"}`}>
                            {info?.description}
                          </span>
                        </div>
                      </div>
                      {info?.key && (
                        <kbd className={`shrink-0 rounded-lg border px-1.5 py-0.5 font-mono text-[10px] font-bold ${
                          isActive
                            ? "border-[#1c81ff]/30 text-[#1c81ff]"
                            : "border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 text-gray-400 dark:text-gray-600"
                        }`}>
                          {info.key}
                        </kbd>
                      )}
                    </Link>
                  );
                })
              ) : (
                <p className="px-3 py-10 text-center text-[14px] text-gray-400 dark:text-gray-600">
                  No matches for "{query}"
                </p>
              )}
            </div>
          </div>

          {/* Right: preview panel */}
          <div className="relative flex flex-col justify-between overflow-hidden p-8">
            {active && activeInfo ? (
              <>
                {/* Ghost icon background */}
                <ActiveIcon className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 text-[#1c81ff]/[0.04]" aria-hidden />

                <div className="relative space-y-5">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#1c81ff]/10">
                    <ActiveIcon className="h-6 w-6 text-[#1c81ff]" />
                  </div>
                  <div>
                    <h2 className="text-xl font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
                      {active.name}
                    </h2>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400">{activeInfo.description}</p>
                    <p className="mt-3 text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">{activeInfo.detail}</p>
                  </div>

                  <ul className="space-y-2 border-t border-gray-100 dark:border-white/5 pt-4">
                    {activeInfo.capabilities.map((cap) => (
                      <li key={cap} className="flex items-start gap-2 text-[14px] text-gray-700 dark:text-gray-300">
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#1c81ff]" />
                        {cap}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={active.url}
                  className="relative mt-8 inline-flex w-fit items-center gap-1.5 rounded-xl bg-[#1c81ff] px-5 py-2.5 text-[14px] font-bold text-white shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95"
                >
                  Open {active.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <p className="text-[14px] text-gray-400 dark:text-gray-600">No section selected.</p>
            )}
          </div>
        </div>

        {/* Footer keyboard hints */}
        <div className="flex items-center gap-5 border-t border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02] px-5 py-3">
          {[["↑↓", "Navigate"], ["↵", "Open"], ["esc", "Clear"]].map(([key, label]) => (
            <span key={key} className="flex items-center gap-1.5 text-[12px] text-gray-400 dark:text-gray-600">
              <kbd className="rounded-md border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] px-1.5 py-0.5 font-mono text-[10px]">{key}</kbd>
              {label}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
