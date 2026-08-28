import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Challenge } from "@/types/model";
import type { ApiErrorResponse } from "@/types/response";
import type { Creator } from "./creator-badge";
import { useMemo, useState } from "react";
import {
  EllipsisIcon,
  Inbox,
  RefreshCw,
  Search,
  SearchX,
  TriangleAlert,
} from "lucide-react";
import { useDeleteChallenge } from "@/hooks/challenges";
import SoftDeleteAlert from "./soft-delete-alert";
import CreatorBadge from "./creator-badge";
import ChallengeModalEdit from "@/features/auth/challenges/modal-edit";
import type { ChallengeContext } from "@/features/auth/challenges/challenge-manager";

type ChallengeWithCreator = Challenge & { creator?: Creator | null };

interface TeacherChallengesTableProps {
  data: ChallengeWithCreator[];
  loading?: boolean;
  error?: ApiErrorResponse | null;
  onRetry?: () => void;
  total?: number;
}

const DIFFICULTY_COLORS: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium:
    "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

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

function makeFallbackContext(c: ChallengeWithCreator): ChallengeContext {
  return {
    type: c.lesson_id ? "lesson" : "module",
    id: c.lesson_id ?? c.module_id ?? 0,
    slug: c.slug,
    title: c.title,
  };
}

export default function TeacherChallengesTable({
  data,
  loading = false,
  error = null,
  onRetry,
  total,
}: TeacherChallengesTableProps) {
  const [search, setSearch] = useState("");

  const [editModal, setEditModal] = useState<{
    data: ChallengeWithCreator | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const [deleteAlert, setDeleteAlert] = useState<{
    data: ChallengeWithCreator | null;
    isOpen: boolean;
  }>({ data: null, isOpen: false });

  const deleteChallenge = useDeleteChallenge();

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return data;
    return data.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    );
  }, [data, search]);

  const showToolbar = !loading && !error && data.length > 0;

  const handleConfirmDelete = () => {
    if (!deleteAlert.data) return;
    deleteChallenge.mutate(deleteAlert.data.id, {
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
              {(total ?? data.length) === 1 ? "challenge" : "challenges"}
              {filtered.length !== data.length && (
                <span> · {filtered.length} shown</span>
              )}
            </p>
            <div className="relative w-full max-w-56">
              <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challenges"
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
                <div className="hidden h-3.5 w-20 animate-pulse rounded bg-muted sm:block" />
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={TriangleAlert}
            title="Couldn't load challenges"
            description="Something went wrong while fetching challenges."
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
            title="No challenges yet"
            description="Add your first challenge to start assessing students."
          />
        ) : filtered.length === 0 ? (
          <EmptyState
            icon={SearchX}
            title={`No challenges match "${search}"`}
            description="Try a different title, slug, or type."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">
                  Difficulty
                </th>
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
              {filtered.map((challenge) => (
                <tr key={challenge.id} className="group hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {challenge.title}
                      </span>
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono text-[11px] text-muted-foreground">
                        {challenge.type.replace(/_/g, " ")}
                      </span>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    {challenge.difficulty ? (
                      <span
                        className={`inline-block rounded px-1.5 py-0.5 text-[11px] font-medium capitalize ${DIFFICULTY_COLORS[challenge.difficulty] ?? ""}`}>
                        {challenge.difficulty}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="hidden px-4 py-3 lg:table-cell">
                    <CreatorBadge creator={challenge.creator} />
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground md:table-cell">
                    {formatUpdated(challenge.updated_at)}
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
                              setEditModal({ data: challenge, isOpen: true })
                            }>
                            Update
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            variant="destructive"
                            onClick={() =>
                              setDeleteAlert({ data: challenge, isOpen: true })
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
        <ChallengeModalEdit
          key={editModal.data.id}
          challenge={editModal.data}
          context={makeFallbackContext(editModal.data)}
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
        isPending={deleteChallenge.isPending}
        onConfirm={handleConfirmDelete}
      />
    </>
  );
}
