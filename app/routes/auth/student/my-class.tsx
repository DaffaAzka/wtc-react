import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useGetMyClass } from "@/hooks/study-classes";
import { useMyTracks } from "@/students/hooks/enrollments";
import { getPatternBackground } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2, Lock } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export default function MyClassPage() {
  const { myClass, loading: classLoading } = useGetMyClass();
  const { myTracks, loading: tracksLoading } = useMyTracks();
  const [mounted, setMounted] = useState(false);

  const loading = classLoading || tracksLoading;

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
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 overflow-hidden">
              <Skeleton className="h-36 w-full" />
              <div className="p-5 space-y-3">
                <Skeleton className="h-5 w-3/4 rounded-lg" />
                <Skeleton className="h-2 w-full rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No class yet — redirect to all classes
  if (!myClass) {
    return (
      <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Student</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Kelas Saya
          </h1>
        </div>
        <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
            <GraduationCap className="h-7 w-7 text-[#1c81ff]" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white">Kamu belum bergabung ke kelas manapun</p>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Pilih kelas yang sesuai untuk mulai belajar.</p>
          </div>
          <Link
            to="/student/classes"
            className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-sm"
          >
            Lihat Semua Kelas
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    );
  }

  const tracks = myClass.tracks ?? [];
  const enrolledSlugs = new Set(myTracks.map((t) => t.slug));

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Student</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Kelas Saya
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            {myClass.name}
            {myClass.academic_year && <span className="text-gray-400"> · {myClass.academic_year}</span>}
            {myClass.semester && <span className="text-gray-400"> · Semester {myClass.semester}</span>}
          </p>
        </div>
        <Link
          to="/student/classes"
          className="hidden lg:flex items-center gap-2 text-[13px] font-bold text-[#1c81ff] hover:underline mt-2"
        >
          Semua Kelas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Tracks */}
      {tracks.length === 0 ? (
        <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
          <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center">
            <BookOpen className="h-7 w-7 text-gray-400 dark:text-gray-600" />
          </div>
          <div>
            <p className="text-[15px] font-bold text-gray-900 dark:text-white">Belum ada track di kelas ini</p>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Admin akan menambahkan track segera.</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {tracks.map((track) => {
            const enrolled = enrolledSlugs.has(track.slug);
            const myTrack = myTracks.find((t) => t.slug === track.slug);
            const progress = myTrack?.enrollment.progress_percentage ?? 0;
            const completed = myTrack?.enrollment.status === "completed";

            return (
              <Link
                key={track.id}
                to={`/student/tracks/${track.slug}`}
                className="group block rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {/* Cover */}
                <div className="relative h-36 overflow-hidden" style={{ background: getPatternBackground(track.title) }}>
                  {track.image_url && (
                    <img
                      src={track.image_url}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                  {completed && (
                    <div className="absolute top-3 right-3 w-7 h-7 rounded-full bg-[#31c7c8] flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  )}
                  {!enrolled && !completed && (
                    <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-1 text-[11px] font-bold text-white">
                      <Lock className="h-3 w-3" />
                      Belum Diambil
                    </div>
                  )}
                  {enrolled && !completed && (
                    <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-extrabold text-white tabular-nums">
                      {Math.round(progress)}%
                    </div>
                  )}
                </div>

                {/* Body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="font-extrabold text-gray-900 dark:text-white group-hover:text-[#1c81ff] transition-colors line-clamp-1" style={{ letterSpacing: "-0.01em" }}>
                      {track.title}
                    </h3>
                    {track.description && (
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5 line-clamp-1">{track.description}</p>
                    )}
                  </div>
                  {enrolled && !completed && (
                    <Progress value={progress} className="h-1.5 bg-gray-100 dark:bg-white/10 [&>div]:bg-[#1c81ff]" />
                  )}
                  {completed && (
                    <p className="text-[12px] font-bold text-[#31c7c8] flex items-center gap-1.5">
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      Selesai
                    </p>
                  )}
                  {!enrolled && (
                    <p className="text-[12px] text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
                      <BookOpen className="h-3.5 w-3.5" />
                      Klik untuk mulai
                    </p>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
