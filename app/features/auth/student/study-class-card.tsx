import { Link } from "react-router";
import { getPatternBackground } from "@/lib/utils";
import { BookOpen, ArrowRight, GraduationCap } from "lucide-react";

interface StudyClass {
  id: string | number;
  name: string;
  description: string;
  slug?: string;
  image_url?: string;
  modules_count?: number;
}

export default function StudyClassCard({ data }: { data: StudyClass }) {
  const slug = data.slug || `${data.id}`;

  return (
    <Link to={`/student/study-classes/${slug}`} className="group block">
      <div className="overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 h-full flex flex-col">
        {/* Image */}
        <div
          className="relative h-48 overflow-hidden"
          style={{ background: getPatternBackground(data.name) }}>
          {data.image_url && (
            <img
              src={data.image_url}
              alt={data.name}
              className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
              }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-4">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#31c7c8]/80 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white mb-2">
              <GraduationCap className="h-3 w-3" />
              Study Class
            </span>
            <h3
              className="text-white font-extrabold text-lg line-clamp-2 drop-shadow-lg"
              style={{ letterSpacing: "-0.01em" }}>
              {data.name}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 p-5 space-y-3">
          <p className="text-[14px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2 flex-1">
            {data.description || "Klik untuk melihat detail kelas ini."}
          </p>

          <div className="flex items-center justify-between border-t border-gray-100 dark:border-white/5 pt-3">
            <div className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400">
              <BookOpen className="h-3.5 w-3.5 text-[#31c7c8]" />
              <span className="font-bold text-gray-900 dark:text-white">
                {data.modules_count || 0}
              </span>
              <span>Modul</span>
            </div>
            <div className="flex items-center gap-1 text-[13px] font-bold text-[#31c7c8] group-hover:gap-2 transition-all">
              <span>Open</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
