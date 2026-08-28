import LeaderboardTable from "@/features/auth/teacher/leaderboard-table";

export default function TeacherLeaderboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Student rankings by points across all classes and periods.
        </p>
      </div>
      <LeaderboardTable />
    </div>
  );
}
