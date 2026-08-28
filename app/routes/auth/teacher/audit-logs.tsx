import AuditLogTable from "@/features/auth/teacher/audit-log-table";

export default function TeacherAuditLogsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Audit Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          History of all create, update, and delete actions performed in the system.
        </p>
      </div>
      <AuditLogTable />
    </div>
  );
}
