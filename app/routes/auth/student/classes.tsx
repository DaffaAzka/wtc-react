import { useEffect, useState } from "react";
import { useGetStudyClasses, useJoinClass } from "@/hooks/study-classes";
import { useGetMyClass } from "@/hooks/study-classes";
import { getPatternBackground } from "@/lib/utils";
import { BookOpen, GraduationCap, Sparkles, Check, Loader2 } from "lucide-react";
import { SkeletonCard } from "@/components/skeletons/card";
import type { StudyClass } from "@/services/study-class";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

export default function AllClassesPage() {
  const { studyClasses, loading, error } = useGetStudyClasses({
    active_only: true,
    with_tracks: true,
  });
  const { myClass } = useGetMyClass();
  const { mutate: joinClass, isPending: joining } = useJoinClass();
  const [mounted, setMounted] = useState(false);
  const [confirmClass, setConfirmClass] = useState<StudyClass | null>(null);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const handleJoin = (studyClass: StudyClass) => {
    // If already in another class, confirm first
    if (myClass && myClass.id !== studyClass.id) {
      setConfirmClass(studyClass);
      return;
    }
    joinClass(studyClass.id);
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 animate-pulse rounded-full" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />
          <div className="h-4 w-48 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
            <span className="text-[12px] font-bold text-[#1c81ff]/70">
              {studyClasses.length === 1 ? "Kelas" : "Kelas"}
            </span>
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
            const isMyClass = myClass?.id === studyClass.id;
            const trackCount = studyClass.tracks?.length ?? 0;

            return (
              <div
                key={studyClass.id}
                className="group rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col"
              >
                {/* Cover */}
                <div className="relative h-40 overflow-hidden" style={{ background: getPatternBackground(studyClass.name) }}>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                  {isMyClass && (
                    <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-full bg-[#31c7c8] px-2.5 py-1 text-[11px] font-bold text-white">
                      <Check className="h-3 w-3" />
                      Kelas Saya
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <p className="text-white font-extrabold text-lg line-clamp-2 drop-shadow-lg" style={{ letterSpacing: "-0.01em" }}>
                      {studyClass.name}
                    </p>
                    {(studyClass.academic_year || studyClass.semester) && (
                      <p className="text-white/70 text-[12px] mt-0.5">
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

                  {/* Track list */}
                  <div className="flex-1 space-y-1.5">
                    {trackCount === 0 ? (
                      <p className="text-[13px] text-gray-400 dark:text-gray-600">Belum ada track</p>
                    ) : (
                      studyClass.tracks?.slice(0, 4).map((track) => (
                        <div key={track.id} className="flex items-center gap-2 text-[13px] text-gray-600 dark:text-gray-400">
                          <BookOpen className="h-3.5 w-3.5 shrink-0 text-[#1c81ff]" />
                          <span className="truncate">{track.title}</span>
                        </div>
                      ))
                    )}
                    {trackCount > 4 && (
                      <p className="text-[12px] text-gray-400 dark:text-gray-600 pl-5">+{trackCount - 4} track lainnya</p>
                    )}
                  </div>

                  {/* Footer */}
                  <div className="border-t border-gray-100 dark:border-white/5 pt-3">
                    {isMyClass ? (
                      <div className="flex items-center justify-center gap-2 w-full rounded-xl py-2 text-[13px] font-bold text-[#31c7c8] bg-[#31c7c8]/10">
                        <Check className="h-4 w-4" />
                        Sudah Bergabung
                      </div>
                    ) : (
                      <button
                        onClick={() => handleJoin(studyClass)}
                        disabled={joining}
                        className="flex items-center justify-center gap-2 w-full rounded-xl py-2 text-[13px] font-bold text-white bg-[#1c81ff] hover:bg-[#1c81ff]/90 active:scale-95 transition-all shadow-sm shadow-blue-500/20 disabled:opacity-60"
                      >
                        {joining ? <Loader2 className="h-4 w-4 animate-spin" /> : <GraduationCap className="h-4 w-4" />}
                        Ambil Kelas
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Confirm switch class dialog */}
      <AlertDialog open={!!confirmClass} onOpenChange={() => setConfirmClass(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Ganti Kelas?</AlertDialogTitle>
            <AlertDialogDescription>
              Kamu sudah terdaftar di <strong>{myClass?.name}</strong>. Bergabung ke <strong>{confirmClass?.name}</strong> akan mengganti kelas kamu saat ini. Progress belajar dan enrollment track tidak akan terpengaruh.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmClass) {
                  joinClass(confirmClass.id);
                  setConfirmClass(null);
                }
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
