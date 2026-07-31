import { SkeletonCard } from "@/components/skeletons/card";
import CourseCard from "@/features/auth/courses/card";
import { useGetTracks } from "@/hooks/tracks";

export default function IndexPage() {
  const { tracks, loading } = useGetTracks();

  return loading ?
      <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </>
    : <>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {tracks.map((e) => (
            <CourseCard data={e} />
          ))}
        </div>
      </>;
}
