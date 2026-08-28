import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
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
  const {
    tracks,
    loading: tracksLoading,
    error: tracksError,
    refresh: refreshTracks,
  } = useGetTracks();

  const {
    modules,
    loading: modulesLoading,
    error: modulesError,
    refresh: refreshModules,
  } = useGetModules();

  const {
    lessons,
    loading: lessonsLoading,
    error: lessonsError,
    refresh: refreshLessons,
  } = useGetLessons();

  const {
    challenges,
    loading: challengesLoading,
    error: challengesError,
    refresh: refreshChallenges,
  } = useGetChallenges();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Content</h1>
        <p className="mt-0.5 text-sm text-muted-foreground">
          Manage tracks, modules, lessons, and challenges in your curriculum.
        </p>
      </div>

      <Tabs defaultValue="tracks">
        <TabsList variant="line" className="w-full justify-start">
          <TabsTrigger value="tracks">Tracks</TabsTrigger>
          <TabsTrigger value="modules">Modules</TabsTrigger>
          <TabsTrigger value="lessons">Lessons</TabsTrigger>
          <TabsTrigger value="challenges">Challenges</TabsTrigger>
        </TabsList>

        {/* ---------------------------------------------------------------- */}
        {/* Tracks                                                            */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="tracks" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Tracks</h2>
              <p className="text-sm text-muted-foreground">
                Top-level learning paths in your curriculum.
              </p>
            </div>
            <TrackModalAdd />
          </div>

          <TeacherTracksTable
            data={tracks as any}
            loading={tracksLoading}
            error={tracksError}
            onRetry={refreshTracks}
            total={tracks.length}
          />
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Modules                                                           */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="modules" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Modules</h2>
              <p className="text-sm text-muted-foreground">
                Chapters that group lessons inside a track.
              </p>
            </div>
            <TeacherModuleModalAdd />
          </div>

          <TeacherModulesTable
            data={modules as any}
            loading={modulesLoading}
            error={modulesError}
            onRetry={refreshModules}
            total={modules.length}
          />
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Lessons                                                           */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="lessons" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Lessons</h2>
              <p className="text-sm text-muted-foreground">
                Individual learning units inside a module.
              </p>
            </div>
            <TeacherLessonModalAdd />
          </div>

          <TeacherLessonsTable
            data={lessons as any}
            loading={lessonsLoading}
            error={lessonsError}
            onRetry={refreshLessons}
            total={lessons.length}
          />
        </TabsContent>

        {/* ---------------------------------------------------------------- */}
        {/* Challenges                                                        */}
        {/* ---------------------------------------------------------------- */}
        <TabsContent value="challenges" className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Challenges</h2>
              <p className="text-sm text-muted-foreground">
                Assessments attached to lessons or modules.
              </p>
            </div>
            <TeacherChallengeModalAdd />
          </div>

          <TeacherChallengesTable
            data={challenges as any}
            loading={challengesLoading}
            error={challengesError}
            onRetry={refreshChallenges}
            total={challenges.length}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
