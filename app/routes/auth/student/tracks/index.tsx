import { useGetTracks } from "@/hooks/tracks";
import { useMyTracks } from "@/students/hooks/enrollments";
import { TrackCard } from "@/students/features/auth/tracks/track-card";
import { TrackCardSkeleton } from "@/students/features/auth/tracks/track-card-skeleton";
import { BookOpen, GraduationCap, Sparkles } from "lucide-react";
import { useEffect, useState } from "react";

export default function TracksIndex() {
  const { tracks, loading: tracksLoading, error: tracksError } = useGetTracks();
  const { myTracks, loading: myTracksLoading } = useMyTracks();
  const [mounted, setMounted] = useState(false);

  const loading = tracksLoading || myTracksLoading;

  const isTrackEnrolled = (trackSlug: string): boolean =>
    myTracks.some((mt) => mt.slug === trackSlug);

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
          <div className="h-10 w-72 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />
          <div className="h-4 w-52 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          <TrackCardSkeleton />
          <TrackCardSkeleton />
          <TrackCardSkeleton />
        </div>
      </div>
    );
  }

  if (tracksError) {
    return (
      <div className="space-y-6">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            Student
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
            style={{ letterSpacing: "-0.02em" }}>
            Learning Paths
          </h1>
        </div>
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-14 flex flex-col items-center gap-3 text-center">
          <div className="w-14 h-14 rounded-full bg-red-100 dark:bg-red-500/10 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-red-400" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white">
              Gagal Memuat Data
            </p>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              {tracksError.message ||
                "Terjadi kesalahan saat memuat katalog kelas."}
            </p>
          </div>
          <button
            onClick={() => window.location.reload()}
            className="bg-transparent border-[1.5px] border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-xl px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-500/5 transition-all">
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            Student
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}>
            Learning Paths
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Pilih jalur belajar dan mulai perjalananmu.
          </p>
        </div>
        {tracks.length > 0 && (
          <div className="hidden lg:flex items-center gap-2 bg-[#1c81ff]/10 rounded-2xl px-4 py-2.5 mt-1">
            <Sparkles className="h-4 w-4 text-[#1c81ff]" />
            <span className="font-extrabold text-[#1c81ff]">
              {tracks.length}
            </span>
            <span className="text-[12px] font-bold text-[#1c81ff]/70">
              {tracks.length === 1 ? "Course" : "Courses"}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {tracks.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
            <GraduationCap className="h-7 w-7 text-[#1c81ff]" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white">
              Belum Ada Kelas Tersedia
            </p>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1 max-w-sm">
              Saat ini belum ada learning path yang tersedia. Silakan kembali
              lagi nanti.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {tracks.map((track) => (
            <TrackCard
              key={track.id}
              track={track}
              isEnrolled={isTrackEnrolled(track.slug)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
