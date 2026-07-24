import CourseCard from "@/features/auth/courses/card";
import { useGetTracks } from "@/hooks/tracks";

export default function Courses() {
  const { tracks } = useGetTracks();

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {tracks.map((e) => (
          <CourseCard data={e} />
        ))}
      </div>
    </>
  );
}
