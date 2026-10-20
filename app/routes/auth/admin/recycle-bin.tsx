import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
  ChevronLeft,
  ChevronRight,
  Inbox,
  Layers,
  NotebookText,
  RefreshCw,
  RotateCcw,
  Route as RouteIcon,
  TerminalSquare,
  Trash2,
  TriangleAlert,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import type { ApiErrorResponse } from "@/types/response";

type Resource = "tracks" | "modules" | "lessons" | "challenges";

type TrashedItem = {
  id: number;
  title: string;
  deleted_at: string | null;
  track?: { id: number; title: string } | null;
  module?: { id: number; title: string } | null;
  lesson?: { id: number; title: string } | null;
  modules_count?: number;
  lessons_count?: number;
  challenges_count?: number;
};

type TrashedResponse = {
  success: boolean;
  data: TrashedItem[];
  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};

const RESOURCES: Record<
  Resource,
  {
    label: string;
    singular: string;
    icon: typeof RouteIcon;
    accent: string;
    cascade?: string;
  }
> = {
  tracks: {
    label: "Tracks",
    singular: "track",
    icon: RouteIcon,
    accent: "text-[#1c81ff] bg-[#1c81ff]/10",
    cascade: "Semua modul, lesson, dan challenge di dalamnya ikut dipulihkan.",
  },
  modules: {
    label: "Modules",
    singular: "modul",
    icon: Layers,
    accent: "text-[#f6b60b] bg-[#f6b60b]/10",
    cascade: "Semua lesson dan challenge di dalamnya ikut dipulihkan.",
  },
  lessons: {
    label: "Lessons",
    singular: "lesson",
    icon: NotebookText,
    accent: "text-[#31c7c8] bg-[#31c7c8]/10",
    cascade: "Semua challenge di dalamnya ikut dipulihkan.",
  },
  challenges: {
    label: "Challenges",
    singular: "challenge",
    icon: TerminalSquare,
    accent: "text-[#a855f7] bg-[#a855f7]/10",
  },
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function relativeTime(dateString?: string | null) {
  if (!dateString) return "";
  const diff = Date.now() - new Date(dateString).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 60) return `${Math.max(minutes, 1)} menit lalu`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours} jam lalu`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days} hari lalu`;
  return `${Math.floor(days / 30)} bulan lalu`;
}

function childSummary(item: TrashedItem): string {
  const parts: string[] = [];
  if (item.modules_count) parts.push(`${item.modules_count} modul`);
  if (item.lessons_count) parts.push(`${item.lessons_count} lesson`);
  if (item.challenges_count) parts.push(`${item.challenges_count} challenge`);
  return parts.join(" · ");
}

function parentPath(resource: Resource, item: TrashedItem): string | null {
  if (resource === "modules" && item.track) return item.track.title;
  if (resource === "lessons" && item.module) return item.module.title;
  if (resource === "challenges") return item.lesson?.title ?? item.module?.title ?? null;
  return null;
}

