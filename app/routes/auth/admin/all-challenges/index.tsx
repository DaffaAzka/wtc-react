import { useState, useMemo } from "react";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import { TableSkeleton } from "@/components/skeletons/table";
import ErrorState from "@/components/custom/error-state";
import { useGetAllChallengesPaginated } from "@/hooks/challenges";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Pencil } from "lucide-react";
import { Link } from "react-router-dom";

export default function AllChallengesPage() {
  const [searchQuery, setSearchQuery] = useState("");
  // Fetches all pages automatically (backend limits to 100 per page)
  const { challenges, loading, error, refresh } = useGetAllChallengesPaginated();

  // Filter challenges based on search query
  const filteredChallenges = useMemo(() => {
    if (!searchQuery.trim()) return challenges;

    const query = searchQuery.toLowerCase();
    return challenges.filter((challenge) =>
      challenge.title.toLowerCase().includes(query) ||
      challenge.slug.toLowerCase().includes(query) ||
      challenge.type.toLowerCase().includes(query)
    );
  }, [challenges, searchQuery]);

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
        <p className="mt-0.5 text-sm text-muted-foreground">
          Browse and manage all challenges across lessons and modules.
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-4 flex items-center gap-4">
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            placeholder="Search challenges by title, slug, or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-md border border-border bg-transparent py-2 pl-3 pr-3 text-sm outline-none placeholder:text-muted-foreground focus:border-foreground/30"
          />
        </div>
        <div className="text-sm text-muted-foreground">
          {filteredChallenges.length} {filteredChallenges.length === 1 ? "challenge" : "challenges"}
        </div>
      </div>

      {filteredChallenges.length === 0 ? (
        <div className="rounded-md border p-8 text-center">
          <p className="text-sm text-muted-foreground">
            {searchQuery.trim()
              ? `No challenges match "${searchQuery}"`
              : "No challenges found. Challenges can be created from individual lesson or module pages."}
          </p>
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
                <th className="px-4 py-3 text-right text-sm font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredChallenges.map((challenge) => (
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
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/admin/challenges/${challenge.id}`}>
                          <Eye className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        asChild
                      >
                        <Link to={`/admin/challenges/${challenge.id}/edit`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
