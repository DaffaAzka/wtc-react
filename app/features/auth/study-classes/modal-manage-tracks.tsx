import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { useAssignTrack, useRemoveTrack } from "@/hooks/study-classes";
import { useGetTracks } from "@/hooks/tracks";
import type { StudyClass } from "@/services/study-class";
import { X, Layers, Loader2 } from "lucide-react";

export default function ModalManageTracks({
  data,
  isOpen,
  onOpenChange,
}: {
  data: StudyClass | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { tracks: allTracks, loading: tracksLoading } = useGetTracks();
  const assignTrack = useAssignTrack();
  const removeTrack = useRemoveTrack();
  const [removingId, setRemovingId] = useState<number | null>(null);

  if (!data) return null;

  const assignedIds = new Set((data.tracks ?? []).map((t) => t.id));
  const availableTracks = allTracks.filter((t) => !assignedIds.has(t.id));

  const handleAssign = (trackId: string) => {
    assignTrack.mutate({ studyClassId: data.id, trackId: Number(trackId) });
  };

  const handleRemove = (trackId: number) => {
    setRemovingId(trackId);
    removeTrack.mutate(
      { studyClassId: data.id, trackId },
      { onSettled: () => setRemovingId(null) }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Tracks</DialogTitle>
          <DialogDescription>
            Assign or remove tracks for <strong>{data.name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 pt-2">
          {/* Assigned tracks */}
          <div className="space-y-2">
            <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600">
              Assigned Tracks ({(data.tracks ?? []).length})
            </p>
            {tracksLoading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full rounded-xl" />)}
              </div>
            ) : (data.tracks ?? []).length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 py-6 text-center">
                <Layers className="h-6 w-6 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-[13px] text-gray-400 dark:text-gray-600">No tracks assigned yet</p>
              </div>
            ) : (
              <div className="space-y-2">
                {(data.tracks ?? []).map((track) => (
                  <div key={track.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl border border-gray-100 dark:border-white/10 bg-gray-50 dark:bg-white/[0.02]">
                    <div className="flex items-center gap-2 min-w-0">
                      <Layers className="h-3.5 w-3.5 shrink-0 text-[#1c81ff]" />
                      <span className="text-[14px] font-medium text-gray-900 dark:text-white truncate">{track.title}</span>
                      {!track.is_active && (
                        <Badge variant="outline" className="text-[10px] text-gray-400 shrink-0">inactive</Badge>
                      )}
                    </div>
                    <button
                      onClick={() => handleRemove(track.id)}
                      disabled={removingId === track.id}
                      className="flex items-center gap-1 text-[12px] font-bold text-gray-400 hover:text-red-500 transition-colors ml-2 shrink-0"
                    >
                      {removingId === track.id
                        ? <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        : <X className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Add track */}
          {availableTracks.length > 0 && (
            <div className="space-y-2">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600">
                Add Track
              </p>
              <Select
                onValueChange={handleAssign}
                disabled={assignTrack.isPending}
                value=""
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={assignTrack.isPending ? "Adding..." : "Select a track to add..."} />
                </SelectTrigger>
                <SelectContent>
                  {availableTracks.map((track) => (
                    <SelectItem key={track.id} value={String(track.id)}>
                      <div className="flex items-center gap-2">
                        <span>{track.title}</span>
                        {!track.is_active && (
                          <Badge variant="outline" className="text-[10px] text-gray-400">inactive</Badge>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
