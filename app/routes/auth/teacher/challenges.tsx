import ChallengesTable from "@/features/auth/teacher/challenges-table";

export default function TeacherChallengesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Challenges</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage challenges.
        </p>
      </div>
      <ChallengesTable />
    </div>
  );
}
