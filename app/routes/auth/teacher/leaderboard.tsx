import LeaderboardTable from "@/features/auth/teacher/leaderboard-table";
import { useEffect, useState } from "react";

export default function TeacherLeaderboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Teacher</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Leaderboard
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Student rankings by points across all classes and periods.
        </p>
      </div>

      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6">
        <LeaderboardTable />
      </div>
    </div>
  );
}
