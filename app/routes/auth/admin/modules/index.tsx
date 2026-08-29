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
import { useLocation } from "react-router";

export default function IndexPage({ params }: Route.ComponentProps) {
  const { pathname } = useLocation();
  const basePath = pathname.startsWith("/teacher") ? "/teacher" : "";
  const { tracks, loading: trackLoading, error: trackError } = useGetTracks();
  const track: Track | undefined = tracks.find((track) => track.slug === params.slug);

  const [filters, setFilters] = useState<ModuleFilter>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { modules, pagination, error, loading, refresh } = useGetModulesPaginated({
    ...filters,
    track_id: filters.track_id ?? track?.id.toString(),
    page,
    per_page: perPage,
  });

  const selectedTrackId = track?.id ?? (filters.track_id ? Number(filters.track_id) : undefined);

  if (trackLoading)
    return (
      <>
        <PageHeaderSkeleton />
      </>
    );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modules</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse and manage all modules across learning tracks.
          </p>
        </div>
        {selectedTrackId && <ModalAdd trackId={selectedTrackId} />}
      </div>

      {/* Filters */}
      <div className="space-y-4">
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
      </div>

      <ModulesTable
        data={modules}
        loading={loading}
        error={error}
        onRetry={refresh}
        total={pagination?.total}
        basePath={basePath}
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
            setPage(1);
          }}
          loading={loading}
        />
      )}
    </div>
  );
}
