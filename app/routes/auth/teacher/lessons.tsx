import LessonsTable from "@/features/auth/teacher/lessons-table";

export default function TeacherLessonsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Lessons</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage lessons.
        </p>
      </div>
      <LessonsTable />
    </div>
  );
}
