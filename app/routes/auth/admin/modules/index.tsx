import SelectForm from "@/components/custom/select-form";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { TableSkeleton } from "@/components/skeletons/table";
import ModulesTable from "@/features/auth/modules/table";
import { useGetModules } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import type { ModuleFilter } from "@/types/filter";
import { useState } from "react";

export default function IndexPage() {
  const [filters, setFilters] = useState<ModuleFilter>({});
  const { modules, error, loading, refresh } = useGetModules(filters);
  const { tracks, loading: trackLoading, error: trackError } = useGetTracks();

  if (loading || trackLoading)
    return (
      <>
        <PageHeaderSkeleton />
        <TableSkeleton />
      </>
    );
  if (error || trackError)
    return <p>Error: {(error ?? trackError)!.message}</p>;

  return (
    <>
      <div className="flex flex-col gap-4">
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
      <ModulesTable data={modules} />
    </>
  );
}
