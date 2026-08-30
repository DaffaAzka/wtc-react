import { useEffect, useState } from "react";
import Header from "@/features/auth/study-classes/header";
import StudyClassesTable from "@/features/auth/study-classes/table";
import { useGetStudyClasses } from "@/hooks/study-classes";

export default function IndexPage() {
  const { studyClasses, loading, error, refresh } = useGetStudyClasses();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            Admin
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            Study Classes
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Manage all study classes and their enrollments.
          </p>
        </div>
        <div className="shrink-0 mt-1">
          <Header count={studyClasses.length} />
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
        <StudyClassesTable
          data={studyClasses}
          loading={loading}
          error={error}
          onRetry={refresh}
        />
      </div>
    </div>
  );
}
