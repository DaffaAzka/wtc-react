import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BookOpen, Award, TrendingUp, Target } from "lucide-react";

// Helper function to generate consistent pattern background based on text
function getPatternBackground(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash;
  }

  const colors = [
    { primary: "rgba(28, 129, 255, 0.12)", secondary: "rgba(28, 129, 255, 0.06)" },
    { primary: "rgba(49, 199, 200, 0.12)", secondary: "rgba(49, 199, 200, 0.06)" },
    { primary: "rgba(37, 72, 216, 0.12)", secondary: "rgba(37, 72, 216, 0.06)" },
    { primary: "rgba(100, 116, 139, 0.1)",  secondary: "rgba(100, 116, 139, 0.05)" },
  ];

  const colorIndex = Math.abs(hash) % colors.length;
  const c = colors[colorIndex];

  return `radial-gradient(circle at 20% 50%, ${c.primary} 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, ${c.primary} 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, ${c.secondary} 0%, transparent 50%),
          radial-gradient(circle at 90% 30%, ${c.secondary} 0%, transparent 50%),
          radial-gradient(circle at 10% 80%, ${c.primary} 0%, transparent 50%)`;
}

interface DashboardProfile {
  id: string;
  display_name: string;
  nickname: string;
  points: number;
  study_class: { name: string } | null;
}

interface DashboardStats {
  active_tracks: number;
  completed_tracks: number;
  total_completed_challenges: number;
  overall_progress: number;
}

interface DashboardTrack {
  id: string;
  title: string;
  slug: string;
  image_url?: string;
  progress: { percent: number };
}

interface ContinueLearning {
  track: { title: string; slug: string };
  module: { title: string };
  lesson: { title: string; slug: string };
}

