import Header from "@/features/auth/tracks/header";
import TracksTable from "@/features/auth/tracks/table";
import { useGetTracks, useGetTracksPaginated } from "@/hooks/tracks";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

export default function IndexPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { tracks, pagination, loading, error, refresh } = useGetTracksPaginated({
    page,
    per_page: perPage,
  });

  return (
    <>
      <Header count={pagination?.total ?? tracks.length} />
      <TracksTable
        data={tracks}
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