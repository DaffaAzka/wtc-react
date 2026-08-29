import SelectForm from "@/components/custom/select-form";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { TableSkeleton } from "@/components/skeletons/table";
import Header from "@/features/auth/lessons/header";
import LessonsTable from "@/features/auth/lessons/table";
import { useGetLessons, useGetLessonsPaginated } from "@/hooks/lessons";
import { useGetModule, useGetModules } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { LessonFilter } from "@/types/filter";
import { useState } from "react";
import { Link, useLocation } from "react-router";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import { Plus } from "lucide-react";
import type { Route } from "./+types/index";
import { useEffect } from "react";

export default function LessonsPage({ params }: Route.ComponentProps) {
  const slug = (params as { slug?: string }).slug;
  return slug ? <ModuleScopedLessons slug={slug} /> : <StandaloneLessons />;
}

// ── Module-scoped view (/modules/:slug/lessons) ─────────────────────────────

function ModuleScopedLessons({ slug }: { slug: string }) {
  const { pathname } = useLocation();
  const basePath = pathname.startsWith("/teacher") ? "/teacher" : "";
  const { module, loading, error } = useGetModule(slug);
  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    refresh,
  } = useGetLessons(module ? { module_id: module.id.toString() } : undefined);

  if (loading)
    return (
      <>
        <PageHeaderSkeleton />
        <TableSkeleton />
      </>
    );

  if (error)
    return (
      <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6">
        <p className="text-[15px] text-red-600 dark:text-red-400">
          Error: {error.message}
        </p>
      </div>
    );

  if (!module)
    return (
      <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-10 text-center">
        <p className="text-[15px] text-gray-500 dark:text-gray-400">
          Module not found.
        </p>
      </div>
    );

  return (
    <div className="space-y-8">
      <Header module={module} />
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
        <LessonsTable
          data={lessons}
          loading={lessonsLoading}
          error={lessonsError}
          onRetry={refresh}
        />
      </div>
    </div>
  );
}

// ── Standalone view (/lessons) ──────────────────────────────────────────────

function StandaloneLessons() {
  const { tracks, loading: trackLoading } = useGetTracks();

  const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>();
  const [filters, setFilters] = useState<LessonFilter>({});
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);
  const [mounted, setMounted] = useState(false);

  const { modules, loading: modulesLoading } = useGetModules(
    selectedTrackId ? { track_id: selectedTrackId } : undefined,
  );

  const { lessons, pagination, loading, error, refresh } = useGetLessonsPaginated({
    ...filters,
    page,
    per_page: perPage,
  });

  const selectedModule = modules.find(
    (m) => m.id.toString() === filters.module_id,
  );

  useEffect(() => {
    if (!trackLoading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [trackLoading]);

  if (trackLoading) return <PageHeaderSkeleton />;

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            Content
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Lessons
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Browse and manage all lessons across modules.
          </p>
        </div>
        {selectedModule && (
          <Link to={`${basePath}/${selectedModule.slug}/lessons/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </Link>
        )}
      </div>

      {/* Filters */}
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5">
        <div className="flex flex-wrap gap-3">
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
                setFilters({ module_id: value === "all" ? undefined : value })
              }
              value={filters.module_id ?? "all"}
              isDisabled={modulesLoading}
              withAll
            />
          )}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
        <LessonsTable
          data={lessons}
          loading={loading}
          error={error}
          onRetry={refresh}
          total={pagination?.total}
        />
      </div>

      {/* Pagination */}
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
