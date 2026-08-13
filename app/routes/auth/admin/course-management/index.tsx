import type { ManagementData } from "@/types/global";
import { Link, useNavigate } from "react-router";
import { ArrowRight, BookOpen, Boxes, Check, Route, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const data: ManagementData[] = [
  {
    name: "Tracks",
    url: "/tracks",
  },
  {
    name: "Modules",
    url: "/modules",
  },
  {
    name: "Lessons",
    url: "/lessons",
  },
];

// Presentation-only metadata, keyed by name — ManagementData (name/url)
// stays the single source of truth from the API/type.
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
    capabilities: [
      "Create and reorder tracks",
      "Set the module sequence for each track",
      "Publish or archive a track",
    ],
    icon: Route,
    key: "T",
  },
  Modules: {
    description: "Grouped units of learning",
    detail:
      'Modules sit inside a track and bundle related lessons into a single milestone — e.g. "React Fundamentals" inside the Frontend track. Reorder modules to change the path a student follows.',
    capabilities: [
      "Group lessons into a milestone",
      "Reorder modules within a track",
      "Move a module to a different track",
    ],
    icon: Boxes,
    key: "M",
  },
  Lessons: {
    description: "Individual learning content",
    detail:
      "Lessons are the smallest unit — a single video, reading, or exercise inside a module. This is where you edit the actual content students see and complete.",
    capabilities: [
      "Edit lesson content and media",
      "Reorder lessons within a module",
      "Preview exactly what students see",
    ],
    icon: BookOpen,
    key: "L",
  },
};

export default function IndexPage() {
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(
    () =>
      data.filter((item) =>
        item.name.toLowerCase().includes(query.trim().toLowerCase()),
      ),
    [query],
  );

  useEffect(() => {
    setActiveIndex(0);
  }, [query]);

  const active = filtered[activeIndex];
  const activeInfo = active ? meta[active.name] : undefined;
  const ActiveIcon = activeInfo?.icon ?? Route;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Escape") {
      setQuery("");
      return;
    }
    if (filtered.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => (i + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => (i - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      navigate(filtered[activeIndex].url);
    }
  };

  return (
    <div className="relative mx-auto w-full max-w-5xl">
      {/* subtle dot-grid, fills the negative space around the card */}
      <div
        className="pointer-events-none absolute -inset-x-12 -inset-y-8 -z-10 opacity-[0.4]"
        style={{
          backgroundImage:
            "radial-gradient(circle, var(--border) 1px, transparent 1px)",
          backgroundSize: "24px 24px",
          maskImage:
            "radial-gradient(ellipse 80% 70% at 50% 30%, black, transparent)",
        }}
      />

      <div className="flex items-baseline justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">
            Management
          </h1>
          <p className="mt-1.5 text-base text-muted-foreground">
            Configure the building blocks of your curriculum.
          </p>
        </div>
        <span className="hidden font-mono text-xs text-muted-foreground sm:inline">
          {data.length} sections
        </span>
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-lg shadow-black/[0.03]">
        <div className="grid grid-cols-1 md:grid-cols-[340px_1fr]">
          {/* left: search + filtered list */}
          <div className="border-b border-border md:border-r md:border-b-0">
            <div className="flex items-center gap-3 border-b border-border px-5 py-4">
              <Search className="h-4.5 w-4.5 shrink-0 text-muted-foreground" />
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Jump to a section..."
                className="w-full bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>

            <div className="p-3">
              {filtered.length > 0 ? (
                filtered.map((item, index) => {
                  const info = meta[item.name];
                  const Icon = info?.icon ?? Route;
                  const isActive = index === activeIndex;

                  return (
                    <Link
                      to={item.url}
                      key={item.url}
                      onMouseEnter={() => setActiveIndex(index)}
                      className={`flex items-center justify-between gap-3 rounded-xl px-3 py-3.5 transition-colors ${
                        isActive
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted/60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`h-4.5 w-4.5 shrink-0 ${
                            isActive ? "text-primary" : "text-muted-foreground"
                          }`}
                        />
                        <div>
                          <span className="block text-sm font-medium">
                            {item.name}
                          </span>
                          <span
                            className={`block text-xs ${
                              isActive
                                ? "text-primary/70"
                                : "text-muted-foreground"
                            }`}
                          >
                            {info?.description}
                          </span>
                        </div>
                      </div>
                      {info?.key && (
                        <kbd
                          className={`shrink-0 rounded border px-1.5 py-0.5 font-mono text-[10px] ${
                            isActive
                              ? "border-primary/40 text-primary"
                              : "border-border bg-muted text-muted-foreground"
                          }`}
                        >
                          {info.key}
                        </kbd>
                      )}
                    </Link>
                  );
                })
              ) : (
                <p className="px-3 py-10 text-center text-sm text-muted-foreground">
                  No matches for "{query}"
                </p>
              )}
            </div>
          </div>

          {/* right: preview panel for the active selection */}
          <div className="relative flex flex-col justify-between overflow-hidden p-8">
            {active && activeInfo ? (
              <>
                <ActiveIcon
                  className="pointer-events-none absolute -right-8 -top-8 h-40 w-40 text-primary/[0.04]"
                  aria-hidden
                />
                <div className="relative">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                    <ActiveIcon className="h-6 w-6" />
                  </div>
                  <h2 className="mt-5 text-xl font-semibold text-foreground">
                    {active.name}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    {activeInfo.description}
                  </p>
                  <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {activeInfo.detail}
                  </p>

                  <ul className="mt-5 space-y-2 border-t border-border pt-5">
                    {activeInfo.capabilities.map((capability) => (
                      <li
                        key={capability}
                        className="flex items-start gap-2 text-sm text-foreground"
                      >
                        <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
                        {capability}
                      </li>
                    ))}
                  </ul>
                </div>

                <Link
                  to={active.url}
                  className="relative mt-8 inline-flex w-fit items-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90"
                >
                  Open {active.name}
                  <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">
                No section selected.
              </p>
            )}
          </div>
        </div>

        {/* footer — keyboard hints, fills the command palette's usual bottom bar */}
        <div className="flex items-center gap-4 border-t border-border bg-muted/30 px-5 py-3">
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">
              ↑↓
            </kbd>
            Navigate
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">
              ↵
            </kbd>
            Open
          </span>
          <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <kbd className="rounded border border-border bg-card px-1.5 py-0.5 font-mono text-[10px]">
              esc
            </kbd>
            Clear
          </span>
        </div>
      </div>
    </div>
  );
}