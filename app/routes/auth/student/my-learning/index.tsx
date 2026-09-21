import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useMyTracks } from "@/students/hooks/enrollments";
import { useGetMyClass } from "@/hooks/study-classes";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getPatternBackground } from "@/lib/utils";
import { GraduationCap, BookOpen, Trophy, Clock, CheckCircle2, ArrowRight } from "lucide-react";

// ── Onboarding step types ─────────────────────────────────────────────────────

type OnboardingStep = {
  number: number;
  title: string;
  description: string;
  cta?: { label: string; href: string };
  done: boolean;
  active: boolean;
};

function OnboardingSteps({ steps }: { steps: OnboardingStep[] }) {
  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-8 max-w-lg mx-auto">
      <div className="space-y-0">
        {steps.map((step, idx) => {
          const isLast = idx === steps.length - 1;
          return (
            <div key={step.number} className="flex gap-4">
              {/* Step indicator + connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-extrabold shrink-0 transition-all ${
                    step.done
                      ? "bg-[#31c7c8] text-white"
                      : step.active
                      ? "bg-[#1c81ff] text-white"
                      : "bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {step.done ? <CheckCircle2 className="h-4 w-4" /> : step.number}
                </div>
                {!isLast && (
                  <div className="w-px flex-1 my-1 border-l-2 border-dashed border-gray-200 dark:border-white/10 min-h-[2.5rem]" />
                )}
              </div>

              {/* Step content */}
              <div className={`pb-6 flex-1 ${isLast ? "pb-0" : ""}`}>
                <p
                  className={`text-[14px] font-extrabold leading-tight ${
                    step.done
                      ? "text-gray-400 dark:text-gray-600 line-through"
                      : step.active
                      ? "text-gray-900 dark:text-white"
                      : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {step.title}
                </p>
                <p
                  className={`text-[13px] mt-0.5 ${
                    step.active ? "text-gray-500 dark:text-gray-400" : "text-gray-400 dark:text-gray-600"
                  }`}
                >
                  {step.description}
                </p>
                {step.active && step.cta && (
                  <Link
                    to={step.cta.href}
                    className="inline-flex items-center gap-1.5 mt-2.5 text-[13px] font-bold text-[#1c81ff] hover:underline"
                  >
                    {step.cta.label}
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function MyLearning() {
  const { myTracks, loading: tracksLoading, error } = useMyTracks();
  const { myClass, loading: classLoading } = useGetMyClass();
  const [mounted, setMounted] = useState(false);

  const loading = tracksLoading || classLoading;

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const enrolledTracks  = myTracks.filter((t) => t.enrollment.status === "active");
  const completedTracks = myTracks.filter((t) => t.enrollment.status === "completed");
  const totalModulesDone = myTracks.reduce((s, t) => s + (t.enrollment.completed_modules || 0), 0);
  const totalPoints      = myTracks.reduce((s, t) => s + (t.enrollment.points_earned || 0), 0);

  const hasClass      = !!myClass;
  const hasEnrollment = myTracks.length > 0;

  // ── Onboarding: show when no class OR (has class but no enrollment) ────────
  const showOnboarding = !hasClass || !hasEnrollment;

  const onboardingSteps: OnboardingStep[] = [
    {
      number: 1,
      title: "Ambil Kelas",
      description: "Pilih program belajar yang sesuai denganmu.",
      cta: { label: "Lihat Semua Kelas", href: "/student/classes" },
      done: hasClass,
      active: !hasClass,
    },
    {
      number: 2,
      title: "Pilih Tracks",
      description: "Enroll ke tracks yang ingin kamu pelajari dari kelasmu.",
      cta: hasClass ? { label: "Lihat Kelas Saya", href: "/student/my-class" } : undefined,
      done: hasEnrollment,
      active: hasClass && !hasEnrollment,
    },
    {
      number: 3,
      title: "Mulai Belajar",
      description: "Buka track pertamamu dan ikuti materi serta tantangannya.",
      done: false,
      active: false,
      cta: undefined,
    },
  ];

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8">
        <div className="space-y-3">
          <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 animate-pulse rounded-full" />
          <div className="h-10 w-64 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map((i) => <div key={i} className="rounded-2xl h-28 bg-gray-100 dark:bg-white/5 animate-pulse" />)}
        </div>
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
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Pantau perjalanan belajar dan pencapaian kamu.
        </p>
      </div>

      {/* Onboarding steps */}
      {showOnboarding ? (
        <div className="space-y-4">
          <div className="text-center">
            <p className="text-[14px] font-bold text-gray-900 dark:text-white">
              {!hasClass ? "Mulai perjalanan belajarmu dalam 3 langkah" : "Satu langkah lagi sebelum mulai belajar!"}
            </p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              {!hasClass ? "Ikuti langkah-langkah berikut untuk memulai." : "Kamu sudah punya kelas, sekarang pilih tracks-nya."}
            </p>
          </div>
          <OnboardingSteps steps={onboardingSteps} />
        </div>
      ) : (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { label: "Sedang Dipelajari", value: enrolledTracks.length,  icon: Clock,         bg: "bg-[#1c81ff]/10",  color: "text-[#1c81ff]"  },
              { label: "Diselesaikan",       value: completedTracks.length, icon: CheckCircle2,  bg: "bg-[#31c7c8]/10",  color: "text-[#31c7c8]"  },
              { label: "Modul Selesai",      value: totalModulesDone,       icon: BookOpen,      bg: "bg-[#2548d8]/10",  color: "text-[#2548d8]"  },
              { label: "Total Poin",         value: totalPoints,            icon: Trophy,        bg: "bg-[#f6b60b]/10",  color: "text-[#f6b60b]"  },
            ].map(({ label, value, icon: Icon, bg, color }) => (
              <div key={label} className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300">
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-3`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">{value}</div>
                <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">{label}</div>
              </div>
            ))}
          </div>

          {/* Tabs */}
          <Tabs defaultValue="enrolled">
            <TabsList className="bg-gray-100 dark:bg-white/5 rounded-xl p-1 gap-1">
              <TabsTrigger value="enrolled" className="flex items-center gap-2 rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                Sedang Dipelajari ({enrolledTracks.length})
              </TabsTrigger>
              <TabsTrigger value="completed" className="flex items-center gap-2 rounded-lg text-[13px] font-bold data-[state=active]:bg-white dark:data-[state=active]:bg-[#0b1215] data-[state=active]:text-gray-900 dark:data-[state=active]:text-white data-[state=active]:shadow-sm text-gray-500 dark:text-gray-400">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Diselesaikan ({completedTracks.length})
              </TabsTrigger>
            </TabsList>

            {/* Enrolled */}
            <TabsContent value="enrolled" className="mt-6">
              {enrolledTracks.length === 0 ? (
                <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                    <BookOpen className="h-7 w-7 text-[#1c81ff]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 dark:text-white">Belum ada track yang sedang dipelajari</p>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Enroll ke track baru dari kelas kamu.</p>
                  </div>
                  <Link to="/student/my-class" className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-sm">
                    Lihat Kelas Saya
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {enrolledTracks.map((track) => {
                    const progress         = track.enrollment.progress_percentage || 0;
                    const completedModules = track.enrollment.completed_modules || 0;
                    const totalModules     = track.modules_count || 0;
                    return (
                      <Link key={track.id} to={`/student/tracks/${track.slug}`}
                        className="group block rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                      >
                        <div className="relative h-44 overflow-hidden" style={{ background: getPatternBackground(track.title) }}>
                          {track.image_url && (
                            <img src={track.image_url} alt={track.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              onError={(e) => { e.currentTarget.style.display = "none"; }}
                            />
                          )}
                          <div className="absolute top-3 right-3 rounded-full bg-black/60 backdrop-blur-sm px-2.5 py-1 text-[11px] font-extrabold text-white tabular-nums">
                            {Math.round(progress)}%
                          </div>
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

            {/* Completed */}
            <TabsContent value="completed" className="mt-6">
              {completedTracks.length === 0 ? (
                <div className="rounded-2xl bg-white border border-dashed border-gray-200 dark:bg-[#0b1215] dark:border-white/10 p-14 flex flex-col items-center gap-4 text-center">
                  <div className="w-14 h-14 rounded-full bg-[#31c7c8]/10 flex items-center justify-center">
                    <Trophy className="h-7 w-7 text-[#31c7c8]" />
                  </div>
                  <div>
                    <p className="text-[15px] font-bold text-gray-900 dark:text-white">Belum ada track yang diselesaikan</p>
                    <p className="text-[14px] text-gray-500 dark:text-gray-400 mt-1">Selesaikan track yang sedang dipelajari.</p>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {completedTracks.map((track) => (
                    <Link key={track.id} to={`/student/tracks/${track.slug}`}
                      className="group block rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
                    >
                      <div className="relative h-32 overflow-hidden" style={{ background: getPatternBackground(track.title) }}>
                        {track.image_url && (
                          <img src={track.image_url} alt={track.title}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            onError={(e) => { e.currentTarget.style.display = "none"; }}
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
        </>
      )}
    </div>
  );
}
