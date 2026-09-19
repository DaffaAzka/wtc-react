import { useState, useMemo } from "react";
import { Link, useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { useGetAllChallengesPaginated } from "@/hooks/challenges";
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
  Trash2,
} from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useDeleteChallenge } from "@/hooks/challenges";
import { toast } from "sonner";
import { Skeleton } from "@/components/ui/skeleton";
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

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  easy:   { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  medium: { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  hard:   { bg: "bg-[#ff007b]/10", text: "text-[#ff007b]" },
};

function DifficultyBadge({ difficulty }: { difficulty?: string | null }) {
  if (!difficulty) return <span className="text-gray-400 dark:text-gray-600">—</span>;
  const s = DIFFICULTY_STYLE[difficulty.toLowerCase()] ?? { bg: "bg-gray-100 dark:bg-white/5", text: "text-gray-500" };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] capitalize ${s.bg} ${s.text}`}>
      {difficulty}
    </span>
  );
}

function TypeBadge({ type }: { type: string }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 capitalize">
      {type.replace(/_/g, " ")}
    </span>
  );
}

function getContextForChallenge(challenge: Challenge): ChallengeContext {
  return {
    type: challenge.lesson_id ? "lesson" : "module",
    id: challenge.lesson_id || challenge.module_id || 0,
    slug: "",
    title: challenge.lesson_id ? `Lesson #${challenge.lesson_id}` : challenge.module_id ? `Module #${challenge.module_id}` : "Unknown",
  };
}

export default function AllChallengesPage() {
  const navigate = useNavigate();
  const { challenges, loading, error, refresh } = useGetAllChallengesPaginated();
  const deleteChallenge = useDeleteChallenge();
  const [search, setSearch] = useState("");
  const [editModal, setEditModal] = useState<{ challenge: Challenge | null; isOpen: boolean }>({ challenge: null, isOpen: false });
  const [deleteDialog, setDeleteDialog] = useState<{ challenge: Challenge | null; isOpen: boolean }>({ challenge: null, isOpen: false });

  const handleDelete = async () => {
    if (!deleteDialog.challenge) return;
    try {
      await deleteChallenge.mutateAsync(deleteDialog.challenge.id);
      toast.success("Challenge deleted successfully");
      setDeleteDialog({ challenge: null, isOpen: false });
    } catch {
      toast.error("Failed to delete challenge");
    }
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return challenges;
    return challenges.filter((c) => c.title.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q) || c.type.toLowerCase().includes(q));
  }, [challenges, search]);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Content</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            All Challenges
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Browse and manage all challenges across lessons and modules.
          </p>
        </div>
      </div>

      {/* Table card */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        {/* Toolbar */}
        {!loading && !error && challenges.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-100 dark:border-white/5 px-5 py-3.5 bg-white dark:bg-[#0b1215]">
            <p className="text-[13px] text-gray-500 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-white">{challenges.length}</span>{" "}
              {challenges.length === 1 ? "challenge" : "challenges"}
              {filtered.length !== challenges.length && <span className="text-gray-400"> · {filtered.length} shown</span>}
            </p>
            <div className="relative w-full max-w-xs">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 dark:text-gray-600" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search challenges…"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 pl-9 pr-4 py-2 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
            </div>
          </div>
        )}

        {loading ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5 bg-white dark:bg-[#0b1215]">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-3.5">
                <Skeleton className="h-4 w-48 rounded-lg" />
                <Skeleton className="hidden sm:block h-4 w-20 rounded-full" />
                <Skeleton className="hidden md:block h-4 w-16 rounded-full" />
                <Skeleton className="ml-auto h-3 w-12 rounded-md" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <TriangleAlert className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">Couldn't load challenges.</p>
            <button onClick={() => refresh()}
              className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        ) : challenges.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">No challenges yet</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">Challenges can be created from individual lesson or module pages.</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center bg-white dark:bg-[#0b1215]">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <SearchX className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">No matches for "{search}"</p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400">Try a different title, slug, or type.</p>
          </div>
        ) : (
          <table className="w-full text-sm bg-white dark:bg-[#0b1215]">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">Title</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 sm:table-cell">Type</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 md:table-cell">Difficulty</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 lg:table-cell">Context</th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 lg:table-cell">Updated</th>
                <th className="w-10 px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {filtered.map((challenge) => (
                <tr key={challenge.id} className="hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[14px] text-gray-900 dark:text-white">{challenge.title}</span>
                      <span className="hidden sm:inline rounded-lg bg-gray-100 dark:bg-white/5 px-1.5 py-0.5 font-mono text-[11px] text-gray-400 dark:text-gray-600">/{challenge.slug}</span>
                    </div>
                    <div className="mt-1 flex gap-2 sm:hidden">
                      <TypeBadge type={challenge.type} />
                    </div>
                  </td>
                  <td className="hidden px-5 py-3.5 sm:table-cell"><TypeBadge type={challenge.type} /></td>
                  <td className="hidden px-5 py-3.5 md:table-cell"><DifficultyBadge difficulty={challenge.difficulty} /></td>
                  <td className="hidden px-5 py-3.5 text-[13px] text-gray-500 dark:text-gray-400 lg:table-cell">
                    {challenge.lesson_id ? `Lesson #${challenge.lesson_id}` : challenge.module_id ? `Module #${challenge.module_id}` : "—"}
                  </td>
                  <td className="hidden px-5 py-3.5 text-[13px] text-gray-500 dark:text-gray-400 lg:table-cell">{formatUpdated(challenge.updated_at)}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <Button
                          variant="ghost"
                          size="icon"
                          className="text-gray-400 hover:text-white"
                          title="View Challenge"
                          asChild>
                          <Link to={`/challenges/${challenge.id}`}>
                            <Eye className="w-4 h-4" />
                          </Link>
                        </Button>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                            <EllipsisIcon className="h-4 w-4" />
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-xl">
                          <Link to={`/challenges/${challenge.id}`}>
                            <DropdownMenuItem className="rounded-lg">
                              <Eye className="h-4 w-4 mr-2" />
                              View
                            </DropdownMenuItem>
                          </Link>
                          <DropdownMenuItem className="rounded-lg" onClick={() => setEditModal({ challenge, isOpen: true })}>
                            <Pencil className="h-4 w-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="rounded-lg" onClick={() => navigate(`/submissions/${challenge.id}`)}>
                            <FileText className="h-4 w-4 mr-2" />
                            Submissions
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            variant="destructive"
                            className="rounded-lg"
                            onClick={() => setDeleteDialog({ challenge, isOpen: true })}
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) => setDeleteDialog((prev) => ({ ...prev, isOpen: open }))}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.challenge?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteChallenge.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteChallenge.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteChallenge.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit modals */}
      {editModal.challenge && (
        editModal.challenge.type === "file_upload" ? (
          <CodingAssignmentModalEdit
            key={`edit-${editModal.challenge.id}`}
            challenge={editModal.challenge}
            context={getContextForChallenge(editModal.challenge)}
            isOpen={editModal.isOpen}
            onOpenChange={(open) => setEditModal((prev) => ({ ...prev, isOpen: open }))}
          />
        ) : (
          <ChallengeModalEdit
            key={`edit-${editModal.challenge.id}`}
            challenge={editModal.challenge}
            context={getContextForChallenge(editModal.challenge)}
            isOpen={editModal.isOpen}
            onOpenChange={(open) => setEditModal((prev) => ({ ...prev, isOpen: open }))}
          />
        )
      )}
    </div>
  );
}
