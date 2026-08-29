import SelectForm from "@/components/custom/select-form";
import ModulesTable from "@/features/auth/modules/table";
import { useGetModulesPaginated } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { ModuleFilter } from "@/types/filter";
import { useState } from "react";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { Pagination } from "@/components/ui/pagination";

export default function TeacherModulesPage() {
  const { tracks, loading: trackLoading } = useGetTracks();

  const [filters, setFilters] = useState<ModuleFilter>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { modules, pagination, error, loading, refresh } = useGetModulesPaginated({
    ...filters,
    page,
    per_page: perPage,
  });

  if (trackLoading)
    return (
      <>
        <PageHeaderSkeleton />
      </>
    );

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Modules</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse all modules across learning tracks.
          </p>
        </div>
      </div>

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
        basePath="/teacher"
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
