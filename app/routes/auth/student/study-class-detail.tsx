import { useEffect, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useGetStudyClass, useJoinClass, useGetMyClass } from "@/hooks/study-classes";
import { useMyTracks } from "@/students/hooks/enrollments";
import { getPatternBackground } from "@/lib/utils";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import {
  BookOpen, GraduationCap, ArrowLeft, CheckCircle2, Lock,
  Layers, Users, Clock, Loader2, Check, Sparkles
} from "lucide-react";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

// Only render images from https:// origins to prevent pixel-tracking via admin-controlled URLs
function safeImageUrl(url?: string | null): string | undefined {
  return url?.startsWith("https://") ? url : undefined;
}

export default function StudyClassDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  // Guard against NaN — malformed/missing params would fire GET /study-classes/NaN
  const numericId = Number(id);
  const { studyClass, loading: scLoading } = useGetStudyClass(
    id && !isNaN(numericId) ? numericId : 0
  );
  const { myClass, loading: myClassLoading } = useGetMyClass();
  const { myTracks, loading: tracksLoading } = useMyTracks();
  const { mutate: joinClass, isPending: joining } = useJoinClass();
  const [mounted, setMounted] = useState(false);
  const [confirmSwitch, setConfirmSwitch] = useState(false);

  const loading = scLoading || myClassLoading || tracksLoading;

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const handleJoin = () => {
    if (!studyClass) return;
    if (myClass && myClass.id !== studyClass.id) {
      setConfirmSwitch(true);
      return;
    }
    joinClass(studyClass.id, { onSuccess: () => navigate("/student/my-class") });
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <Skeleton className="h-64 w-full rounded-2xl" />
        <div className="space-y-3">
          <Skeleton className="h-8 w-64 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {[1,2,3,4].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      </div>
    );
  }

  if (!studyClass) {
    return (
      <div className="flex flex-col items-center gap-4 py-20 text-center">
        <p className="text-[15px] font-bold text-gray-900 dark:text-white">Kelas tidak ditemukan</p>
        <Link to="/student/classes" className="text-[13px] font-bold text-[#1c81ff] hover:underline flex items-center gap-1">
          <ArrowLeft className="h-3.5 w-3.5" /> Kembali ke Semua Kelas
        </Link>
      </div>
    );
  }

  const tracks         = studyClass.tracks ?? [];
  const isMyClass      = myClass?.id === studyClass.id;
  const enrolledSlugs  = new Set(myTracks.map((t) => t.slug));
  const enrolledCount  = tracks.filter((t) => enrolledSlugs.has(t.slug)).length;
  const completedCount = myTracks.filter((t) => t.enrollment.status === "completed" && tracks.some((tr) => tr.slug === t.slug)).length;

  return (
    <div className={`space-y-8 transition-all duration-700 ease-out ${mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}>

      {/* Back */}
      <Link to="/student/classes" className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-[#1c81ff] transition-colors">
        <ArrowLeft className="h-4 w-4" /> Semua Kelas
      </Link>

      {/* Hero */}
      <div className="relative rounded-2xl overflow-hidden" style={{ minHeight: '220px', background: getPatternBackground(studyClass.name) }}>
        {safeImageUrl(studyClass.image_url) && (
          <img
            src={safeImageUrl(studyClass.image_url)}
            alt={studyClass.name}
            className="absolute inset-0 w-full h-full object-cover"
            onError={(e) => { e.currentTarget.style.display = "none"; }}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

        {isMyClass && (
          <div className="absolute top-4 left-4 flex items-center gap-1.5 rounded-full bg-[#31c7c8] px-3 py-1 text-[12px] font-bold text-white shadow">
            <Check className="h-3.5 w-3.5" /> Kelas Saya
          </div>
        )}

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-white/60 mb-1">Study Class</p>
          <h1 className="text-3xl font-extrabold text-white leading-tight mb-2" style={{ letterSpacing: "-0.02em" }}>
            {studyClass.name}
          </h1>
          <div className="flex items-center gap-3 flex-wrap">
            {studyClass.academic_year && (
              <span className="text-[13px] text-white/70">{studyClass.academic_year}</span>
            )}
            {studyClass.semester && (
              <span className="text-[13px] text-white/70">· Semester {studyClass.semester}</span>
            )}
            <span className="flex items-center gap-1 text-[13px] text-white/70">
              <Layers className="h-3.5 w-3.5" /> {tracks.length} tracks
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          {studyClass.description && (
            <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-6">
              <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-white mb-2">Tentang Kelas Ini</h2>
              <p className="text-[14px] leading-relaxed text-gray-500 dark:text-gray-400">{studyClass.description}</p>
            </div>
          )}

          {/* Tracks list */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-[15px] font-extrabold text-gray-900 dark:text-white">
                Tracks ({tracks.length})
              </h2>
              {isMyClass && enrolledCount > 0 && (
                <span className="text-[12px] font-bold text-[#1c81ff]">
                  {enrolledCount} dari {tracks.length} diambil
                </span>
              )}
            </div>

            {tracks.length === 0 ? (
              <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-10 text-center">
                <BookOpen className="h-8 w-8 text-gray-300 dark:text-gray-700 mx-auto mb-2" />
                <p className="text-[14px] text-gray-400 dark:text-gray-600">Belum ada track di kelas ini</p>
              </div>
            ) : (
              <div className="space-y-3">
                {tracks.map((track, idx) => {
                  const enrolled  = enrolledSlugs.has(track.slug);
                  const myTrack   = myTracks.find((t) => t.slug === track.slug);
                  const progress  = myTrack?.enrollment.progress_percentage ?? 0;
                  const completed = myTrack?.enrollment.status === "completed";

                  return (
                    <Link
                      key={track.id}
                      to={`/student/tracks/${track.slug}`}
                      className="group flex items-center gap-4 rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
                    >
                      {/* Index / status */}
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-[13px] font-extrabold ${
                        completed
                          ? "bg-[#31c7c8] text-white"
                          : enrolled
                          ? "bg-[#1c81ff]/10 text-[#1c81ff]"
                          : "bg-gray-100 dark:bg-white/5 text-gray-400 dark:text-gray-600"
                      }`}>
                        {completed
                          ? <CheckCircle2 className="h-4.5 w-4.5" style={{ width: '1.125rem', height: '1.125rem' }} />
                          : String(idx + 1).padStart(2, "0")}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="font-extrabold text-[14px] text-gray-900 dark:text-white group-hover:text-[#1c81ff] transition-colors truncate" style={{ letterSpacing: "-0.01em" }}>
                          {track.title}
                        </p>
                        {track.description && (
                          <p className="text-[12px] text-gray-400 dark:text-gray-600 truncate mt-0.5">{track.description}</p>
                        )}
                        {enrolled && !completed && (
                          <div className="mt-2 flex items-center gap-2">
                            <Progress value={progress} className="h-1 flex-1 bg-gray-100 dark:bg-white/10 [&>div]:bg-[#1c81ff]" />
                            <span className="text-[11px] font-bold text-[#1c81ff] tabular-nums shrink-0">{Math.round(progress)}%</span>
                          </div>
                        )}
                      </div>

                      {/* Right badge */}
                      {!enrolled && (
                        <div className="flex items-center gap-1 text-[11px] font-bold text-gray-400 shrink-0">
                          <Lock className="h-3 w-3" />
                        </div>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {/* Stats card */}
          {isMyClass && (
            <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-5 space-y-4">
              <p className="text-[12px] font-bold uppercase tracking-[0.12em] text-gray-400 dark:text-gray-600">Progress Kamu</p>
              {[
                { label: "Total Tracks",    value: tracks.length,   color: "text-[#1c81ff]",  icon: Layers },
                { label: "Diambil",         value: enrolledCount,   color: "text-[#f6b60b]",  icon: Clock },
                { label: "Diselesaikan",    value: completedCount,  color: "text-[#31c7c8]",  icon: CheckCircle2 },
              ].map(({ label, value, color, icon: Icon }) => (
                <div key={label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
                    <Icon className={`h-4 w-4 ${color}`} />
                    {label}
                  </div>
                  <span className={`text-[14px] font-extrabold ${color}`}>{value}</span>
                </div>
              ))}
            </div>
          )}

          {/* CTA card */}
          <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-5 space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#1c81ff]" />
              <p className="text-[13px] font-bold text-gray-900 dark:text-white">
                {isMyClass ? "Kelas Aktif Kamu" : "Bergabung ke Kelas Ini"}
              </p>
            </div>

            <ul className="space-y-2">
              {[
                `${tracks.length} tracks pembelajaran`,
                "Self-paced, belajar kapan saja",
                "Sertifikat penyelesaian",
                "Akses seumur hidup",
              ].map((item) => (
                <li key={item} className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-gray-400">
                  <CheckCircle2 className="h-3.5 w-3.5 text-[#31c7c8] shrink-0" />
                  {item}
                </li>
              ))}
            </ul>

            {isMyClass ? (
              <Link
                to="/student/my-class"
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-[13px] font-bold text-white bg-[#31c7c8] hover:bg-[#31c7c8]/90 active:scale-95 transition-all"
              >
                <GraduationCap className="h-4 w-4" />
                Buka Kelas Saya
              </Link>
            ) : (
              <button
                onClick={handleJoin}
                disabled={joining}
                className="flex items-center justify-center gap-2 w-full rounded-xl py-2.5 text-[13px] font-bold text-white bg-[#1c81ff] hover:bg-[#1c81ff]/90 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60"
              >
                {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
                Ambil Kelas Ini
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Confirm switch dialog */}
      <AlertDialog open={confirmSwitch} onOpenChange={setConfirmSwitch}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ganti Kelas?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu sudah terdaftar di <strong>{myClass?.name}</strong>. Bergabung ke <strong>{studyClass.name}</strong> akan mengganti kelas kamu saat ini. Progress belajar dan enrollment track tidak akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                joinClass(studyClass.id, { onSuccess: () => navigate("/student/my-class") });
                setConfirmSwitch(false);
              }}
              className="bg-[#1c81ff] hover:bg-[#1c81ff]/90"
            >
              Ganti Kelas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
