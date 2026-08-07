import { useGetLesson } from "@/hooks/lessons"
import type { Route } from "./+types/edit";

export default function EditPage({params}: Route.ComponentProps) {

  const {} = useGetLesson(params.lessonSlug);

  return <></>
}