import ContentView from "@/components/custom/content-view";
import type { Route } from "./+types/view";
import { useGetLesson } from "@/hooks/lessons";

export default function ViewPage({ params }: Route.ActionArgs) {
  const { lesson, loading, error } = useGetLesson(params.lessonSlug);

  if (loading) return <p>Loading lesson...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!lesson) return <p>Lesson not found.</p>;
  return (
    <>
      <ContentView rawJsonData={lesson.content} />
    </>
  );
}
