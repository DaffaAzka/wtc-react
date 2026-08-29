import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Lesson } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import type { Creator } from "./creator-badge";
import { useMemo, useState } from "react";
import ModalEdit from "@/features/auth/lessons/modal-edit";
import {
  EllipsisIcon,
  Inbox,
  RefreshCw,
  Search,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import { useDeleteLesson } from "@/hooks/lessons";
import SoftDeleteAlert from "./soft-delete-alert";
import CreatorBadge from "./creator-badge";

type LessonWithCreator = Lesson & { creator?: Creator | null };

interface TeacherLessonsTableProps {
  data: LessonWithCreator[];
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

export default function TeacherLessonsTable({
  data,
  loading = false,
  error = null,
  onRetry,
  total,
}: TeacherLessonsTableProps) {
  const [search, setSearch] = useState("");

  const [editModal, setEditModal] = useState<{
    data: Lesson | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const [deleteAlert, setDeleteAlert] = useState<{
    data: LessonWithCreator | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const deleteLesson = useDeleteLesson();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    let result = q
      ? data.filter(
          (l) =>
            l.title.toLowerCase().includes(q) ||
            l.slug.toLowerCase().includes(q),
        )
      : data;
    return [...result].sort((a, b) => {
      if (a.module_id !== b.module_id) return (a.module_id || 0) - (b.module_id || 0);
      return (a.order || 0) - (b.order || 0);
    });
  }, [data, search]);

  const showToolbar = !loading && !error && data.length > 0;

  const handleConfirmDelete = () => {
    if (!deleteAlert.data) return;
    deleteLesson.mutate(deleteAlert.data.slug, {
      onSuccess: () => setDeleteAlert({ data: null, isOpen: false }),
    });
  };

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border">
        {showToolbar && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {total ?? data.length}
              </span>{" "}
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
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
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
                <Button variant="outline" size="sm" onClick={onRetry}>
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
            description="Add your first lesson to start building content."
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
                <th className="hidden px-4 py-2 font-medium lg:table-cell">
                  Creator
                </th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">
                  Updated
                </th>
                <th className="w-10 px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((lesson) => (
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
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <CreatorBadge creator={lesson.creator} />
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {formatUpdated(lesson.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            aria-label="open menu"
                            className="h-7 w-7 text-muted-foreground hover:text-foreground">
                            <EllipsisIcon className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() =>
                              setEditModal({ data: lesson, isOpen: true })
                            }>
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              setDeleteAlert({ data: lesson, isOpen: true })
                            }>
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
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

      <SoftDeleteAlert
        isOpen={deleteAlert.isOpen}
        onOpenChange={(open) =>
          setDeleteAlert((prev) => ({ ...prev, isOpen: open }))
        }
        title={deleteAlert.data?.title ?? ""}
        isPending={deleteLesson.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
