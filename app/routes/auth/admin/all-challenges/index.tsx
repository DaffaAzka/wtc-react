import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { useGetAllChallengesPaginated } from "@/hooks/challenges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  EllipsisIcon,
  Inbox,
  RefreshCw,
  Search,
  SearchX,
  TriangleAlert,
  Eye,
  FileText,
  Pencil,
} from "lucide-react";
import type { Challenge } from "@/types/model";
import type { ChallengeContext } from "@/features/auth/challenges/challenge-manager";
import ChallengeModalEdit from "@/features/auth/challenges/modal-edit";
import CodingAssignmentModalEdit from "@/features/auth/challenges/modal-edit-coding-assignment";

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

function getDifficultyVariant(difficulty?: string) {
  if (difficulty === "easy") return "default";
  if (difficulty === "medium") return "secondary";
  if (difficulty === "hard") return "destructive";
  return "outline";
}

function getContextForChallenge(challenge: Challenge): ChallengeContext {
  return {
    type: challenge.lesson_id ? "lesson" : "module",
    id: challenge.lesson_id || challenge.module_id || 0,
    slug: "",
    title: challenge.lesson_id
      ? `Lesson #${challenge.lesson_id}`
      : challenge.module_id
        ? `Module #${challenge.module_id}`
        : "Unknown",
  };
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

export default function AllChallengesPage() {
  const navigate = useNavigate();
  const { challenges, loading, error, refresh } = useGetAllChallengesPaginated();
  const [search, setSearch] = useState("");

  const [editModal, setEditModal] = useState<{
    challenge: Challenge | null;
    isOpen: boolean;
  }>({ challenge: null, isOpen: false });

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return challenges;
    return challenges.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.slug.toLowerCase().includes(q) ||
        c.type.toLowerCase().includes(q),
    );
  }, [challenges, search]);

  const showToolbar = !loading && !error && challenges.length > 0;

  return (
    <>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">All Challenges</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse and manage all challenges across lessons and modules.
          </p>
        </div>
      </div>

      <div className="overflow-hidden rounded-md border border-border">
        {showToolbar && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {challenges.length}
              </span>{" "}
              {challenges.length === 1 ? "challenge" : "challenges"}
              {filtered.length !== challenges.length && (
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

        {loading ?
          <div className="divide-y divide-border">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-3.5 w-48 animate-pulse rounded bg-muted" />
                <div className="hidden h-3.5 w-20 animate-pulse rounded bg-muted sm:block" />
                <div className="hidden h-3.5 w-16 animate-pulse rounded bg-muted md:block" />
                <div className="ml-auto h-3 w-12 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        : error ?
          <EmptyState
            icon={TriangleAlert}
            title="Couldn't load challenges"
            description="Something went wrong while fetching challenges."
            action={
              <Button variant="outline" size="sm" onClick={() => refresh()}>
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            }
          />
        : challenges.length === 0 ?
          <EmptyState
            icon={Inbox}
            title="No challenges yet"
            description="Challenges can be created from individual lesson or module pages."
          />
        : filtered.length === 0 ?
          <EmptyState
            icon={SearchX}
            title={`No challenges match "${search}"`}
            description="Try a different title, slug, or type."
          />
        : <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">
                  Type
                </th>
                <th className="hidden px-4 py-2 font-medium md:table-cell">
                  Difficulty
                </th>
                <th className="hidden px-4 py-2 font-medium lg:table-cell">
                  Context
                </th>
                <th className="hidden px-4 py-2 font-medium lg:table-cell">
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
                        /{challenge.slug}
                      </span>
                    </div>
                    <div className="mt-0.5 flex gap-2 sm:hidden">
                      <Badge variant="outline" className="text-[10px]">
                        {challenge.type.replace(/_/g, " ")}
                      </Badge>
                    </div>
                  </td>
                  <td className="hidden px-4 py-3 sm:table-cell">
                    <Badge variant="outline" className="text-xs">
                      {challenge.type.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 md:table-cell">
                    {challenge.difficulty ?
                      <Badge
                        variant={getDifficultyVariant(challenge.difficulty)}
                        className="text-xs capitalize">
                        {challenge.difficulty}
                      </Badge>
                    : <span className="text-muted-foreground">—</span>}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    {challenge.lesson_id ?
                      `Lesson #${challenge.lesson_id}`
                    : challenge.module_id ?
                      `Module #${challenge.module_id}`
                    : "—"}
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground lg:table-cell">
                    {formatUpdated(challenge.updated_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <Link
                        to={`/admin/challenges/${challenge.id}`}
                        className="rounded-md px-2 py-1 text-xs text-muted-foreground hover:bg-muted hover:text-foreground">
                        View
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
                          <Link to={`/admin/challenges/${challenge.id}`}>
                            <DropdownMenuItem>
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem
                            onClick={() =>
                              setEditModal({ challenge, isOpen: true })
                            }>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() =>
                              navigate(`/admin/submissions/${challenge.id}`)
                            }>
                            <FileText className="h-4 w-4 mr-2" />
                            Submissions
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        }
      </div>

      {/* Edit Modals */}
      {editModal.challenge && (
        editModal.challenge.type === "file_upload" ?
          <CodingAssignmentModalEdit
            key={`edit-${editModal.challenge.id}`}
            challenge={editModal.challenge}
            context={getContextForChallenge(editModal.challenge)}
            isOpen={editModal.isOpen}
            onOpenChange={(open) =>
              setEditModal((prev) => ({ ...prev, isOpen: open }))
            }
          />
        : <ChallengeModalEdit
            key={`edit-${editModal.challenge.id}`}
            challenge={editModal.challenge}
            context={getContextForChallenge(editModal.challenge)}
            isOpen={editModal.isOpen}
            onOpenChange={(open) =>
              setEditModal((prev) => ({ ...prev, isOpen: open }))
            }
          />
      )}
    </>
  );
}
