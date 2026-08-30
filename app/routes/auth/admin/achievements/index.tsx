import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  Plus, Pencil, Trash2, Inbox, Loader2, Trophy, ToggleLeft, ToggleRight,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  useAdminAchievements,
  useCreateAchievement,
  useUpdateAchievement,
  useDeleteAchievement,
  useToggleAchievement,
} from "@/hooks/achievement";
import { api } from "@/lib/axios";
import type { Achievement, TriggerType } from "@/types/certificate";
import type { AchievementRequest } from "@/services/achievement";
import type { Track } from "@/types/model";

// ── Constants ─────────────────────────────────────────────────────────────────

const TRIGGER_LABELS: Record<TriggerType, string> = {
  manual: "Manual",
  first_login: "First Login",
  track_complete: "Track Complete",
  challenge_grade_a: "Challenge Grade A",
  certificate_earned: "Certificate Earned",
  points_milestone: "Points Milestone",
  streak_days: "Streak Days",
};

const EMPTY_FORM: AchievementRequest = {
  name: "",
  description: "",
  badge_emoji: "🏆",
  trigger_type: "manual",
  trigger_config: null,
  points_reward: 0,
  is_active: true,
};

// ── Achievement form modal ────────────────────────────────────────────────────

function AchievementFormModal({
  open,
  onClose,
  initial,
  tracks,
}: {
  open: boolean;
  onClose: () => void;
  initial: (Achievement & { editing: true }) | null;
  tracks: Track[];
}) {
  const create = useCreateAchievement();
  const update = useUpdateAchievement();

  const [form, setForm] = useState<AchievementRequest>(EMPTY_FORM);

  useEffect(() => {
    if (initial) {
      setForm({
        name: initial.name,
        description: initial.description ?? "",
        badge_emoji: initial.badge_emoji,
        trigger_type: initial.trigger_type,
        trigger_config: initial.trigger_config,
        points_reward: initial.points_reward,
        is_active: initial.is_active,
      });
    } else {
      setForm(EMPTY_FORM);
    }
  }, [initial, open]);

  const set = <K extends keyof AchievementRequest>(k: K, v: AchievementRequest[K]) =>
    setForm((f) => ({ ...f, [k]: v }));

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: AchievementRequest = {
      ...form,
      trigger_config:
        form.trigger_type === "track_complete" || form.trigger_type === "points_milestone"
          ? form.trigger_config
          : null,
    };

    if (initial) {
      update.mutate(
        { id: initial.id, ...payload },
        {
          onSuccess: () => { toast.success("Achievement updated"); onClose(); },
          onError: (err) => toast.error(err?.message || "Update failed"),
        },
      );
    } else {
      create.mutate(payload, {
        onSuccess: () => { toast.success("Achievement created"); onClose(); },
        onError: (err) => toast.error(err?.message || "Create failed"),
      });
    }
  };

  const isPending = create.isPending || update.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="rounded-2xl max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[18px] font-extrabold" style={{ letterSpacing: "-0.01em" }}>
            {initial ? "Edit Achievement" : "New Achievement"}
          </DialogTitle>
          <DialogDescription className="text-[13px] text-gray-500 dark:text-gray-400">
            {initial ? "Update the achievement details." : "Create a new achievement badge."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5 mt-2">
          {/* Emoji + Name row */}
          <div className="flex items-start gap-3">
            <div>
              <label className="block text-[12px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                Emoji
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={form.badge_emoji}
                  onChange={(e) => set("badge_emoji", e.target.value)}
                  maxLength={4}
                  className="w-20 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 text-center text-2xl py-2 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
                />
              </div>
              <div className="text-3xl text-center mt-1.5">{form.badge_emoji}</div>
            </div>
            <div className="flex-1">
              <label className="block text-[12px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => set("name", e.target.value)}
                placeholder="Achievement name"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-[12px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">
              Description
            </label>
            <textarea
              value={form.description ?? ""}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Describe when this achievement is earned…"
              rows={2}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all resize-none"
            />
          </div>

          {/* Points reward */}
          <div>
            <label className="block text-[12px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">
              Points Reward
            </label>
            <input
              type="number"
              min={0}
              value={form.points_reward}
              onChange={(e) => set("points_reward", Number(e.target.value))}
              className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-white focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
            />
          </div>

          {/* Trigger type */}
          <div>
            <label className="block text-[12px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">
              Trigger Type
            </label>
            <Select
              value={form.trigger_type}
              onValueChange={(v) => {
                set("trigger_type", v as TriggerType);
                set("trigger_config", null);
              }}
            >
              <SelectTrigger className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                {(Object.entries(TRIGGER_LABELS) as [TriggerType, string][]).map(([v, l]) => (
                  <SelectItem key={v} value={v}>{l}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic trigger config */}
          {form.trigger_type === "track_complete" && (
            <div>
              <label className="block text-[12px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                Track (optional — leave blank for any track)
              </label>
              <Select
                value={form.trigger_config?.track_id ? String(form.trigger_config.track_id) : "any"}
                onValueChange={(v) =>
                  set("trigger_config", v === "any" ? null : { track_id: Number(v) })
                }
              >
                <SelectTrigger className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                  <SelectValue placeholder="Any track" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="any">Any track</SelectItem>
                  {tracks.map((t) => (
                    <SelectItem key={t.id} value={String(t.id)}>{t.title}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {form.trigger_type === "points_milestone" && (
            <div>
              <label className="block text-[12px] font-bold text-gray-600 dark:text-gray-400 mb-1.5">
                Points Threshold
              </label>
              <input
                type="number"
                min={1}
                value={form.trigger_config?.threshold ?? ""}
                onChange={(e) =>
                  set("trigger_config", { threshold: Number(e.target.value) })
                }
                placeholder="e.g. 1000"
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-2.5 text-[14px] text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-600 focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all"
              />
            </div>
          )}

          {/* Active toggle */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => set("is_active", !form.is_active)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${form.is_active ? "bg-[#1c81ff]" : "bg-gray-200 dark:bg-white/10"}`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${form.is_active ? "translate-x-6" : "translate-x-1"}`}
              />
            </button>
            <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
              {form.is_active ? "Active" : "Inactive"}
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-2 pt-2 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold px-4 py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl bg-[#1c81ff] text-white font-bold px-5 py-2 text-[13px] hover:bg-[#1c81ff]/90 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
              {initial ? "Save Changes" : "Create"}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ── Trigger badge ─────────────────────────────────────────────────────────────

function TriggerBadge({ type }: { type: TriggerType }) {
  return (
    <span className="inline-flex items-center rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] text-gray-500 dark:text-gray-400">
      {TRIGGER_LABELS[type] ?? type}
    </span>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function AdminAchievements() {
  const { achievements, loading } = useAdminAchievements();
  const deleteAchievement = useDeleteAchievement();
  const toggleAchievement = useToggleAchievement();

  const [mounted, setMounted] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<(Achievement & { editing: true }) | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Achievement | null>(null);
  const [tracks, setTracks] = useState<Track[]>([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    api.get("/tracks").then((r) => setTracks(r.data?.data ?? [])).catch(() => {});
  }, []);

  const handleEdit = (a: Achievement) => {
    setEditing({ ...a, editing: true });
    setModalOpen(true);
  };

  const handleNew = () => {
    setEditing(null);
    setModalOpen(true);
  };

  const handleDelete = () => {
    if (!deleteTarget) return;
    deleteAchievement.mutate(deleteTarget.id, {
      onSuccess: () => { toast.success("Achievement deleted"); setDeleteTarget(null); },
      onError: (err) => toast.error(err?.message || "Delete failed"),
    });
  };

  const handleToggle = (a: Achievement) => {
    toggleAchievement.mutate(
      { id: a.id, is_active: !a.is_active },
      { onError: (err) => toast.error(err?.message || "Toggle failed") },
    );
  };

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            Admin
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Achievements
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Manage achievement badges and their trigger conditions.
          </p>
        </div>
        <button
          onClick={handleNew}
          className="shrink-0 mt-1 flex items-center gap-2 rounded-xl bg-[#1c81ff] text-white font-bold px-5 py-2.5 text-[13px] hover:bg-[#1c81ff]/90 transition-colors shadow-lg shadow-blue-500/20"
        >
          <Plus className="h-4 w-4" />
          New Achievement
        </button>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
              {["Badge", "Name", "Trigger", "Points", "Active", ""].map((h, i) => (
                <th
                  key={i}
                  className={`px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 ${i >= 5 ? "text-right" : "text-left"} ${i === 2 ? "hidden sm:table-cell" : ""} ${i === 3 ? "hidden md:table-cell" : ""}`}
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-[#0b1215] divide-y divide-gray-100 dark:divide-white/5">
            {loading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}>
                  {Array.from({ length: 6 }).map((__, j) => (
                    <td key={j} className={`px-5 py-3.5 ${j === 2 ? "hidden sm:table-cell" : ""} ${j === 3 ? "hidden md:table-cell" : ""}`}>
                      <Skeleton className="h-4 w-full rounded-lg" />
                    </td>
                  ))}
                </tr>
              ))
            ) : achievements.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-16 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
                      <Inbox className="h-6 w-6 text-gray-400 dark:text-gray-600" />
                    </div>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400">No achievements yet</p>
                    <button onClick={handleNew} className="text-[13px] font-bold text-[#1c81ff] hover:opacity-80 transition-opacity">
                      Create the first one
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              achievements.map((a) => (
                <tr key={a.id} className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors group">
                  {/* Badge emoji */}
                  <td className="px-5 py-3.5">
                    <div className="text-2xl leading-none">{a.badge_emoji}</div>
                  </td>
                  {/* Name + description */}
                  <td className="px-5 py-3.5">
                    <div className="font-bold text-[14px] text-gray-900 dark:text-white">
                      {a.name}
                    </div>
                    {a.description && (
                      <div className="text-[12px] text-gray-400 dark:text-gray-500 line-clamp-1 mt-0.5">
                        {a.description}
                      </div>
                    )}
                  </td>
                  {/* Trigger */}
                  <td className="hidden sm:table-cell px-5 py-3.5">
                    <TriggerBadge type={a.trigger_type} />
                  </td>
                  {/* Points */}
                  <td className="hidden md:table-cell px-5 py-3.5">
                    <div className="flex items-center gap-1.5">
                      <Trophy className="h-3.5 w-3.5 text-[#f6b60b]" />
                      <span className="font-bold text-[14px] text-gray-900 dark:text-white tabular-nums">
                        {a.points_reward}
                      </span>
                    </div>
                  </td>
                  {/* Active toggle */}
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => handleToggle(a)}
                      className="flex items-center gap-1.5 transition-opacity hover:opacity-80"
                      title={a.is_active ? "Deactivate" : "Activate"}
                    >
                      {a.is_active ? (
                        <ToggleRight className="h-5 w-5 text-[#1c81ff]" />
                      ) : (
                        <ToggleLeft className="h-5 w-5 text-gray-400 dark:text-gray-600" />
                      )}
                      <span className={`text-[12px] font-bold ${a.is_active ? "text-[#1c81ff]" : "text-gray-400 dark:text-gray-600"}`}>
                        {a.is_active ? "Active" : "Inactive"}
                      </span>
                    </button>
                  </td>
                  {/* Actions */}
                  <td className="px-5 py-3.5 text-right">
                    <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => handleEdit(a)}
                        className="flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
                        title="Edit"
                      >
                        <Pencil className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setDeleteTarget(a)}
                        className="flex items-center justify-center h-7 w-7 rounded-lg text-gray-400 dark:text-gray-600 hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Create/Edit modal */}
      <AchievementFormModal
        open={modalOpen}
        onClose={() => { setModalOpen(false); setEditing(null); }}
        initial={editing}
        tracks={tracks}
      />

      {/* Delete confirm */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => !v && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="font-extrabold">Delete Achievement?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete{" "}
              <strong>{deleteTarget?.badge_emoji} {deleteTarget?.name}</strong>. This action cannot
              be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteAchievement.isPending}
              className="rounded-xl bg-red-500 hover:bg-red-600 text-white"
            >
              {deleteAchievement.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "Delete"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
