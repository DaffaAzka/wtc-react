import { useParams } from "react-router";
import TrackDetail from "@/features/auth/student-progress/track-detail";

export default function TeacherTrackProgressPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <TrackDetail
      slug={slug!}
      backTo="/teacher/student-progress"
    />
  );
}