interface DashboardData {
  profile: DashboardProfile;
  stats: DashboardStats;
  tracks: DashboardTrack[];
  continue_learning: ContinueLearning | null;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/my/dashboard");
        setData(response.data?.data || response.data);
      } catch {
        // silently handled
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in-50 duration-300">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 animate-pulse rounded-full" />
            <div className="h-10 w-72 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />
            <div className="h-4 w-44 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-14 w-14 bg-gray-200 dark:bg-white/10 animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 animate-pulse rounded-md" />
              <div className="h-3 w-24 bg-gray-100 dark:bg-white/5 animate-pulse rounded-md" />
            </div>
          </div>
        </div>

        {/* Continue learning skeleton */}
        <div className="h-44 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-6 space-y-3">
              <div className="h-10 w-10 bg-gray-100 dark:bg-white/5 animate-pulse rounded-full" />
              <div className="h-8 w-16 bg-gray-200 dark:bg-white/10 animate-pulse rounded-lg" />
              <div className="h-3 w-20 bg-gray-100 dark:bg-white/5 animate-pulse rounded-md" />
            </div>
          ))}
        </div>

        {/* Tracks skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 overflow-hidden">
              <div className="h-40 bg-gray-100 dark:bg-white/5 animate-pulse" />
              <div className="p-5 space-y-3">
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-white/10 animate-pulse rounded-lg" />
                <div className="h-3 w-1/2 bg-gray-100 dark:bg-white/5 animate-pulse rounded-md" />
                <div className="h-2 w-full bg-gray-100 dark:bg-white/5 animate-pulse rounded-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // ── Error / empty state ─────────────────────────────────────────────────────
  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-4">
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400">
            Gagal memuat data dashboard
          </p>
          <button
            onClick={() => window.location.reload()}
            className="bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-sm"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  const avatarSrc =
    typeof user?.avatar === "string"
      ? user.avatar
      : user?.avatar && "url" in user.avatar
        ? user.avatar.url
        : undefined;

  // ── Main content ────────────────────────────────────────────────────────────
  return (
    <div
      className={`space-y-8 transition-all duration-700 ease-out ${
        mounted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* ── Welcome ── */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
            {getGreeting()}
          </p>
          <h1
            className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
            style={{ letterSpacing: "-0.02em" }}
          >
            {data.profile.display_name} 👋
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Semangat belajar hari ini! 🚀
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-[#1c81ff]/20">
            <AvatarImage src={avatarSrc} alt={data.profile.display_name} />
            <AvatarFallback className="text-lg font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
              {data.profile.display_name?.charAt(0)?.toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-bold text-gray-900 dark:text-white">
              {data.profile.display_name}
            </div>
            {data.profile.study_class && (
              <div className="text-[13px] text-gray-500 dark:text-gray-400">
                {data.profile.study_class.name}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ── Continue Learning ── */}
      {data.continue_learning && (
        <div className="relative overflow-hidden rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm min-h-48">
          {/* Background layer */}
          {(() => {
            const trackImage = data.tracks.find(
              (t) => t.slug === data.continue_learning?.track.slug
            )?.image_url;
            if (trackImage) {
              return (
                <>
                  <img
                    src={trackImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.style.display = "none"; }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-tr from-white via-white/85 to-[#1c81ff]/10 dark:from-[#0b1215] dark:via-[#0b1215]/85 dark:to-[#1c81ff]/20" />
                </>
              );
            }
            return (
              <div
                className="absolute inset-0"
                style={{ background: getPatternBackground(data.continue_learning?.track.title || "") }}
              />
            );
          })()}

          {/* Content */}
          <div className="relative z-10 p-8 h-full flex flex-col justify-center">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                    <BookOpen className="h-4 w-4 text-[#1c81ff]" />
                  </div>
                  <span className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff]">
                    Lanjutkan Belajar
                  </span>
                </div>
                <div>
                  <div
                    className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
                    style={{ letterSpacing: "-0.02em" }}
                  >
                    {data.continue_learning.lesson.title}
                  </div>
                  <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                    {data.continue_learning.track.title} •{" "}
                    {data.continue_learning.module.title}
                  </div>
                </div>
              </div>

              <Link
                to={`/student/classes/${data.continue_learning.track.slug}`}
                className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 px-6 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 whitespace-nowrap text-sm"
              >
                Lanjutkan
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          {
            value: data.profile.points,
            label: "Total Poin",
            icon: Award,
            bg: "bg-[#1c81ff]/10",
            color: "text-[#1c81ff]",
          },
          {
            value: data.stats.active_tracks,
            label: "Active Tracks",
            icon: BookOpen,
            bg: "bg-[#31c7c8]/10",
            color: "text-[#31c7c8]",
          },
          {
            value: data.stats.total_completed_challenges,
            label: "Challenges Done",
            icon: Target,
            bg: "bg-[#ff007b]/10",
            color: "text-[#ff007b]",
          },
          {
            value: `${Math.round(data.stats.overall_progress)}%`,
            label: "Overall Progress",
            icon: TrendingUp,
            bg: "bg-[#00E676]/10",
            color: "text-[#00E676]",
          },
        ].map(({ value, label, icon: Icon, bg, color }) => (
          <div
            key={label}
            className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-11 h-11 rounded-full ${bg} flex items-center justify-center mb-4`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
              {value}
            </div>
            <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500">
              {label}
            </div>
          </div>
        ))}
      </div>

      {/* ── Active Tracks ── */}
      <div className="space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-1">
              Progress
            </p>
            <h2
              className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-white"
              style={{ letterSpacing: "-0.02em" }}
            >
              Learning Paths Aktif
            </h2>
          </div>
          {data.tracks.length > 4 && (
            <Link
              to="/student/progress"
              className="flex items-center gap-1.5 text-[13px] font-bold text-[#1c81ff] hover:opacity-80 transition-opacity"
            >
              Lihat Semua
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>

        {data.tracks.length === 0 ? (
          <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-14 text-center">
            <div className="w-14 h-14 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center mx-auto mb-4">
              <BookOpen className="h-7 w-7 text-gray-400 dark:text-gray-600" />
            </div>
            <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mb-5">
              Belum ada learning path yang aktif
            </p>
            <Link
              to="/student/classes"
              className="inline-flex items-center gap-2 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl px-5 py-2.5 hover:bg-gray-50 dark:hover:bg-white/5 transition-all text-sm"
            >
              Jelajahi Learning Paths
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.tracks.slice(0, 3).map((track) => (
              <Link
                key={track.id}
                to={`/student/classes/${track.slug}`}
                className="group block rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-1 transition-all duration-300"
              >
                {/* Track image / pattern */}
                <div
                  className="h-44 w-full overflow-hidden"
                  style={{ background: getPatternBackground(track.title) }}
                >
                  {track.image_url && (
                    <img
                      src={track.image_url}
                      alt={track.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => { e.currentTarget.style.display = "none"; }}
                    />
                  )}
                </div>

                {/* Card body */}
                <div className="p-5 space-y-3">
                  <div>
                    <h3
                      className="font-extrabold text-gray-900 dark:text-white group-hover:text-[#1c81ff] transition-colors line-clamp-1"
                      style={{ letterSpacing: "-0.01em" }}
                    >
                      {track.title}
                    </h3>
                    <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
                      {Math.round(track.progress.percent)}% selesai
                    </p>
                  </div>
                  <Progress
                    value={track.progress.percent}
                    className="h-1.5 bg-gray-100 dark:bg-white/10 [&>div]:bg-[#1c81ff]"
                  />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* ── Tip of the Day ── */}
      <div className="rounded-2xl bg-gradient-to-r from-[#1c81ff]/5 to-[#31c7c8]/5 border border-[#1c81ff]/15 dark:border-[#1c81ff]/20 p-6">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-[#f6b60b]/10 flex items-center justify-center shrink-0 text-xl">
            💡
          </div>
          <div>
            <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#f6b60b] mb-1">
              Tip of The Day
            </p>
            <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-300 italic">
              Konsistensi adalah kunci. Luangkan 30 menit setiap hari untuk belajar hal baru!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
