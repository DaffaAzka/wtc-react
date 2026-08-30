import { useParams } from "react-router";
import TrackDetail from "@/features/auth/student-progress/track-detail";

export default function AdminTrackProgressPage() {
  const { slug } = useParams<{ slug: string }>();
  return (
    <TrackDetail
      slug={slug!}
      backTo="/student-progress"
    />
  );
}
