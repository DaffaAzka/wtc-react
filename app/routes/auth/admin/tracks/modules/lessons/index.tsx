import { useGetModule } from "@/hooks/modules";
import type { Route } from "./+types/index";
import Header from "@/features/auth/lessons/header";
import LessonsTable from "@/features/auth/lessons/table";
import { useGetLessonsByModule } from "@/hooks/lessons";

export default function IndexPage({ params }: Route.ComponentProps) {
  const { module, loading, error } = useGetModule(params.moduleSlug);
  const { lessons } = useGetLessonsByModule(params.moduleSlug);

  if (loading) return <p>Loading module...</p>;
  if (error) return <p>Error: {error.message}</p>;
  if (!module) return <p>Module not found.</p>;

  return (
    <>
      <Header module={module} />
      <LessonsTable data={lessons} />
    </>
  );
}
