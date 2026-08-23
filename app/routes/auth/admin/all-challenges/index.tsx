import { useState } from "react";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { TableSkeleton } from "@/components/skeletons/table";
import ErrorState from "@/components/custom/error-state";
import { useGetChallengesPaginated } from "@/hooks/challenges";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";

export default function AllChallengesPage() {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(15);

  const { challenges, pagination, loading, error, refresh } = useGetChallengesPaginated({
    page,
    per_page: perPage,
  });

  if (loading) {
    return (
      <>
        <PageHeaderSkeleton />
        <TableSkeleton />
      </>
    );
  }

  if (error) {
    return (
      <>
        <div className="mb-6">
          <h1 className="text-2xl font-bold">Challenges</h1>
        </div>
        <ErrorState title="Unable to load challenges" message={error.message || "An error occurred while loading challenges."} onRetry={refresh} />
      </>
    );
  }

  return (
    <>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Challenges</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">Browse all challenges across lessons and modules.</p>
      </div>

      {challenges.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-sm text-muted-foreground">No challenges found. Challenges can be created from individual lesson or module pages.</p>
        </div>
      ) : (
        <div className="rounded-md border">
          <table className="w-full">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left text-sm font-medium">Title</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Type</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium sm:table-cell">Difficulty</th>
                <th className="hidden px-4 py-3 text-left text-sm font-medium md:table-cell">Points</th>
                <th className="px-4 py-3 text-left text-sm font-medium">Context</th>
              </tr>
            </thead>
            <tbody>
              {challenges.map((challenge) => (
                <tr key={challenge.id} className="border-b hover:bg-muted/50 group">
                  <td className="px-4 py-3">
                    <div className="font-medium">{challenge.title}</div>
                    <div className="mt-0.5 text-xs text-muted-foreground">
                      <span className="rounded bg-muted px-1.5 py-0.5 font-mono">/{challenge.slug}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className="text-xs">
                      {challenge.type.replace(/_/g, " ")}
                    </Badge>
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground sm:table-cell">
                    {challenge.difficulty ? (
                      <Badge variant={challenge.difficulty === "easy" ? "default" : challenge.difficulty === "medium" ? "secondary" : "destructive"} className="text-xs">
                        {challenge.difficulty}
                      </Badge>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="hidden px-4 py-3 text-sm text-muted-foreground md:table-cell">{challenge.points ?? challenge.max_score ?? "—"}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">
                    {challenge.lesson_id ? <span>Lesson #{challenge.lesson_id}</span> : challenge.module_id ? <span>Module #{challenge.module_id}</span> : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

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
