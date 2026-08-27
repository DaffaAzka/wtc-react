import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/types/model";
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

interface LessonsTableProps {
  data: Lesson[];
  loading?: boolean;
  error?: ApiErrorResponse | null;
  onRetry?: () => void;
  total?: number;
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

export default function LessonsTable({
  data,
  loading = false,
  error = null,
  onRetry,
  total,
}: LessonsTableProps) {
  const [search, setSearch] = useState("");

  const [editModal, setEditModal] = useState<{
    data: Lesson | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    data: Lesson | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = data;

    // Apply search filter
    if (q) {
      result = data.filter(
        (lesson) =>
          lesson.title.toLowerCase().includes(q) ||
          lesson.slug.toLowerCase().includes(q),
      );
    }

    // Sort by module_id first, then by order
    return [...result].sort((a, b) => {
      // First sort by module_id
      if (a.module_id !== b.module_id) {
        return (a.module_id || 0) - (b.module_id || 0);
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
              <span className="font-medium text-foreground">{total ?? data.length}</span>{" "}
              {(total ?? data.length) === 1 ? "lesson" : "lessons"}
              {filtered.length !== data.length && (
                <span> · {filtered.length} shown</span>
              )}
            </p>
            <div className="relative w-full max-w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search lessons"
                className="w-full rounded-md border border-border bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-4 py-3">
                <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
                <div className="hidden h-3.5 w-32 animate-pulse rounded bg-muted sm:block" />
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={TriangleAlert}
            title="Couldn't load lessons"
            description="Something went wrong while fetching lessons."
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
            title="No lessons yet"
            description="Add your first lesson to start building this module."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={`No lessons match "${search}"`}
            description="Try a different title or slug."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">
                  Updated
                </th>
                <th className="hidden px-4 py-2 font-medium lg:table-cell">
                  Created By
                </th>
                <th className="w-10 px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((lesson) => {
                const updated = formatUpdated(lesson.updated_at);
                return (
                  <tr key={lesson.id} className="group hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-foreground">
                          {lesson.title}
                        </span>
                        <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                          /{lesson.slug}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                      {updated}
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                      {(lesson as any).created_by?.name || "Admin"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                        <Link
                          to={`${lesson.slug}/view`}
                          className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                          View
                        </Link>
                        <Link
                          to={`${lesson.slug}/challenges`}
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
                            <Link to={`${lesson.slug}/view`}>
                              <DropdownMenuItem>View</DropdownMenuItem>
                            </Link>
                            <Link to={`${lesson.slug}/update`}>
                              <DropdownMenuItem>Update</DropdownMenuItem>
                            </Link>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setDeleteModal({ data: lesson, isOpen: true })
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
