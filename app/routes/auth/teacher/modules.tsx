import { useState, useEffect } from "react";
import SelectForm from "@/components/custom/select-form";
import ModulesTable from "@/features/auth/modules/table";
import { useGetModulesPaginated } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { ModuleFilter } from "@/types/filter";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { Pagination } from "@/components/ui/pagination";

export default function TeacherModulesPage() {
  const { tracks, loading: trackLoading } = useGetTracks();
  const [filters, setFilters] = useState<ModuleFilter>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [mounted, setMounted] = useState(false);

  const { modules, pagination, error, loading, refresh } = useGetModulesPaginated({ ...filters, page, per_page: perPage });

  useEffect(() => {
    if (!trackLoading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [trackLoading]);

  if (trackLoading) return <PageHeaderSkeleton />;

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Content</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Modules
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Browse all modules across learning tracks.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5">
        <SelectForm
          name="track"
          text="Filter by Track"
          items={tracks.map((t) => ({ id: t.id, name: t.title }))}
          handleChange={(value) => setFilters((prev) => ({ ...prev, track_id: value === "all" ? undefined : value }))}
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
          onPerPageChange={(v) => { setPerPage(v); setPage(1); }}
          loading={loading}
        />
      )}
    </div>
  );
}
