import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Module } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import { useMemo, useState } from "react";
import ModalEdit from "./modal-edit";
import {
  EllipsisIcon,
  Inbox,
  RefreshCw,
  Search,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import ModalDelete from "./modal-delete";
import { Link } from "react-router";

interface ModulesTableProps {
  data: Module[];
  loading?: boolean;
  error?: ApiErrorResponse | null;
  onRetry?: () => void;
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

function EmptyState({
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

export default function ModulesTable({
  data,
  loading = false,
  error = null,
  onRetry,
}: ModulesTableProps) {
  const [search, setSearch] = useState("");

  const [editModal, setEditModal] = useState<{
    data: Module | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    data: Module | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = data;

    // Apply search filter
    if (q) {
      result = data.filter(
        (module) =>
          module.title.toLowerCase().includes(q) ||
          module.slug.toLowerCase().includes(q),
      );
    }

    // Sort by track_id first, then by order
    return [...result].sort((a, b) => {
      // First sort by track_id
      if (a.track_id !== b.track_id) {
        return (a.track_id || 0) - (b.track_id || 0);
      }
      // Then sort by order
      return (a.order || 0) - (b.order || 0);
    });
  }, [data, search]);

  const showToolbar = !loading && !error && data.length > 0;

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border">
        {showToolbar && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{data.length}</span>{" "}
              {data.length === 1 ? "module" : "modules"}
              {filtered.length !== data.length && (
                <span> · {filtered.length} shown</span>
              )}
            </p>
            <div className="relative w-full max-w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search modules"
                className="w-full rounded-md border border-border bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-4 py-3">
                <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                <div className="hidden h-3.5 w-20 animate-pulse rounded bg-muted sm:block" />
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={TriangleAlert}
            title="Couldn't load modules"
            description="Something went wrong while fetching modules."
            action={
              onRetry && (
                <Button variant="outline" size="sm" onClick={() => onRetry()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </Button>
              )
            }
          />
        ) : data.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title="No modules yet"
            description="Add your first module to start building lessons."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={`No modules match "${search}"`}
            description="Try a different name or slug."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">
                  Updated
                </th>
                <th className="w-10 px-4 py-2" />
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
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          to={`/${module.slug}/lessons`}
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                          Lessons
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
                            <Link to={`/${module.slug}/lessons`}>
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
        <ModalEdit
          key={editModal.data.id}
          data={editModal.data}
          isOpen={editModal.isOpen}
          onOpenChange={(open) =>
            setEditModal((prev) => ({ ...prev, isOpen: open }))
          }
        />
      )}

      {deleteModal.data !== null && (
        <ModalDelete
          key={deleteModal.data.id}
          data={deleteModal.data}
          isOpen={deleteModal.isOpen}
          onOpenChange={(open) =>
            setDeleteModal((prev) => ({ ...prev, isOpen: open }))
          }
        />
      )}
    </>
  );
}
