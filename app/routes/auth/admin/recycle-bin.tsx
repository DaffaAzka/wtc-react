import { useState } from "react";
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
import { Button } from "@/components/ui/button";
import { Inbox, RefreshCw, RotateCcw, TriangleAlert } from "lucide-react";
import type { ApiErrorResponse, ApiResponse } from "@/types/response";

type TrashedItem = {
  id: number;
  title: string;
  deleted_at: string;
};

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
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
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

function TrashedTable({ resource }: { resource: Resource }) {
  const queryClient = useQueryClient();
  const queryKey = ["admin", resource, "trashed"];
  const label = RESOURCE_LABELS[resource].toLowerCase();

  const { data, isLoading, error, refetch } = useQuery<
    TrashedItem[],
    ApiErrorResponse
  >({
    queryKey,
    queryFn: async () => {
      const res = await api.get<ApiResponse<TrashedItem[]>>(
        `/admin/${resource}/trashed`,
      );
      return res.data.data ?? [];
    },
  });

  const [confirmItem, setConfirmItem] = useState<TrashedItem | null>(null);

  const restore = useMutation<void, ApiErrorResponse, number>({
    mutationFn: async (id) => {
      await api.post(`/admin/${resource}/${id}/restore`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      setConfirmItem(null);
    },
  });

  const items = data ?? [];

  return (
    <>
      <div className="overflow-hidden rounded-md border border-border">
        {isLoading ? (
          <div className="divide-y divide-border">
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 px-4 py-3">
                <div className="h-3.5 w-40 animate-pulse rounded bg-muted" />
                <div className="hidden h-3.5 w-32 animate-pulse rounded bg-muted sm:block" />
                <div className="ml-auto h-7 w-20 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : error ? (
          <EmptyState
            icon={TriangleAlert}
            title={`Couldn't load deleted ${label}`}
            description="Something went wrong while fetching deleted items."
            action={
              <Button variant="outline" size="sm" onClick={() => refetch()}>
                <RefreshCw className="h-3.5 w-3.5" />
                Try again
              </Button>
            }
          />
        ) : items.length === 0 ? (
          <EmptyState
            icon={Inbox}
            title={`No deleted ${label}`}
            description="Deleted items will appear here and can be restored."
          />
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-left text-xs text-muted-foreground">
                <th className="px-4 py-2 font-medium">Title</th>
                <th className="hidden px-4 py-2 font-medium sm:table-cell">
                  Deleted
                </th>
                <th className="w-28 px-4 py-2" />
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {items.map((item) => (
                <tr key={item.id} className="group hover:bg-muted/40">
                  <td className="px-4 py-3">
                    <span className="font-medium text-foreground">
                      {item.title}
                    </span>
                    <span className="mt-0.5 block text-xs text-muted-foreground sm:hidden">
                      {formatDate(item.deleted_at)}
                    </span>
                  </td>
                  <td className="hidden px-4 py-3 text-xs text-muted-foreground sm:table-cell">
                    {formatDate(item.deleted_at)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end opacity-0 transition-opacity group-hover:opacity-100">
                      <Button
                        variant="outline"
                        size="sm"
                        className="h-7 gap-1.5 text-xs"
                        onClick={() => setConfirmItem(item)}
                      >
                        <RotateCcw className="h-3.5 w-3.5" />
                        Restore
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AlertDialog
        open={confirmItem !== null}
        onOpenChange={(open) => !open && setConfirmItem(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this item?</AlertDialogTitle>
            <AlertDialogDescription>
              <span className="font-medium text-foreground">
                {confirmItem?.title}
              </span>{" "}
              will be restored and become visible again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={restore.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => confirmItem && restore.mutate(confirmItem.id)}
              disabled={restore.isPending}
            >
              {restore.isPending ? "Restoring..." : "Restore"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function RecycleBinPage() {
  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Recycle Bin</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Soft-deleted content. Restore items to make them visible again.
          </p>
        </div>
      </div>

      <Tabs defaultValue="tracks" className="mt-6">
        <TabsList>
          {(Object.keys(RESOURCE_LABELS) as Resource[]).map((resource) => (
            <TabsTrigger key={resource} value={resource}>
              {RESOURCE_LABELS[resource]}
            </TabsTrigger>
          ))}
        </TabsList>
        {(Object.keys(RESOURCE_LABELS) as Resource[]).map((resource) => (
          <TabsContent key={resource} value={resource} className="mt-4">
            <TrashedTable resource={resource} />
          </TabsContent>
        ))}
      </Tabs>
    </>
  );
}
