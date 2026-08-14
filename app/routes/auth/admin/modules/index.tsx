import SelectForm from "@/components/custom/select-form";
import ModulesTable from "@/features/auth/modules/table";
import { useGetModules } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { ModuleFilter } from "@/types/filter";
import { useState } from "react";
import type { Route } from "./+types";
import ModalAdd from "@/features/auth/modules/modal-add";
import type { Track } from "@/types/model";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";

export default function IndexPage({ params }: Route.ComponentProps) {
  const { tracks, loading: trackLoading, error: trackError } = useGetTracks();
  const track: Track | undefined = tracks.find(
    (track) => track.slug === params.slug,
  );

  const [filters, setFilters] = useState<ModuleFilter>({});

  const { modules, error, loading, refresh } = useGetModules({
    ...filters,
    track_id: filters.track_id ?? track?.id.toString(),
  });

  const selectedTrackId =
    track?.id ?? (filters.track_id ? Number(filters.track_id) : undefined);

  if (trackLoading)
    return (
      <>
        <PageHeaderSkeleton />
      </>
    );

  return (
    <>
      <div className="flex gap-2">
        <SelectForm
          name="track"
          text="Filtering by Track"
          items={tracks.map((track) => ({
            id: track.id,
            name: track.title,
          }))}
          handleChange={(value) =>
            setFilters((prev) => ({
              ...prev,
              track_id: value === "all" ? undefined : value,
            }))
          }
          value={filters.track_id ?? "all"}
          withAll
        />

        {selectedTrackId && (
          <div className="flex items-end">
            <ModalAdd trackId={selectedTrackId} />
          </div>
        )}
      </div>

      {/* {track && <Header track={track} />} */}

      <ModulesTable
        data={modules}
        loading={loading}
        error={error}
        onRetry={refresh}
      />
    </>
  );
}
