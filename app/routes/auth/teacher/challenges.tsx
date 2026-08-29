import ChallengesTable from "@/features/auth/teacher/challenges-table";
import { useGetChallengesPaginated } from "@/hooks/challenges";
import { Pagination } from "@/components/ui/pagination";
import { useState } from "react";

export default function TeacherChallengesPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { challenges, pagination, loading, error, refresh } = useGetChallengesPaginated({
    page,
    per_page: perPage,
  });

  return (
    <>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Challenges</h1>
          <p className="mt-0.5 text-sm text-muted-foreground">
            Browse all challenges across lessons.
          </p>
        </div>
      </div>

      <ChallengesTable
        data={challenges}
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
