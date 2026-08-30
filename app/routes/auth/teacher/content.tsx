import { useEffect, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useGetTracks } from "@/hooks/tracks";
import { useGetModules } from "@/hooks/modules";
import { useGetLessons } from "@/hooks/lessons";
import { useGetChallenges } from "@/hooks/challenges";
import TrackModalAdd from "@/features/auth/tracks/modal-add";
import TeacherModuleModalAdd from "@/features/auth/teacher/module-modal-add";
import TeacherLessonModalAdd from "@/features/auth/teacher/lesson-modal-add";
import TeacherChallengeModalAdd from "@/features/auth/teacher/challenge-modal-add";
import TeacherTracksTable from "@/features/auth/teacher/tracks-table";
import TeacherModulesTable from "@/features/auth/teacher/modules-table";
import TeacherLessonsTable from "@/features/auth/teacher/lessons-table";
import TeacherChallengesTable from "@/features/auth/teacher/challenges-table";

export default function TeacherContentPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 60); return () => clearTimeout(t); }, []);

  const { tracks, loading: tracksLoading, error: tracksError, refresh: refreshTracks } = useGetTracks();
  const { modules, loading: modulesLoading, error: modulesError, refresh: refreshModules } = useGetModules();
  const { lessons, loading: lessonsLoading, error: lessonsError, refresh: refreshLessons } = useGetLessons();
  const { challenges, loading: challengesLoading, error: challengesError, refresh: refreshChallenges } = useGetChallenges();

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Teacher</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Content
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Manage tracks, modules, lessons, and challenges in your curriculum.
        </p>
      </div>

      <Tabs defaultValue="tracks">
        <TabsList className="bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
          {["tracks", "modules", "lessons", "challenges"].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className="rounded-lg text-[13px] font-bold capitalize data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400"
            >
              {tab}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* ── Tracks ── */}
        <TabsContent value="tracks" className="mt-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>Tracks</h2>
              <p className="text-[14px] text-gray-500 dark:text-gray-400">Top-level learning paths in your curriculum.</p>
            </div>
            <TrackModalAdd />
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
            <TeacherTracksTable data={tracks as any} loading={tracksLoading} error={tracksError} onRetry={refreshTracks} total={tracks.length} />
          </div>
        </TabsContent>

        {/* ── Modules ── */}
        <TabsContent value="modules" className="mt-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>Modules</h2>
              <p className="text-[14px] text-gray-500 dark:text-gray-400">Chapters that group lessons inside a track.</p>
            </div>
            <TeacherModuleModalAdd />
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
            <TeacherModulesTable data={modules as any} loading={modulesLoading} error={modulesError} onRetry={refreshModules} total={modules.length} />
          </div>
        </TabsContent>

        {/* ── Lessons ── */}
        <TabsContent value="lessons" className="mt-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>Lessons</h2>
              <p className="text-[14px] text-gray-500 dark:text-gray-400">Individual learning units inside a module.</p>
            </div>
            <TeacherLessonModalAdd />
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
            <TeacherLessonsTable data={lessons as any} loading={lessonsLoading} error={lessonsError} onRetry={refreshLessons} total={lessons.length} />
          </div>
        </TabsContent>

        {/* ── Challenges ── */}
        <TabsContent value="challenges" className="mt-6 space-y-5">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>Challenges</h2>
              <p className="text-[14px] text-gray-500 dark:text-gray-400">Assessments attached to lessons or modules.</p>
            </div>
            <TeacherChallengeModalAdd />
          </div>
          <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
            <TeacherChallengesTable data={challenges as any} loading={challengesLoading} error={challengesError} onRetry={refreshChallenges} total={challenges.length} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
