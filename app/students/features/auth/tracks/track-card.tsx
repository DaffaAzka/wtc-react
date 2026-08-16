import { useState } from "react";
import { Link } from "react-router";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Track } from "@/types/model";
import { BookOpen } from "lucide-react";

interface TrackCardProps {
  track: Track;
  variant?: "catalog" | "enrolled";
  onEnroll?: (trackId: number) => void;
  enrolling?: boolean;
}

export function TrackCard({ 
  track, 
  variant = "catalog",
  onEnroll,
  enrolling = false 
}: TrackCardProps) {
  const [isEnrolled, setIsEnrolled] = useState(variant === "enrolled");

  const handleEnroll = async () => {
    if (onEnroll) {
      await onEnroll(track.id);
      setIsEnrolled(true);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Track Image */}
      <div className="aspect-video w-full overflow-hidden bg-muted">
        {track.image_url ? (
          <img
            src={track.image_url}
            alt={track.title}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5">
            <BookOpen className="h-16 w-16 text-muted-foreground/20" />
          </div>
        )}
      </div>

      <CardContent className="p-4">
        {/* Title */}
        <h3 className="text-lg font-semibold line-clamp-2 mb-2">
          {track.title}
        </h3>

        {/* Meta Info */}
        <div className="flex items-center gap-2 mb-3">
          {track.modules_count !== null && track.modules_count !== undefined && (
            <Badge variant="secondary" className="text-xs">
              {track.modules_count} Modul
            </Badge>
          )}
        </div>

        {/* Description */}
        {track.description && (
          <p className="text-sm text-muted-foreground line-clamp-3">
            {track.description}
          </p>
        )}
      </CardContent>

      <CardFooter className="p-4 pt-0">
        {isEnrolled ? (
          <Button asChild className="w-full" variant="outline">
            <Link to={`/student/classes/${track.slug}`}>
              Lanjutkan Belajar
            </Link>
          </Button>
        ) : (
          <Button 
            onClick={handleEnroll} 
            className="w-full"
            disabled={enrolling}
          >
            {enrolling ? "Mendaftar..." : "Ambil Kelas"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}