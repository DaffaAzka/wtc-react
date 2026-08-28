import TracksTable from "@/features/auth/teacher/tracks-table";

export default function TeacherTracksPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Tracks</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage learning tracks.
        </p>
      </div>
      <TracksTable />
    </div>
  );
}