function TrashedList({ resource }: { resource: Resource }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin", resource, "trashed"];
  const meta = RESOURCES[resource];
  const Icon = meta.icon;

  const [page, setPage] = useState(1);
  const [restoreItem, setRestoreItem] = useState<TrashedItem | null>(null);
  const [deleteItem, setDeleteItem] = useState<TrashedItem | null>(null);

  const { data, isLoading, error, refetch } = useQuery<TrashedResponse, ApiErrorResponse>({
    queryKey: [...queryKey, page],
    queryFn: async () => {
      const res = await api.get<TrashedResponse>(`/admin/${resource}/trashed`, {
        params: { page },
      });
      return res.data;
    },
  });

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey });
    setRestoreItem(null);
    setDeleteItem(null);
  };

  const restore = useMutation<void, ApiErrorResponse, number>({
    mutationFn: async (id) => {
      await api.post(`/admin/${resource}/${id}/restore`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Berhasil dipulihkan", {
        description: `${meta.singular} sudah aktif kembali.`,
      });
    },
    onError: (err) => {
      toast.error("Gagal memulihkan", {
        description: err.message || "Terjadi kesalahan.",
      });
    },
  });

  const forceDelete = useMutation<void, ApiErrorResponse, number>({
    mutationFn: async (id) => {
      await api.delete(`/admin/${resource}/${id}/force`);
    },
    onSuccess: () => {
      invalidate();
      toast.success("Dihapus permanen", {
        description: `${meta.singular} tidak bisa dipulihkan lagi.`,
      });
    },
    onError: (err) => {
      toast.error("Gagal menghapus permanen", {
        description: err.message || "Terjadi kesalahan.",
      });
    },
  });

  const items = data?.data ?? [];
  const pagination = data?.meta;

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]">
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <Skeleton className="h-10 w-10 rounded-xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-3.5 w-48 rounded-full" />
                  <Skeleton className="h-3 w-32 rounded-full" />
                </div>
                <Skeleton className="h-8 w-20 rounded-xl" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <TriangleAlert className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              Gagal memuat {meta.label.toLowerCase()} yang dihapus.
            </p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Coba lagi
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-12 h-12 rounded-2xl bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 dark:text-white">
                Tidak ada {meta.label.toLowerCase()} yang dihapus
              </p>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                Item yang dihapus akan muncul di sini dan bisa dipulihkan.
              </p>
            </div>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100 dark:divide-white/5">
            {items.map((item) => {
              const summary = childSummary(item);
              const parent = parentPath(resource, item);

              return (
                <li
                  key={item.id}
                  className="group flex items-start gap-4 px-4 py-4 sm:px-5 hover:bg-gray-50 dark:hover:bg-white/[0.03] transition-colors"
                >
                  <div className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-xl ${meta.accent}`}>
                    <Icon className="h-5 w-5" />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-bold text-[14px] text-gray-900 dark:text-white truncate">
                        {item.title}
                      </p>
                      {parent && (
                        <span className="inline-flex items-center rounded-full bg-gray-100 dark:bg-white/5 px-2 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400 max-w-[180px] truncate">
                          {parent}
                        </span>
                      )}
                    </div>
                    <p className="text-[12px] text-gray-400 dark:text-gray-600 mt-0.5">
                      Dihapus {formatDate(item.deleted_at)}
                      {item.deleted_at && ` · ${relativeTime(item.deleted_at)}`}
                      {summary && ` · ${summary}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 rounded-xl font-bold text-[#1c81ff] hover:text-[#1c81ff] hover:bg-[#1c81ff]/10"
                      onClick={() => setRestoreItem(item)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Pulihkan</span>
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="gap-1.5 rounded-xl font-bold text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10"
                      onClick={() => setDeleteItem(item)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      <span className="hidden sm:inline">Hapus</span>
                    </Button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.last_page > 1 && (
        <div className="flex items-center justify-between pt-4">
          <p className="text-[12px] text-gray-500 dark:text-gray-400">
            Halaman {pagination.current_page} dari {pagination.last_page} · {pagination.total} item
          </p>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl font-bold"
              disabled={pagination.current_page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
              Sebelumnya
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="rounded-xl font-bold"
              disabled={pagination.current_page >= pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Berikutnya
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      {/* Restore */}
      <AlertDialog open={restoreItem !== null} onOpenChange={(open) => !open && setRestoreItem(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Pulihkan {meta.singular}?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-gray-500 dark:text-gray-400 space-y-2">
              <span className="block">
                <span className="font-bold text-gray-900 dark:text-white">{restoreItem?.title}</span>{" "}
                akan aktif kembali dan terlihat oleh pengguna.
              </span>
              {meta.cascade && <span className="block">{meta.cascade}</span>}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={restore.isPending}
              className="rounded-xl border-[1.5px] border-gray-200 dark:border-white/20 font-bold"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => restoreItem && restore.mutate(restoreItem.id)}
              disabled={restore.isPending}
              className="bg-[#1c81ff] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-transform"
            >
              {restore.isPending ? "Memulihkan…" : "Pulihkan"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Permanent delete */}
      <AlertDialog open={deleteItem !== null} onOpenChange={(open) => !open && setDeleteItem(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Hapus permanen?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-gray-500 dark:text-gray-400 space-y-2">
              <span className="block">
                <span className="font-bold text-gray-900 dark:text-white">{deleteItem?.title}</span>{" "}
                akan dihapus selamanya. Tindakan ini tidak bisa dibatalkan.
              </span>
              {meta.cascade && (
                <span className="block text-red-500 dark:text-red-400">
                  {meta.cascade.replace("ikut dipulihkan", "ikut terhapus permanen")}
                </span>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={forceDelete.isPending}
              className="rounded-xl border-[1.5px] border-gray-200 dark:border-white/20 font-bold"
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteItem && forceDelete.mutate(deleteItem.id)}
              disabled={forceDelete.isPending}
              className="bg-red-500 text-white font-bold rounded-xl hover:bg-red-600"
            >
              {forceDelete.isPending ? "Menghapus…" : "Hapus permanen"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function RecycleBinPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 60);
    return () => clearTimeout(t);
  }, []);

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
          Admin
        </p>
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Recycle Bin
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Konten yang dihapus bisa dipulihkan beserta seluruh isinya, atau dihapus permanen.
        </p>
      </div>

      <Tabs defaultValue="tracks">
        <TabsList className="bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1 h-auto flex-wrap">
          {(Object.keys(RESOURCES) as Resource[]).map((resource) => {
            const Icon = RESOURCES[resource].icon;
            return (
              <TabsTrigger
                key={resource}
                value={resource}
                className="gap-1.5 rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400"
              >
                <Icon className="h-3.5 w-3.5" />
                {RESOURCES[resource].label}
              </TabsTrigger>
            );
          })}
        </TabsList>
        {(Object.keys(RESOURCES) as Resource[]).map((resource) => (
          <TabsContent key={resource} value={resource} className="mt-6">
            <TrashedList resource={resource} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
