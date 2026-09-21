import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useGetStudyClasses, useGetMyClass } from "@/hooks/study-classes";
import { getPatternBackground } from "@/lib/utils";
import { BookOpen, GraduationCap, Sparkles, Check, ArrowRight, Layers } from "lucide-react";
import { SkeletonCard } from "@/components/skeletons/card";

export default function AllClassesPage() {
  const { studyClasses, loading } = useGetStudyClasses({ active_only: true, with_tracks: true });
  const { myClass } = useGetMyClass();
  const [mounted, setMounted] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 animate-pulse rounded-full" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <SkeletonCard /><SkeletonCard /><SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Student</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Semua Kelas
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Pilih kelas yang ingin kamu ikuti.
          </p>
        </div>
        {studyClasses.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 bg-[#1c81ff]/10 rounded-2xl px-4 py-2.5 mt-1">
            <Sparkles className="h-4 w-4 text-[#1c81ff]" />
            <span className="font-extrabold text-[#1c81ff]">{studyClasses.length}</span>
            <span className="text-[12px] font-bold text-[#1c81ff]/70">Kelas</span>
          </div>
        )}
      </div>

      {/* Content */}
      {studyClasses.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <GraduationCap className="h-7 w-7 text-gray-400 dark:text-gray-600" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white">Belum ada kelas tersedia</p>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Kelas akan muncul di sini setelah admin menambahkannya.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studyClasses.map((studyClass) => {
            const isMyClass  = myClass?.id === studyClass.id;
            const trackCount = studyClass.tracks?.length ?? 0;
            const tracks     = studyClass.tracks ?? [];

            return (
              <div
                key={studyClass.id}
                onClick={() => navigate(`/student/classes/${studyClass.id}`)}
                className={`group relative cursor-pointer rounded-2xl bg-white border dark:bg-[#0b1215] shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col ${
                  isMyClass
                    ? "border-[#31c7c8]/40 dark:border-[#31c7c8]/30 ring-1 ring-[#31c7c8]/20"
                    : "border-gray-200 dark:border-white/10"
                }`}
              >
                {/* Cover */}
                <div className="relative h-40 overflow-hidden shrink-0" style={{ background: getPatternBackground(studyClass.name) }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                  {/* Active badge */}
                  {isMyClass && (
                    <div className="absolute top-3 left-3 flex items-center gap-1.5 rounded-full bg-[#31c7c8] px-2.5 py-1 text-[11px] font-bold text-white shadow">
                      <Check className="h-3 w-3" /> Kelas Saya
                    </div>
                  )}

                  {/* Track count */}
                  <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2.5 py-1 text-[11px] font-bold text-white">
                    <Layers className="h-3 w-3" />
                    {trackCount} track
                  </div>

                  {/* Title */}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-extrabold text-lg line-clamp-1 drop-shadow-lg" style={{ letterSpacing: "-0.01em" }}>
                      {studyClass.name}
                    </p>
                    {(studyClass.academic_year || studyClass.semester) && (
                      <p className="text-white/60 text-[12px] mt-0.5">
                        {[studyClass.academic_year, studyClass.semester ? `Semester ${studyClass.semester}` : null].filter(Boolean).join(" · ")}
                      </p>
                    )}
                  </div>
                </div>

                {/* Body */}
                <div className="flex flex-col flex-1 p-5 space-y-4">
                  {studyClass.description && (
                    <p className="text-[14px] leading-relaxed text-gray-500 dark:text-gray-400 line-clamp-2">
                      {studyClass.description}
                    </p>
                  )}

                  {/* Track preview */}
                  <div className="flex-1 space-y-1.5">
                    {trackCount === 0 ? (
                      <p className="text-[13px] text-gray-400 dark:text-gray-600 italic">Belum ada track</p>
                    ) : (
                      <>
                        {tracks.slice(0, 3).map((track) => (
                          <div key={track.id} className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                            <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#1c81ff]" />
                            <span className="truncate">{track.title}</span>
                          </div>
                        ))}
                        {trackCount > 3 && (
                          <p className="text-[12px] text-gray-400 dark:text-gray-600 pl-5.5 flex items-center gap-1">
                            <span>+{trackCount - 3} track lainnya</span>
                          </p>
                        )}
                      </>
                    )}
                  </div>

                  {/* CTA */}
                  <div className="border-t border-gray-100 dark:border-white/5 pt-3">
                    {isMyClass ? (
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-[13px] font-bold text-[#31c7c8]">
                          <Check className="h-4 w-4" />
                          Sudah Bergabung
                        </div>
                        <a
                          href="/student/my-class"
                          onClick={(e) => e.stopPropagation()}
                          className="flex items-center gap-1 text-[12px] font-bold text-[#1c81ff] hover:underline"
                        >
                          Lihat <ArrowRight className="h-3 w-3" />
                        </a>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between text-[13px] font-bold text-gray-400 dark:text-gray-600">
                        <span>Lihat Detail</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
