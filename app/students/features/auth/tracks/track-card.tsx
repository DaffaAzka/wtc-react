import { Link } from "react-router";
import type { Track } from "@/types/model";
import { BookOpen, ArrowRight, CheckCircle2 } from "lucide-react";
import { getPatternBackground } from "@/lib/utils";

interface TrackCardProps {
  track: Track;
  isEnrolled?: boolean;
}

export function TrackCard({ track, isEnrolled = false }: TrackCardProps) {
  return (
    <Link to={`/student/tracks/${track.slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div
          className="relative h-44 w-full overflow-hidden"
          style={{ background: getPatternBackground(track.title) }}
        >
          {track.image_url && (
            <img
              src={track.image_url}
              alt={track.title}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => { e.currentTarget.style.display = "none"; }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />

          {/* Enrolled badge */}
          {isEnrolled && (
            <div className="absolute top-3 right-3">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#00E676]/90 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white">
                <CheckCircle2 className="h-3 w-3" />
                Sedang Dipelajari
              </span>
            </div>
          )}

          {/* Bottom meta */}
          {track.modules_count !== null && track.modules_count !== undefined && (
            <div className="absolute bottom-3 left-4">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white">
                <BookOpen className="h-3 w-3" />
                {track.modules_count} Modul
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 space-y-3">
          <h3
            className="font-extrabold text-[15px] text-gray-900 dark:text-white group-hover:text-[#1c81ff] transition-colors line-clamp-2 leading-snug"
            style={{ letterSpacing: "-0.01em" }}
          >
            {track.title}
          </h3>

          {track.description && (
            <p className="text-[13px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
              {track.description}
            </p>
          )}

          <div className="flex items-center justify-between pt-2 border-t border-gray-100 dark:border-white/5">
            <span className="text-[12px] font-bold text-gray-400 dark:text-gray-600">
              {isEnrolled ? "Lanjutkan belajar" : "Mulai sekarang"}
            </span>
            <div className={`flex items-center gap-1 text-[13px] font-bold transition-colors ${
              isEnrolled ? "text-[#31c7c8]" : "text-[#1c81ff]"
            }`}>
              <ArrowRight className="h-3.5 w-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
