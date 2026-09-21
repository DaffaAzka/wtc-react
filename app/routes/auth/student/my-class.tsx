import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useGetMyClass } from "@/hooks/study-classes";
import { useMyTracks } from "@/students/hooks/enrollments";
import { getPatternBackground } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { BookOpen, GraduationCap, ArrowRight, CheckCircle2, Lock, Trophy, Clock, Layers } from "lucide-react";

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
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />)}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1,2,3,4].map((i) => (
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

  // No class yet
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
          <div className="w-16 h-16 rounded-2xl bg-[#1c81ff]/10 flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-[#1c81ff]" />
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
  const enrolledCount = tracks.filter((t) => enrolledSlugs.has(t.slug)).length;
  const completedCount = myTracks.filter((t) => t.enrollment.status === "completed" && tracks.some((tr) => tr.slug === t.slug)).length;
  const totalPoints = myTracks
    .filter((t) => tracks.some((tr) => tr.slug === t.slug))
    .reduce((s, t) => s + (t.enrollment.points_earned || 0), 0);

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Student</p>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
            Kelas Saya
          </h1>
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <p className="text-[15px] font-bold text-gray-600 dark:text-gray-300">{myClass.name}</p>
            {myClass.academic_year && <span className="text-[13px] text-gray-400">·</span>}
            {myClass.academic_year && <span className="text-[13px] text-gray-400">{myClass.academic_year}</span>}
            {myClass.semester && <span className="text-[13px] text-gray-400">·</span>}
            {myClass.semester && <span className="text-[13px] text-gray-400">Semester {myClass.semester}</span>}
          </div>
        </div>
        <Link
          to="/student/classes"
          className="hidden lg:flex items-center gap-1.5 text-[13px] font-bold text-[#1c81ff] hover:underline mt-2 shrink-0"
        >
          Semua Kelas
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Total Tracks",      value: tracks.length,   icon: Layers,        bg: "bg-[#1c81ff]/10",  color: "text-[#1c81ff]"  },
          { label: "Sedang Dipelajari", value: enrolledCount,   icon: Clock,         bg: "bg-[#f6b60b]/10",  color: "text-[#f6b60b]"  },
          { label: "Diselesaikan",      value: completedCount,  icon: CheckCircle2,  bg: "bg-[#31c7c8]/10",  color: "text-[#31c7c8]"  },
          { label: "Total Poin",        value: totalPoints,     icon: Trophy,        bg: "bg-[#2548d8]/10",  color: "text-[#2548d8]"  },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div key={label} className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-300">
            <div className={`w-9 h-9 rounded-xl ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-4.5 w-4.5 ${color}`} style={{ width: '1.125rem', height: '1.125rem' }} />
            </div>
            <div className="text-2xl font-extrabold text-gray-900 dark:text-white mb-0.5">{value}</div>
            <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-500">{label}</div>
          </div>
        ))}
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
        <>
          <div className="flex items-center justify-between">
            <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400">
              {tracks.length} track tersedia
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {tracks.map((track) => {
              const enrolled  = enrolledSlugs.has(track.slug);
              const myTrack   = myTracks.find((t) => t.slug === track.slug);
              const progress  = myTrack?.enrollment.progress_percentage ?? 0;
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
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                    {/* Status badge */}
                    {completed ? (
                      <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-[#31c7c8] px-2.5 py-1 text-[11px] font-bold text-white shadow">
                        <CheckCircle2 className="h-3 w-3" /> Selesai
                      </div>
                    ) : enrolled ? (
                      <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-extrabold text-white tabular-nums">
                        {Math.round(progress)}%
                      </div>
                    ) : (
                      <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-black/50 backdrop-blur-sm px-2 py-1 text-[11px] font-bold text-white/80">
                        <Lock className="h-3 w-3" /> Belum Diambil
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
                      <div className="space-y-1.5">
                        <div className="flex items-center justify-between text-[12px]">
                          <span className="text-gray-400">Progress</span>
                          <span className="font-bold text-[#1c81ff]">{Math.round(progress)}%</span>
                        </div>
                        <Progress value={progress} className="h-1.5 bg-gray-100 dark:bg-white/10 [&>div]:bg-[#1c81ff]" />
                      </div>
                    )}

                    {completed && (
                      <p className="text-[12px] font-bold text-[#31c7c8] flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                      </p>
                    )}

                    {!enrolled && (
                      <div className="flex items-center justify-between pt-0.5">
                        <span className="text-[12px] text-gray-400 dark:text-gray-600 flex items-center gap-1.5">
                          <BookOpen className="h-3.5 w-3.5" /> Klik untuk mulai
                        </span>
                        <ArrowRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600 group-hover:text-[#1c81ff] group-hover:translate-x-0.5 transition-all" />
                      </div>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
