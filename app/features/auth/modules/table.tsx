import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Module } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import { useMemo, useState } from "react";
import ModalEdit from "./modal-edit";
import ModalDelete from "./modal-delete";
import {
  EllipsisIcon,
  Inbox,
  RefreshCw,
  Search,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import { Link } from "react-router";
import { Skeleton } from "@/components/ui/skeleton";

interface ModulesTableProps {
  data: Module[];
  loading?: boolean;
  error?: ApiErrorResponse | null;
  onRetry?: () => void;
  total?: number;
  basePath?: string;
}

function formatUpdated(dateString?: string | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000);
  if (days <= 0) return "Today";
  if (days === 1) return "Yesterday";
  if (days < 7) return `${days}d ago`;
  if (days < 30) return `${Math.floor(days / 7)}w ago`;
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function ModulesTable({
  data,
  loading = false,
  error = null,
  onRetry,
  total,
  basePath = "",
}: ModulesTableProps) {
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<{ data: Module | null; isOpen: boolean }>({ data: null, isOpen: false });
  const [deleteModal, setDeleteModal] = useState<{ data: Module | null; isOpen: boolean }>({ data: null, isOpen: false });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? data.filter((m) => m.title.toLowerCase().includes(q) || m.slug.toLowerCase().includes(q))
      : data;
    return [...result].sort((a, b) => {
      if (a.track_id !== b.track_id) return (a.track_id || 0) - (b.track_id || 0);
      return (a.order || 0) - (b.order || 0);
    });
  }, [data, search]);

  return (
    <>
      <div className="overflow-hidden">
        {/* Toolbar */}
        {!loading && !error && data.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-3.5 bg-white dark:bg-[#0b1215]">
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-white">{total ?? data.length}</span>{" "}
              {(total ?? data.length) === 1 ? "module" : "modules"}
              {filtered.length !== data.length && <span className="text-gray-400"> · {filtered.length} shown</span>}
            </p>
            <div className="relative w-full max-w-56">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules…"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 py-2 pl-9 pr-3 text-[13px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#0b1215]">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-4 w-40 rounded-lg" />
                <Skeleton className="hidden h-4 w-20 rounded-lg sm:block" />
                <Skeleton className="ml-auto h-3 w-12 rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <TriangleAlert className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">Couldn't load modules.</p>
            {onRetry && (
              <button onClick={onRetry}
                className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                <RefreshCw className="h-3.5 w-3.5" /> Try again
              </button>
            )}
          </div>
        ) : data.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">No modules yet</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">Add your first module to start building lessons.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <SearchX className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">No matches for "{search}"</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">Try a different name or slug.</p>
          </div>
        ) : (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Title</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 md:table-cell">Updated</th>
                <th className="w-36 px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((module) => {
                const updated = formatUpdated(module.updated_at);
                return (
                  <tr key={module.id} className="group hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {module.title}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          /{module.slug}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                      {updated}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                      {(module as any).created_by?.name || "Admin"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          to={`${basePath}/${module.slug}/lessons`}
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                          Lessons
                        </Link>
                        <Link
                          to={`${basePath}/${module.slug}/challenges`}
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                          Challenges
                        </Link>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 text-muted-foreground hover:text-foreground">
                              <EllipsisIcon className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <Link to={`${basePath}/${module.slug}/lessons`}>
                              <DropdownMenuItem>View</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              onClick={() =>
                                setEditModal({ data: module, isOpen: true })
                              }>
                              Update
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setDeleteModal({ data: module, isOpen: true })
                              }>
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {editModal.data !== null && (
        <ModalEdit key={editModal.data.id} data={editModal.data} isOpen={editModal.isOpen}
          onOpenChange={(open) => setEditModal((prev) => ({ ...prev, isOpen: open }))} />
      )}
      {deleteModal.data !== null && (
        <ModalDelete key={deleteModal.data.id} data={deleteModal.data} isOpen={deleteModal.isOpen}
          onOpenChange={(open) => setDeleteModal((prev) => ({ ...prev, isOpen: open }))} />
      )}
    </>
  );
}
