import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  BookOpen,
  Package,
  FileText,
  Trophy,
  Users,
  School,
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
          api.get("/tracks?pagination=false").catch(() => null),
          api.get("/modules?pagination=false").catch(() => null),
          api.get("/lessons?pagination=false").catch(() => null),
          api.get("/challenges?pagination=false").catch(() => null),
          api.get("/study-classes?pagination=false").catch(() => null),
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
          const data =
            Array.isArray(tracksRes.data) ?
              tracksRes.data
            : tracksRes.data.data || [];
          newStats.tracks = data.length;
          setRecentTracks(data.slice(0, 5));
        }

        if (modulesRes?.data) {
          const data =
            Array.isArray(modulesRes.data) ?
              modulesRes.data
            : modulesRes.data.data || [];
          newStats.modules = data.length;
        }

        if (lessonsRes?.data) {
          const data =
            Array.isArray(lessonsRes.data) ?
              lessonsRes.data
            : lessonsRes.data.data || [];
          newStats.lessons = data.length;
        }

        if (challengesRes?.data) {
          const data =
            Array.isArray(challengesRes.data) ?
              challengesRes.data
            : challengesRes.data.data || [];
          newStats.challenges = data.length;
        }

        if (studyClassesRes?.data) {
          const data =
            Array.isArray(studyClassesRes.data) ?
              studyClassesRes.data
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
        setError(
          err instanceof Error ? err.message : "Failed to load dashboard data",
        );
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Skeleton key={i} className="h-28" />
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
      title: "Tracks",
      value: stats.tracks,
      icon: BookOpen,
      description: "Learning paths",
      link: "/tracks",
    },
    {
      title: "Modules",
      value: stats.modules,
      icon: Package,
      description: "Module pembelajaran",
      link: "/modules",
    },
    {
      title: "Lessons",
      value: stats.lessons,
      icon: FileText,
      description: "Materi pelajaran",
      link: "/lessons",
    },
    {
      title: "Challenges",
      value: stats.challenges,
      icon: Trophy,
      description: "Tantangan",
      link: "/student/challenges",
    },
    {
      title: "Study Classes",
      value: stats.studyClasses,
      icon: School,
      description: "Kelas aktif",
      link: "/study-classes",
    },
    {
      title: "Users",
      value: stats.users,
      icon: Users,
      description: "Pengguna terdaftar",
      link: "/users",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Row: Admin Info + System Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Admin Profile Card */}
        <Card className="bg-slate-900 dark:bg-slate-950 text-white border-slate-800">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-full bg-slate-700 flex items-center justify-center text-xl font-bold">
                {user?.avatar ?
                  <img
                    src={
                      typeof user.avatar === "string" ?
                        user.avatar
                      : (user.avatar?.url ?? undefined)
                    }
                    alt={user.display_name || "Admin"}
                    className="w-full h-full rounded-full object-cover"
                  />
                : <span>
                    {user?.display_name?.charAt(0)?.toUpperCase() || "A"}
                  </span>
                }
              </div>
              <div className="flex-1">
                <h2 className="text-xl font-semibold mb-1">
                  {user?.display_name?.trim() || "Admin"}
                </h2>
                <p className="text-sm text-slate-300 mb-2">
                  {user?.email || ""}
                </p>
                {user?.roles && user.roles.length > 0 && (
                  <Badge variant="secondary" className="text-xs">
                    {user.roles[0].display_name ||
                      user.roles[0].name ||
                      "Administrator"}
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* System Summary */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">
              System Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Total Content</span>
              <span className="font-semibold">
                {stats.tracks + stats.modules + stats.lessons} items
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Modules/Track</span>
              <span className="font-semibold">
                {stats.tracks > 0 ?
                  Math.round(stats.modules / stats.tracks)
                : 0}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Avg Lessons/Module</span>
              <span className="font-semibold">
                {stats.modules > 0 ?
                  Math.round(stats.lessons / stats.modules)
                : 0}
              </span>
            </div>
            <div className="flex justify-between text-sm pt-2 border-t">
              <span className="text-muted-foreground">Active Users</span>
              <span className="font-semibold">{stats.users}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Cards Grid */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Platform Statistics</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {statsCards.map((stat) => {
            const Icon = stat.icon;
            return (
              <Link key={stat.title} to={stat.link}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800">
                        <Icon className="h-4 w-4" />
                      </div>
                    </div>
                    <div className="text-2xl font-bold mb-1">{stat.value}</div>
                    <div className="text-xs text-muted-foreground">
                      {stat.title}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tracks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Recent Tracks
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tracks" className="text-xs">
                View All
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTracks.length === 0 ?
              <p className="text-sm text-muted-foreground py-4">
                Belum ada tracks tersedia.
              </p>
            : <div className="space-y-2">
                {recentTracks.map((track) => (
                  <Link
                    key={track.id}
                    to={`/tracks/${track.slug}`}
                    className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border">
                    <div className="p-2 rounded bg-slate-100 dark:bg-slate-800">
                      <BookOpen className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {track.name}
                      </p>
                      <p className="text-xs text-muted-foreground line-clamp-1">
                        {track.description}
                      </p>
                    </div>
                  </Link>
                ))}
              </div>
            }
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <Activity className="h-4 w-4" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                asChild>
                <Link to="/tracks">
                  <div className="flex flex-col items-start gap-1 w-full">
                    <BookOpen className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium">Manage Tracks</span>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                asChild>
                <Link to="/modules">
                  <div className="flex flex-col items-start gap-1 w-full">
                    <Package className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium">Manage Modules</span>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                asChild>
                <Link to="/lessons">
                  <div className="flex flex-col items-start gap-1 w-full">
                    <FileText className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium">Manage Lessons</span>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                asChild>
                <Link to="/student/challenges">
                  <div className="flex flex-col items-start gap-1 w-full">
                    <Trophy className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium">View Challenges</span>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                asChild>
                <Link to="/study-classes">
                  <div className="flex flex-col items-start gap-1 w-full">
                    <School className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium">Study Classes</span>
                  </div>
                </Link>
              </Button>
              <Button
                variant="outline"
                className="justify-start h-auto py-3"
                asChild>
                <Link to="/users">
                  <div className="flex flex-col items-start gap-1 w-full">
                    <Users className="h-4 w-4 mb-1" />
                    <span className="text-xs font-medium">Manage Users</span>
                  </div>
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
