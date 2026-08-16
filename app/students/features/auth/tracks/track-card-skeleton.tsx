import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TrackCardSkeleton() {
  return (
    <Card className="overflow-hidden">
      {/* Image Skeleton */}
      <Skeleton className="aspect-video w-full" />

      <CardContent className="p-4">
        {/* Title Skeleton */}
        <Skeleton className="h-6 w-3/4 mb-2" />

        {/* Meta Info Skeleton */}
        <div className="flex items-center gap-2 mb-3">
          <Skeleton className="h-5 w-20" />
        </div>

        {/* Description Skeleton */}
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      </CardContent>

      <CardFooter className="p-4 pt-0">
        <Skeleton className="h-10 w-full" />
      </CardFooter>
    </Card>
  );
}