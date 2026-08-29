import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/axios";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  BookOpen,
  Package,
  FileText,
  Trophy,
  Users,
  School,
  Activity,
  ArrowRight,
} from "lucide-react";

interface DashboardStats {
  tracks: number;
  modules: number;
  lessons: number;
  challenges: number;
  studyClasses: number;
  users: number;
}

interface Track {
  id: string;
  name: string;
  description: string;
  slug: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats>({
    tracks: 0,
    modules: 0,
    lessons: 0,
    challenges: 0,
    studyClasses: 0,
    users: 0,
  });
  const [recentTracks, setRecentTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        const [
          tracksRes,
          modulesRes,
          lessonsRes,
          challengesRes,
          studyClassesRes,
          usersRes,
        ] = await Promise.all([
          api.get("/tracks?pagination=false").catch(() => null),
          api.get("/modules?pagination=false").catch(() => null),
          api.get("/lessons?pagination=false").catch(() => null),
          api.get("/challenges?pagination=false").catch(() => null),
          api.get("/study-classes?pagination=false").catch(() => null),
          api.get("/users/stats").catch(() => null),
        ]);

        const newStats: DashboardStats = {
          tracks: 0,
          modules: 0,
          lessons: 0,
          challenges: 0,
          studyClasses: 0,
          users: 0,
        };

        if (tracksRes?.data) {
          const data = Array.isArray(tracksRes.data)
            ? tracksRes.data
            : tracksRes.data.data || [];
          newStats.tracks = data.length;
          setRecentTracks(data.slice(0, 5));
        }
        if (modulesRes?.data) {
          const data = Array.isArray(modulesRes.data)
            ? modulesRes.data
            : modulesRes.data.data || [];
          newStats.modules = data.length;
        }
        if (lessonsRes?.data) {
          const data = Array.isArray(lessonsRes.data)
            ? lessonsRes.data
            : lessonsRes.data.data || [];
          newStats.lessons = data.length;
        }
        if (challengesRes?.data) {
          const data = Array.isArray(challengesRes.data)
            ? challengesRes.data
            : challengesRes.data.data || [];
          newStats.challenges = data.length;
        }
        if (studyClassesRes?.data) {
          const data = Array.isArray(studyClassesRes.data)
            ? studyClassesRes.data
            : studyClassesRes.data.data || [];
          newStats.studyClasses = data.length;
        }
        if (usersRes?.data) {
          const statsData = usersRes.data.data || usersRes.data;
          newStats.users = statsData.total_users || 0;
        }

        setStats(newStats);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data"
        );
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => setMounted(true), 60);
      return () => clearTimeout(t);
    }
  }, [loading]);

  const avatarSrc =
    typeof user?.avatar === "string"
      ? user.avatar
      : user?.avatar && "url" in user.avatar
        ? user.avatar.url
        : undefined;

  // ── Loading skeleton ────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in-50 duration-300">
        {/* Header skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-3 w-28 bg-gray-200 dark:bg-white/10 animate-pulse rounded-full" />
            <div className="h-10 w-72 bg-gray-200 dark:bg-white/10 animate-pulse rounded-xl" />
            <div className="h-4 w-48 bg-gray-100 dark:bg-white/5 animate-pulse rounded-lg" />
          </div>
          <div className="hidden lg:flex items-center gap-3">
            <div className="h-14 w-14 bg-gray-200 dark:bg-white/10 animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-gray-200 dark:bg-white/10 animate-pulse rounded-md" />
              <div className="h-3 w-20 bg-gray-100 dark:bg-white/5 animate-pulse rounded-md" />
            </div>
          </div>
        </div>

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className="rounded-2xl bg-white dark:bg-[#0b1215] border border-gray-200 dark:border-white/10 p-5 space-y-3"
            >
              <div className="h-10 w-10 bg-gray-100 dark:bg-white/5 animate-pulse rounded-full" />
              <div className="h-7 w-12 bg-gray-200 dark:bg-white/10 animate-pulse rounded-lg" />
              <div className="h-2.5 w-16 bg-gray-100 dark:bg-white/5 animate-pulse rounded-full" />
            </div>
          ))}
        </div>

        {/* Content skeleton */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-64 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
          <div className="h-64 rounded-2xl bg-gray-100 dark:bg-white/5 animate-pulse" />
        </div>
      </div>
    );
  }

  // ── Error state ─────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="space-y-6">
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white"
          style={{ letterSpacing: "-0.02em" }}
        >
          Dashboard
        </h1>
        <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6">
          <p className="text-[15px] text-red-600 dark:text-red-400">
            Error loading dashboard: {error}
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ── Stat cards config ───────────────────────────────────────────────────────
  const statsCards = [
    {
      title: "Tracks",
      value: stats.tracks,
      icon: BookOpen,
      bg: "bg-[#1c81ff]/10",
      color: "text-[#1c81ff]",
      link: "/tracks",
    },
    {
      title: "Modules",
      value: stats.modules,
      icon: Package,
      bg: "bg-[#31c7c8]/10",
      color: "text-[#31c7c8]",
      link: "/modules",
    },
    {
      title: "Lessons",
      value: stats.lessons,
      icon: FileText,
      bg: "bg-[#2548d8]/10",
      color: "text-[#2548d8]",
      link: "/lessons",
    },
    {
      title: "Challenges",
      value: stats.challenges,
      icon: Trophy,
      bg: "bg-[#ff007b]/10",
      color: "text-[#ff007b]",
      link: "/challenges",
    },
    {
      title: "Classes",
      value: stats.studyClasses,
      icon: School,
      bg: "bg-[#00b4ff]/10",
      color: "text-[#00b4ff]",
      link: "/study-classes",
    },
    {
      title: "Users",
      value: stats.users,
      icon: Users,
      bg: "bg-[#00E676]/10",
      color: "text-[#00E676]",
      link: "/user-management",
    },
  ];

  // ── Quick actions config ────────────────────────────────────────────────────
  const quickActions = [
    { label: "Manage Tracks",    icon: BookOpen, link: "/tracks",              bg: "bg-[#1c81ff]/10",  color: "text-[#1c81ff]",  hover: "hover:border-[#1c81ff]/30 hover:bg-[#1c81ff]/5" },
    { label: "Manage Modules",   icon: Package,  link: "/modules",             bg: "bg-[#31c7c8]/10",  color: "text-[#31c7c8]",  hover: "hover:border-[#31c7c8]/30 hover:bg-[#31c7c8]/5" },
    { label: "Manage Lessons",   icon: FileText, link: "/lessons",             bg: "bg-[#2548d8]/10",  color: "text-[#2548d8]",  hover: "hover:border-[#2548d8]/30 hover:bg-[#2548d8]/5" },
    { label: "Manage Challenges",icon: Trophy,   link: "/challenges",          bg: "bg-[#ff007b]/10",  color: "text-[#ff007b]",  hover: "hover:border-[#ff007b]/30 hover:bg-[#ff007b]/5" },
    { label: "Study Classes",    icon: School,   link: "/admin/study-classes", bg: "bg-[#00b4ff]/10",  color: "text-[#00b4ff]",  hover: "hover:border-[#00b4ff]/30 hover:bg-[#00b4ff]/5" },
    { label: "Manage Users",     icon: Users,    link: "/user-management",     bg: "bg-[#00E676]/10",  color: "text-[#00E676]",  hover: "hover:border-[#00E676]/30 hover:bg-[#00E676]/5" },
  ];

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
            {user?.display_name?.trim() || user?.name || "Admin"} 👋
          </h1>
          <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
            Dashboard Management & Overview
          </p>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Avatar className="h-14 w-14 ring-2 ring-[#1c81ff]/20">
            <AvatarImage
              src={avatarSrc}
              alt={user?.display_name || user?.name || "Admin"}
            />
            <AvatarFallback className="text-lg font-bold bg-[#1c81ff]/10 text-[#1c81ff]">
              {(user?.display_name || user?.name)?.charAt(0)?.toUpperCase() || "A"}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user?.display_name?.trim() || user?.name || "Admin"}</div>
            {user?.roles && user.roles.length > 0 && <div className="text-sm text-muted-foreground">{user.roles[1].name || "Administrator"}</div>}
          </div>
        </div>
      </div>

      {/* ── Quick Stats ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {statsCards.map(({ title, value, icon: Icon, bg, color, link }) => (
          <Link
            key={title}
            to={link}
            className="group rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 hover:shadow-md hover:-translate-y-1 transition-all duration-300"
          >
            <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center mb-3`}>
              <Icon className={`h-5 w-5 ${color}`} />
            </div>
            <div className="text-3xl font-extrabold text-gray-900 dark:text-white mb-1">
              {value}
            </div>
            <div className="text-[12px] font-bold uppercase tracking-[0.15em] text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300 transition-colors">
              {title}
            </div>
          </Link>
        ))}
      </div>

      {/* ── Content Sections ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tracks */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                <BookOpen className="h-4 w-4 text-[#1c81ff]" />
              </div>
              <span className="font-bold text-gray-900 dark:text-white">Recent Tracks</span>
            </div>
            <Link
              to="/tracks"
              className="flex items-center gap-1 text-[12px] font-bold uppercase tracking-[0.1em] text-[#1c81ff] hover:opacity-75 transition-opacity"
            >
              View All
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {/* List */}
          <div className="p-4">
            {recentTracks.length === 0 ? (
              <p className="text-[15px] text-gray-500 dark:text-gray-400 py-6 text-center">
                Belum ada tracks tersedia.
              </p>
            ) : (
              <div className="space-y-1">
                {recentTracks.map((track) => (
                  <Link
                    key={track.id}
                    to={`/student/tracks/${track.slug}`}
                    className="flex items-start gap-3 p-3 rounded-xl hover:bg-gray-50 dark:hover:bg-white/5 transition-colors group"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="h-4 w-4 text-[#1c81ff]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold text-gray-900 dark:text-white truncate group-hover:text-[#1c81ff] transition-colors">
                        {track.name}
                      </p>
                      <p className="text-[13px] text-gray-500 dark:text-gray-400 line-clamp-1 mt-0.5">
                        {track.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
          {/* Header */}
          <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
            <div className="w-8 h-8 rounded-full bg-[#2548d8]/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-[#2548d8]" />
            </div>
            <span className="font-bold text-gray-900 dark:text-white">Quick Actions</span>
          </div>

          {/* Grid */}
          <div className="p-4 grid grid-cols-2 gap-2">
            {quickActions.map(({ label, icon: Icon, link, bg, color, hover }) => (
              <Link
                key={label}
                to={link}
                className={`flex items-center gap-2.5 p-3 rounded-xl border border-gray-200 dark:border-white/10 ${hover} transition-all duration-200 group`}
              >
                <div className={`w-7 h-7 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon className={`h-3.5 w-3.5 ${color}`} />
                </div>
                <span className="text-[13px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                  {label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
