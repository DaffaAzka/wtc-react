import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMyTracks } from "@/students/hooks/enrollments";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatternBackground } from "@/lib/utils";
import { GraduationCap, BookOpen, Trophy, Clock, CheckCircle2, Inbox, RefreshCw } from "lucide-react";

export default function MyLearning() {
  const { myTracks, loading, error } = useMyTracks();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const enrolledTracks = myTracks.filter((t) => t.enrollment.status === "active");
  const completedTracks = myTracks.filter((t) => t.enrollment.status === "completed");
  const totalModulesDone = myTracks.reduce((s, t) => s + (t.enrollment.completed_modules || 0), 0);
  const totalPoints = myTracks.reduce((s, t) => s + (t.enrollment.points_earned || 0), 0);

  if (error) {
    return (
      // <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-8 flex flex-col items-center gap-3 text-center">
      //   <p className="text-[15px] text-red-600 dark:text-red-400">{error.message || "Gagal memuat data."}</p>
      //   <button onClick={() => window.location.reload()}
      //     className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-red-300 dark:border-red-500/30 text-red-600 dark:text-red-400 font-bold rounded-xl px-4 py-2 text-sm hover:bg-red-50 dark:hover:bg-red-500/5 transition-all">
      //     <RefreshCw className="h-3.5 w-3.5" />Coba Lagi
      //   </button>
      // </div>
      <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
        <div className="w-14 h-14 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
          <BookOpen className="h-7 w-7 text-[#1c81ff]" />
        </div>
        <div>
          <p className="text-[15px] font-bold text-gray-900 dark:text-white">Belum ada kelas yang dipelajari</p>
          <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Mulai perjalanan belajar dari katalog kelas.</p>
        </div>
        <Link
          to="/student/classes"
          className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-sm"
        >
          Jelajahi Kelas
        </Link>
      </div>
    );
  }

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>
      {/* Header */}
      <div>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Student</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Progress Belajar
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">Pantau perjalanan belajar dan pencapaian kamu.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Sedang Dipelajari", value: enrolledTracks.length, icon: Clock, bg: "bg-[#1c81ff]/10", color: "text-[#1c81ff]" },
          { label: "Diselesaikan", value: completedTracks.length, icon: CheckCircle2, bg: "bg-[#31c7c8]/10", color: "text-[#31c7c8]" },
          { label: "Modul Selesai", value: totalModulesDone, icon: BookOpen, bg: "bg-[#2548d8]/10", color: "text-[#2548d8]" },
          { label: "Total Poin", value: totalPoints, icon: Trophy, bg: "bg-[#f6b60b]/10", color: "text-[#f6b60b]" },
        ].map(({ label, value, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
              {loading ? <span className="inline-block h-8 w-10 animate-pulse rounded-lg bg-gray-200 dark:bg-white/10" /> : value}
            </div>
            <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <Tabs defaultValue="enrolled">
        <TabsList className="bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
          <TabsTrigger
            value="enrolled"
            className="flex items-center gap-2 rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400"
          >
            <Clock className="h-3.5 w-3.5" />
            Sedang Dipelajari ({enrolledTracks.length})
          </TabsTrigger>
          <TabsTrigger
            value="completed"
            className="flex items-center gap-2 rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            Diselesaikan ({completedTracks.length})
          </TabsTrigger>
        </TabsList>

        {/* ── Enrolled ── */}
        <TabsContent value="enrolled" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {[1, 2].map((i) => (
                <div key={i} className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 overflow-hidden">
                  <Skeleton className="h-44 w-full" />
                  <div className="p-5 space-y-3">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-2 w-full rounded-full" />
                  </div>
                </div>
              ))}
            </div>
          ) : enrolledTracks.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                <BookOpen className="h-7 w-7 text-[#1c81ff]" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 dark:text-white">Belum ada kelas yang dipelajari</p>
                <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Mulai perjalanan belajar dari katalog kelas.</p>
              </div>
              <Link
                to="/student/classes"
                className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-sm"
              >
                Jelajahi Kelas
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {enrolledTracks.map((track) => {
                const progress = track.enrollment.progress_percentage || 0;
                const completedModules = track.enrollment.completed_modules || 0;
                const totalModules = track.modules_count || 0;
                return (
                  <Link
                    key={track.id}
                    to={`/student/tracks/${track.slug}`}
                    className="group block rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                  >
                    <div className="relative h-44 overflow-hidden" style={{ background: getPatternBackground(track.title) }}>
                      {track.image_url && (
                        <img
                          src={track.image_url}
                          alt={track.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => {
                            e.currentTarget.style.display = "none";
                          }}
                        />
                      )}
                      <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-extrabold text-white tabular-nums">{Math.round(progress)}%</div>
                    </div>
                    <div className="p-5 space-y-3">
                      <div>
                        <h3 className="font-extrabold text-gray-900 dark:text-white group-hover:text-[#1c81ff] transition-colors line-clamp-1" style={{ letterSpacing: "-0.01em" }}>
                          {track.title}
                        </h3>
                        <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                          {completedModules} dari {totalModules} modul
                        </p>
                      </div>
                      <Progress value={progress} className="h-1.5 bg-gray-100 dark:bg-white/10 [&>div]:bg-[#1c81ff]" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* ── Completed ── */}
        <TabsContent value="completed" className="mt-6">
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 overflow-hidden">
                  <Skeleton className="h-32 w-full" />
                  <div className="p-4 space-y-2">
                    <Skeleton className="h-5 w-3/4 rounded-lg" />
                    <Skeleton className="h-3 w-1/2 rounded-md" />
                  </div>
                </div>
              ))}
            </div>
          ) : completedTracks.length === 0 ? (
            <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
              <div className="w-14 h-14 rounded-full bg-[#31c7c8]/10 flex items-center justify-center">
                <Trophy className="h-7 w-7 text-[#31c7c8]" />
              </div>
              <div>
                <p className="text-[15px] font-bold text-gray-900 dark:text-white">Belum ada kelas yang diselesaikan</p>
                <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Selesaikan kelas yang sedang dipelajari.</p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {completedTracks.map((track) => (
                <Link
                  key={track.id}
                  to={`/student/tracks/${track.slug}`}
                  className="group block rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                >
                  <div className="relative h-32 overflow-hidden" style={{ background: getPatternBackground(track.title) }}>
                    {track.image_url && (
                      <img
                        src={track.image_url}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <div className="absolute top-2 right-2 w-7 h-7 rounded-full bg-[#31c7c8] flex items-center justify-center shadow-lg">
                      <CheckCircle2 className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-extrabold text-[14px] text-gray-900 dark:text-white group-hover:text-[#31c7c8] transition-colors line-clamp-2" style={{ letterSpacing: "-0.01em" }}>
                      {track.title}
                    </h3>
                    {track.enrollment.completed_at && (
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-1.5 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3 w-3 text-[#31c7c8]" />
                        Selesai {new Date(track.enrollment.completed_at).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })}
                      </p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
