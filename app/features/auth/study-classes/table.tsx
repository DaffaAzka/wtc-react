import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { StudyClass } from "@/services/study-class";
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
  Users,
} from "lucide-react";
import ModalDelete from "./modal-delete";

interface StudyClassesTableProps {
  data: StudyClass[];
  loading?: boolean;
  error?: ApiErrorResponse | null;
  onRetry?: () => void;
}

function formatDate(dateString?: string) {
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

export default function StudyClassesTable({
  data,
  loading = false,
  error = null,
  onRetry,
}: StudyClassesTableProps) {
  const [search, setSearch] = useState("");

  const [editModal, setEditModal] = useState<{
    data: StudyClass | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const [deleteModal, setDeleteModal] = useState<{
    data: StudyClass | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (studyClass) =>
        studyClass.name.toLowerCase().includes(q) ||
        studyClass.description?.toLowerCase().includes(q) ||
        studyClass.academic_year?.toLowerCase().includes(q) ||
        studyClass.semester?.toLowerCase().includes(q)
    );
  }, [data, search]);

  const showToolbar = !loading && !error && data.length > 0;

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border">
        {showToolbar && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">{data.length}</span>{" "}
              {data.length === 1 ? "class" : "classes"}
              {filtered.length !== data.length && (
                <span> · {filtered.length} shown</span>
              )}
            </p>
            <div className="relative w-full max-w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search classes"
                className="w-full rounded-md border border-border bg-transparent py-1.5 pl-8 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
              />
            </div>
          </div>
        )}

        {loading ?
          <div className="divide-y divide-border">
            {Array.from({ length: 6 }).map((_, index) => (
              <div key={index} className="flex items-center gap-4 px-4 py-3">
                <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                <div className="hidden h-3.5 w-32 animate-pulse rounded bg-muted sm:block" />
                <div className="hidden h-3.5 w-24 animate-pulse rounded bg-muted md:block" />
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        : error ?
          <EmptyState
            icon={TriangleAlert}
            title="Couldn't load study classes"
            description="Something went wrong while fetching study classes."
            action={
              onRetry && (
                <Button variant="outline" size="sm" onClick={() => onRetry()}>
                  <RefreshCw className="h-3.5 w-3.5" />
                  Try again
                </Button>
              )
            }
          />
        : data.length === 0 ?
          <EmptyState
            icon={Inbox}
            title="No study classes yet"
            description="Add your first study class to start organizing students."
          />
        : filtered.length === 0 ?
          <EmptyState
            icon={SearchX}
            title={`No classes match "${search}"`}
            description="Try a different search term."
          />
        : <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Class Name</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">
                  Academic Year
                </th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">
                  Semester
                </th>
                <th className="hidden px-4 py-2 font-medium lg:table-cell">
                  Students
                </th>
                <th className="hidden px-4 py-2 font-medium xl:table-cell">
                  Updated
                </th>
                <th className="w-10 px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((studyClass) => {
                const updated = formatDate(studyClass.updated_at);
                return (
                  <tr key={studyClass.id} className="group hover:bg-muted/40">
                    <td className="px-4 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-foreground">
                          {studyClass.name}
                        </span>
                        {studyClass.description && (
                          <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                            {studyClass.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground sm:table-cell">
                      {studyClass.academic_year || "—"}
                    </td>
                    <td className="hidden px-4 py-3 text-muted-foreground md:table-cell">
                      {studyClass.semester ?
                        `Semester ${studyClass.semester}`
                      : "—"}
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell">
                      <div className="flex items-center gap-1.5 text-muted-foreground">
                        <Users className="h-3.5 w-3.5" />
                        <span>
                          {studyClass.students_count ?? 0}
                        </span>
                      </div>
                    </td>
                    <td className="hidden px-4 py-3 text-xs text-muted-foreground xl:table-cell">
                      {updated}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
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
                            <DropdownMenuItem
                              onClick={() =>
                                setEditModal({ data: studyClass, isOpen: true })
                              }>
                              Update
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              variant="destructive"
                              onClick={() =>
                                setDeleteModal({
                                  data: studyClass,
                                  isOpen: true,
                                })
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
        }
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
