import { SkeletonCard } from "@/components/skeletons/card";
import CourseCard from "@/features/auth/courses/card";
import { useGetTracks } from "@/hooks/tracks";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FaGraduationCap, FaBook, FaArrowRight, FaStar } from "react-icons/fa";
import { Link } from "react-router";

export default function IndexPage() {
  const { tracks, loading } = useGetTracks();

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Featured Skeleton */}
        <div className="h-80 bg-muted animate-pulse rounded-lg" />

        {/* Header Skeleton */}
        <div className="space-y-2">
          <div className="h-6 w-48 bg-muted animate-pulse rounded" />
          <div className="h-4 w-64 bg-muted animate-pulse rounded" />
        </div>

        {/* Grid Skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <SkeletonCard />
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Static Header Banner - Pure image, no overlays */}
      <div className="overflow-hidden rounded-lg border-2">
        <img
          src="/images/course-header.png"
          alt="Courses Header"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* All Courses Section */}
      {tracks.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <FaBook className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No Courses Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                We're working on adding amazing courses for you. Check back soon!
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaGraduationCap className="h-6 w-6 text-primary" />
                All Learning Paths
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Choose your path and start your learning journey
              </p>
            </div>

            <Badge variant="secondary" className="text-sm px-3 py-1.5">
              {tracks.length} {tracks.length === 1 ? "Course" : "Courses"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tracks.map((track) => (
              <CourseCard data={track} key={track.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
