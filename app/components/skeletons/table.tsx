import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function TableSkeleton() {
  return (
    <Card>
      <CardContent>
        <div className="w-full">
          <div className="flex items-center border-b h-12 px-4">
            <div className="flex gap-8 w-full">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-4 w-20" />
              <Skeleton className="h-4 w-28" />
            </div>
          </div>
          
          {[...Array(5)].map((_, i) => (
            <div key={i} className="flex items-center border-b h-16 px-4">
              <div className="flex gap-8 w-full">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-28" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
