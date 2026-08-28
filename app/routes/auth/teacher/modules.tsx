import ModulesTable from "@/features/auth/teacher/modules-table";

export default function TeacherModulesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Modules</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Manage learning modules.
        </p>
      </div>
      <ModulesTable />
    </div>
  );
}
