import { Link } from "react-router";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import type { Track } from "@/types/model";
import { ArrowRight } from "lucide-react";
import { getPatternBackground } from "@/lib/utils";

interface TrackCardProps {
  track: Track;
  isEnrolled?: boolean;
}

export function TrackCard({
  track,
  isEnrolled = false,
}: TrackCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
      {/* Track Image */}
      <div
        className="aspect-video w-full overflow-hidden"
        style={{ background: getPatternBackground(track.title) }}
      >
        {track.image_url && (
          <img
            src={track.image_url}
            alt={track.title}
            className="h-full w-full object-cover"
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
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
          {isEnrolled && (
            <Badge variant="default" className="text-xs">
              Sedang Dipelajari
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
        <Button asChild variant={isEnrolled ? "default" : "outline"} className="w-full">
          <Link to={`/student/classes/${track.slug}`}>
            {isEnrolled ? "Lanjutkan Belajar" : "Ambil Kelas"}
            <ArrowRight className="h-4 w-4 ml-2" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  );
}