import SelectForm from "@/components/custom/select-form";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { TableSkeleton } from "@/components/skeletons/table";
import Header from "@/features/auth/lessons/header";
import LessonsTable from "@/features/auth/lessons/table";
import { useGetLessons } from "@/hooks/lessons";
import { useGetModule, useGetModules } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { LessonFilter } from "@/types/filter";
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import type { Route } from "./+types/index";

export default function LessonsPage({ params }: Route.ComponentProps) {
  const slug = (params as { slug?: string }).slug;

  return slug ? (
    <ModuleScopedLessons slug={slug} />
  ) : (
    <StandaloneLessons />
  );
}

// ----- Module-scoped view (/:slug/lessons) -----
function ModuleScopedLessons({ slug }: { slug: string }) {
  const { module, loading, error } = useGetModule(slug);
  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    refresh,
  } = useGetLessons(
    module ? { module_id: module.id.toString() } : undefined,
  );

  if (loading)
    return (
      <>
        <PageHeaderSkeleton />
        <TableSkeleton />
      </>
    );
  if (error) return <p>Error: {error.message}</p>;
  if (!module) return <p>Module not found.</p>;

  return (
    <>
      <Header module={module} />
      <LessonsTable
        data={lessons}
        loading={lessonsLoading}
        error={lessonsError}
        onRetry={refresh}
      />
    </>
  );
}

// ----- Standalone view (/lessons) with Track → Module filters -----
function StandaloneLessons() {
  const { tracks, loading: trackLoading } = useGetTracks();

  const [selectedTrackId, setSelectedTrackId] = useState<string | undefined>(
    undefined,
  );
  const [filters, setFilters] = useState<LessonFilter>({});

  const { modules, loading: modulesLoading } = useGetModules(
    selectedTrackId ? { track_id: selectedTrackId } : undefined,
  );

  const { lessons, loading, error, refresh } = useGetLessons(filters);

  const selectedModule = modules.find(
    (m) => m.id.toString() === filters.module_id,
  );

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
            Browse and manage all lessons across modules.
          </p>
        </div>
        {selectedModule && (
          <Link to={`/${selectedModule.slug}/lessons/create`}>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Lesson
            </Button>
          </Link>
        )}
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
      />
    </>
  );
}
