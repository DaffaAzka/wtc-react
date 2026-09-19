import ContentView from "@/components/custom/content-view";
import type { Route } from "./+types/view";
import { useGetLesson } from "@/hooks/lessons";
import { Skeleton } from "@/components/ui/skeleton";

export default function ViewPage({ params }: Route.ActionArgs) {
  const { lesson, loading, error } = useGetLesson(params.lessonSlug);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64 rounded-xl" />
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-4 w-5/6 rounded-lg" />
        <Skeleton className="h-4 w-4/6 rounded-lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6">
        <p className="text-[15px] text-red-600 dark:text-red-400">Error: {error.message}</p>
      </div>
    );
  }

  if (!lesson) {
    return (
      <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-10 text-center">
        <p className="text-[15px] text-gray-500 dark:text-gray-400">Lesson not found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Lesson</p>
        <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
          {lesson.title}
        </h1>
      </div>
      <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 md:p-8">
        <ContentView rawJsonData={lesson.content} />
      </div>
    </div>
  );
}
