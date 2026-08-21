import SelectForm from "@/components/custom/select-form";
import ModulesTable from "@/features/auth/modules/table";
import { useGetModules, useGetModulesPaginated } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { ModuleFilter } from "@/types/filter";
import { useState } from "react";
import type { Route } from "./+types";
import ModalAdd from "@/features/auth/modules/modal-add";
import type { Track } from "@/types/model";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { Pagination } from "@/components/ui/pagination";

export default function IndexPage({ params }: Route.ComponentProps) {
  const { tracks, loading: trackLoading, error: trackError } = useGetTracks();
  const track: Track | undefined = tracks.find(
    (track) => track.slug === params.slug,
  );

  const [filters, setFilters] = useState<ModuleFilter>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { modules, pagination, error, loading, refresh } = useGetModulesPaginated({
    ...filters,
    track_id: filters.track_id ?? track?.id.toString(),
    page,
    per_page: perPage,
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

      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(newPerPage) => {
            setPerPage(newPerPage);
            setPage(1); // Reset to page 1 when changing per_page
          }}
          loading={loading}
        />
      )}
    </>
  );
}
