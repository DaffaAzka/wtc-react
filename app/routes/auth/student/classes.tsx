import { useEffect, useState } from "react";
import { SkeletonCard } from "@/components/skeletons/card";
import StudyClassCard from "@/features/auth/student/study-class-card";
import { api } from "@/lib/axios";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FaUserGraduate, FaBook } from "react-icons/fa";

interface StudyClass {
  id: string | number;
  name: string;
  description: string;
  slug?: string;
  image_url?: string;
  modules_count?: number;
}

export default function StudentClassesPage() {
  const [studyClasses, setStudyClasses] = useState<StudyClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudyClasses() {
      try {
        setLoading(true);
        const response = await api.get("/study-classes");
        const data = Array.isArray(response.data)
          ? response.data
          : response.data.data || [];
        setStudyClasses(data);
      } catch (error) {
        console.error("Error fetching study classes:", error);
        setStudyClasses([]);
      } finally {
        setLoading(false);
      }
    }

    fetchStudyClasses();
  }, []);

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
          alt="Classes Header"
          className="w-full h-auto object-cover"
        />
      </div>

      {/* All Classes Section */}
      {studyClasses.length === 0 ? (
        <Card className="p-12">
          <div className="text-center space-y-4">
            <FaBook className="h-16 w-16 text-muted-foreground mx-auto" />
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">No Classes Available</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                You haven't enrolled in any study classes yet. Explore learning paths to get started!
              </p>
            </div>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold flex items-center gap-2">
                <FaUserGraduate className="h-6 w-6 text-primary" />
                My Study Classes
              </h2>
              <p className="text-sm text-muted-foreground mt-1">
                Continue your learning journey in enrolled classes
              </p>
            </div>

            <Badge variant="secondary" className="text-sm px-3 py-1.5">
              {studyClasses.length} {studyClasses.length === 1 ? "Class" : "Classes"}
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {studyClasses.map((studyClass) => (
              <StudyClassCard data={studyClass} key={studyClass.id} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
