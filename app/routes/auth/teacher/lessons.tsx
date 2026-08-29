import SelectForm from "@/components/custom/select-form";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import LessonsTable from "@/features/auth/lessons/table";
import { useGetLessonsPaginated } from "@/hooks/lessons";
import { useGetModules } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { LessonFilter } from "@/types/filter";
import { useState } from "react";
import { Pagination } from "@/components/ui/pagination";

export default function TeacherLessonsPage() {
  const { tracks, loading: trackLoading } = useGetTracks();

  const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>(undefined);
  const [filters, setFilters] = useState<LessonFilter>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { modules, loading: modulesLoading } = useGetModules(
    selectedTrackId ? { track_id: selectedTrackId } : undefined,
  );

  const { lessons, pagination, loading, error, refresh } = useGetLessonsPaginated({
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
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lessons</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse all lessons across modules.
          </p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <SelectForm
          name="track"
          text="Filter by Track"
          items={tracks.map((t) => ({ id: t.id, name: t.title }))}
          handleChange={(value) => {
            setSelectedTrackId(value === "all" ? undefined : value);
            setFilters({});
          }}
          value={selectedTrackId ?? "all"}
          withAll
        />

        {selectedTrackId && (
          <SelectForm
            name="module"
            text="Filter by Module"
            items={modules.map((m) => ({ id: m.id, name: m.title }))}
            handleChange={(value) =>
              setFilters({
                module_id: value === "all" ? undefined : value,
              })
            }
            value={filters.module_id ?? "all"}
            isDisabled={modulesLoading}
            withAll
          />
        )}
      </div>

      <LessonsTable
        data={lessons}
        loading={loading}
        error={error}
        onRetry={refresh}
        total={pagination?.total}
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
    </>
  );
}
