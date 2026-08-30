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
import { Inbox, RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";
import type { ApiErrorResponse, ApiResponse } from "@/types/response";

type TrashedItem = { id: number; title: string; deleted_at: string };
type Resource = "tracks" | "modules" | "lessons" | "challenges";

const RESOURCE_LABELS: Record<Resource, string> = {
  tracks: "Tracks",
  modules: "Modules",
  lessons: "Lessons",
  challenges: "Challenges",
};

function formatDate(dateString?: string | null) {
  if (!dateString) return "—";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function TrashedTable({ resource }: { resource: Resource }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin", resource, "trashed"];
  const label = RESOURCE_LABELS[resource].toLowerCase();

  const { data, isLoading, error, refetch } = useQuery<TrashedItem[], ApiErrorResponse>({
    queryKey,
    queryFn: async () => {
      const res = await api.get<ApiResponse<TrashedItem[]>>(`/admin/${resource}/trashed`);
      return res.data.data ?? [];
    },
  });

  const [confirmItem, setConfirmItem] = useState<TrashedItem | null>(null);

  const restore = useMutation<void, ApiErrorResponse, number>({
    mutationFn: async (id) => { await api.post(`/admin/${resource}/${id}/restore`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); setConfirmItem(null); },
  });

  const items = data ?? [];

  return (
    <>
      <div className="overflow-hidden rounded-2xl border border-gray-200 dark:border-white/10">
        {isLoading ? (
          <div className="divide-y divide-gray-100 dark:divide-white/5">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-5 py-4">
                <div className="h-3.5 w-44 animate-pulse rounded-full bg-gray-200 dark:bg-white/10" />
                <div className="hidden h-3.5 w-32 animate-pulse rounded-full bg-gray-100 dark:bg-white/5 sm:block" />
                <div className="ml-auto h-8 w-24 animate-pulse rounded-xl bg-gray-100 dark:bg-white/5" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
              <TriangleAlert className="h-5 w-5 text-red-500" />
            </div>
            <p className="text-[14px] text-gray-500 dark:text-gray-400">
              Couldn't load deleted {label}.
            </p>
            <button
              onClick={() => refetch()}
              className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-4 py-2 text-sm hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Try again
            </button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="w-10 h-10 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
              <Inbox className="h-5 w-5 text-gray-400 dark:text-gray-600" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-gray-900 dark:text-white">
                No deleted {label}
              </p>
              <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                Deleted items will appear here and can be restored.
              </p>
            </div>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 dark:border-white/5 bg-gray-50 dark:bg-white/[0.02]">
                <th className="px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">
                  Title
                </th>
                <th className="hidden px-5 py-3 text-left text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500 sm:table-cell">
                  Deleted
                </th>
                <th className="w-28 px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-white/5">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className="font-bold text-[14px] text-gray-900 dark:text-white">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-[12px] text-gray-500 dark:text-gray-400 sm:hidden">
                      {formatDate(item.deleted_at)}
                    </span>
                  </td>
                  <td className="hidden px-5 py-3.5 text-[13px] text-gray-500 dark:text-gray-400 sm:table-cell">
                    {formatDate(item.deleted_at)}
                  </td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={() => setConfirmItem(item)}
                        className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all"
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog open={confirmItem !== null} onOpenChange={(open) => !open && setConfirmItem(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Restore this item?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-gray-500 dark:text-gray-400">
              <span className="font-bold text-gray-900 dark:text-white">{confirmItem?.title}</span>{" "}
              will be restored and become visible again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              disabled={restore.isPending}
              className="rounded-xl border-[1.5px] border-gray-200 dark:border-white/20 font-bold"
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmItem && restore.mutate(confirmItem.id)}
              disabled={restore.isPending}
              className="bg-[#1c81ff] text-white font-bold rounded-xl shadow-md shadow-blue-500/20 hover:scale-[1.02] transition-transform"
            >
              {restore.isPending ? "Restoring…" : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function RecycleBinPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
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
          Soft-deleted content. Restore items to make them visible again.
        </p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="tracks">
        <TabsList className="bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
          {(Object.keys(RESOURCE_LABELS) as Resource[]).map((resource) => (
            <TabsTrigger
              key={resource}
              value={resource}
              className="rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400"
            >
              {RESOURCE_LABELS[resource]}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(RESOURCE_LABELS) as Resource[]).map((resource) => (
          <TabsContent key={resource} value={resource} className="mt-6">
            <TrashedTable resource={resource} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
