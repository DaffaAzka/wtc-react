import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Package,
  FileText,
  Trophy,
  Users,
  School,
  TrendingUp,
  Activity,
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

interface Module {
  id: string;
  name: string;
  track_id: string;
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

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel
        const [
          tracksRes,
          modulesRes,
          lessonsRes,
          challengesRes,
          studyClassesRes,
          usersRes,
        ] = await Promise.all([
          api.get("/tracks").catch(() => null),
          api.get("/modules").catch(() => null),
          api.get("/lessons").catch(() => null),
          api.get("/challenges").catch(() => null),
          api.get("/study-classes").catch(() => null),
          api.get("/users/stats").catch(() => null),
        ]);

        // Parse responses and calculate stats
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
          // Parse /users/stats response: { success, message, data: { total_users, ... } }
          const statsData = usersRes.data.data || usersRes.data;
          newStats.users = statsData.total_users || 0;
        }

        setStats(newStats);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load dashboard data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
        <Skeleton className="h-64" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <p className="text-destructive">Error loading dashboard: {error}</p>
            <Button onClick={() => window.location.reload()} className="mt-4">
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Total Tracks",
      value: stats.tracks,
      icon: BookOpen,
      description: "Learning paths tersedia",
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
      link: "/tracks",
    },
    {
      title: "Total Modules",
      value: stats.modules,
      icon: Package,
      description: "Module pembelajaran",
      color: "text-green-500",
      bgColor: "bg-green-500/10",
      link: "/modules",
    },
    {
      title: "Total Lessons",
      value: stats.lessons,
      icon: FileText,
      description: "Materi pelajaran",
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      link: "/lessons",
    },
    {
      title: "Total Challenges",
      value: stats.challenges,
      icon: Trophy,
      description: "Tantangan tersedia",
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
      link: "/student/challenges",
    },
    {
      title: "Study Classes",
      value: stats.studyClasses,
      icon: School,
      description: "Kelas aktif",
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      link: "/study-classes",
    },
    {
      title: "Total Users",
      value: stats.users,
      icon: Users,
      description: "Pengguna terdaftar",
      color: "text-pink-500",
      bgColor: "bg-pink-500/10",
      link: "/users",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">
          Selamat datang, {user?.display_name?.trim() || "Admin"}
        </h1>
        <p className="text-muted-foreground mt-1">
          Overview sistem pembelajaran WebTech Training Center
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card
              key={stat.title}
              className="hover:shadow-md transition-all duration-200 cursor-pointer hover:scale-[1.02]"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline gap-2">
                  <div className="text-3xl font-bold">{stat.value}</div>
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* System Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Quick Stats */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Quick Stats
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Content Total</span>
              <span className="font-semibold">
                {stats.tracks + stats.modules + stats.lessons} items
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Avg Modules/Track</span>
              <span className="font-semibold">
                {stats.tracks > 0
                  ? Math.round(stats.modules / stats.tracks)
                  : 0}{" "}
                modules
              </span>
            </div>
            <div className="flex items-center justify-between py-2 border-b">
              <span className="text-sm text-muted-foreground">Avg Lessons/Module</span>
              <span className="font-semibold">
                {stats.modules > 0
                  ? Math.round(stats.lessons / stats.modules)
                  : 0}{" "}
                lessons
              </span>
            </div>
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">
                Users per Class (avg)
              </span>
              <span className="font-semibold">
                {stats.studyClasses > 0
                  ? Math.round(stats.users / stats.studyClasses)
                  : 0}{" "}
                users
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Tracks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Recent Tracks
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tracks">View All</Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTracks.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                Belum ada tracks tersedia.
              </p>
            ) : (
              <div className="space-y-3">
                {recentTracks.map((track) => (
                  <div
                    key={track.id}
                    className="flex items-start gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="p-2 rounded bg-blue-500/10">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {track.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/tracks">
                <BookOpen className="h-4 w-4 mr-2" />
                Manage Tracks
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/modules">
                <Package className="h-4 w-4 mr-2" />
                Manage Modules
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/lessons">
                <FileText className="h-4 w-4 mr-2" />
                Manage Lessons
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/student/challenges">
                <Trophy className="h-4 w-4 mr-2" />
                View Challenges
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
