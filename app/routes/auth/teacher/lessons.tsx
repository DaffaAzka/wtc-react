import { useState, useEffect } from "react";
import SelectForm from "@/components/custom/select-form";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import LessonsTable from "@/features/auth/lessons/table";
import { useGetLessonsPaginated } from "@/hooks/lessons";
import { useGetModules } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { LessonFilter } from "@/types/filter";
import ModalAdd from "@/features/auth/lessons/modal-add";

export default function TeacherLessonsPage() {
  const { tracks, loading: trackLoading } = useGetTracks();
  const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>();
  const [filters, setFilters] = useState<LessonFilter>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [mounted, setMounted] = useState(false);

  const { modules, loading: modulesLoading } = useGetModules(
    selectedTrackId ? { track_id: selectedTrackId } : undefined,
  );
  const { lessons, pagination, loading, error, refresh } = useGetLessonsPaginated({ ...filters, page, per_page: perPage });

  useEffect(() => {
    if (!trackLoading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [trackLoading]);

  if (trackLoading) return <PageHeaderSkeleton />;

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Content</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Lessons
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Browse all lessons across modules.
          </p>
        </div>
        <div className="shrink-0 mt-1">
          <ModalAdd />
        </div>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5">
        <div className="flex flex-wrap gap-3">
          <SelectForm
            name="track"
            text="Filter by Track"
            items={tracks.map((t) => ({ id: t.id, name: t.title }))}
            handleChange={(value) => { setSelectedTrackId(value === "all" ? undefined : value); setFilters({}); }}
            value={selectedTrackId ?? "all"}
            withAll
          />
          {selectedTrackId && (
            <SelectForm
              name="module"
              text="Filter by Module"
              items={modules.map((m) => ({ id: m.id, name: m.title }))}
              handleChange={(value) => setFilters({ module_id: value === "all" ? undefined : value })}
              value={filters.module_id ?? "all"}
              isDisabled={modulesLoading}
              withAll
            />
          )}
        </div>
      </div>

      <LessonsTable data={lessons} loading={loading} error={error} onRetry={refresh} total={pagination?.total} basePath="/teacher" />

      {pagination && (
        <Pagination
          currentPage={pagination.current_page}
          lastPage={pagination.last_page}
          total={pagination.total}
          from={pagination.from}
          to={pagination.to}
          perPage={perPage}
          onPageChange={setPage}
          onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
          loading={loading}
        />
      )}
    </div>
  );
}
