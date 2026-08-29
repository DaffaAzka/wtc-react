import TracksTable from "@/features/auth/tracks/table";
import { useGetTracksPaginated } from "@/hooks/tracks";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

export default function TeacherTracksPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { tracks, pagination, loading, error, refresh } = useGetTracksPaginated({
    page,
    per_page: perPage,
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Tracks</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse all learning tracks in the curriculum.
          </p>
        </div>
      </div>

      <TracksTable
        data={tracks}
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
    </>
  );
}
