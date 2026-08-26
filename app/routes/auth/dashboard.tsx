import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { BookOpen, Package, FileText, Trophy, Users, School, Activity, ArrowRight } from "lucide-react";

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

        // Fetch all data in parallel
        const [tracksRes, modulesRes, lessonsRes, challengesRes, studyClassesRes, usersRes] = await Promise.all([
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
          const data = Array.isArray(tracksRes.data) ? tracksRes.data : tracksRes.data.data || [];
          newStats.tracks = data.length;
          setRecentTracks(data.slice(0, 5));
        }

        if (modulesRes?.data) {
          const data = Array.isArray(modulesRes.data) ? modulesRes.data : modulesRes.data.data || [];
          newStats.modules = data.length;
        }

        if (lessonsRes?.data) {
          const data = Array.isArray(lessonsRes.data) ? lessonsRes.data : lessonsRes.data.data || [];
          newStats.lessons = data.length;
        }

        if (challengesRes?.data) {
          const data = Array.isArray(challengesRes.data) ? challengesRes.data : challengesRes.data.data || [];
          newStats.challenges = data.length;
        }

        if (studyClassesRes?.data) {
          const data = Array.isArray(studyClassesRes.data) ? studyClassesRes.data : studyClassesRes.data.data || [];
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
      } finally {
        setLoading(false);
      }
    }

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-8 animate-in fade-in-50 duration-300">
        {/* Header Skeleton */}
        <div className="flex items-start justify-between">
          <div className="space-y-3">
            <div className="h-9 w-80 bg-muted animate-pulse rounded-lg" />
            <div className="h-5 w-48 bg-muted animate-pulse rounded-md" />
          </div>
          <div className="flex items-center gap-3">
            <div className="h-14 w-14 bg-muted animate-pulse rounded-full" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted animate-pulse rounded-md" />
              <div className="h-3 w-24 bg-muted animate-pulse rounded-md" />
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="shadow-sm border-border/40">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-3">
                  <div className="h-10 w-10 bg-muted animate-pulse rounded-full" />
                </div>
                <div className="h-8 w-16 bg-muted animate-pulse rounded-md mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded-md" />
              </CardContent>
            </Card>
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
      link: "/challenges",
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
      link: "/user-management",
    },
  ];

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Section */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {user?.display_name?.trim() || user?.name || "Admin"}
          </h1>
          <p className="text-muted-foreground">Dashboard Management & Overview 🚀</p>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Avatar className="h-14 w-14 shadow-sm">
            <AvatarImage src={typeof user?.avatar === "string" ? user.avatar : user?.avatar && "url" in user.avatar ? user.avatar.url : undefined} alt={user?.display_name || user?.name || "Admin"} />
            <AvatarFallback className="text-lg font-semibold">{(user?.display_name || user?.name)?.charAt(0)?.toUpperCase() || "A"}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{user?.display_name?.trim() || user?.name || "Admin"}</div>
            {user?.roles && user.roles.length > 0 && <div className="text-sm text-muted-foreground">{user.roles[1].name || "Administrator"}</div>}
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-500/10 rounded-full">
                <BookOpen className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.tracks}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Tracks</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-sky-500/10 rounded-full">
                <Package className="h-5 w-5 text-sky-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.modules}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Modules</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-full">
                <FileText className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.lessons}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Lessons</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-purple-500/10 rounded-full">
                <Trophy className="h-5 w-5 text-purple-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.challenges}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Challenges</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-cyan-500/10 rounded-full">
                <School className="h-5 w-5 text-cyan-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.studyClasses}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Classes</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-green-500/10 rounded-full">
                <Users className="h-5 w-5 text-green-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{stats.users}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Users</div>
          </CardContent>
        </Card>
      </div>

      {/* Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Tracks */}
        <Card className="shadow-sm border-border/40">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 bg-blue-500/10 rounded-full">
                <BookOpen className="h-4 w-4 text-blue-500" />
              </div>
              Recent Tracks
            </CardTitle>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/tracks" className="text-xs flex items-center gap-1">
                View All
                <ArrowRight className="h-3 w-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentTracks.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">Belum ada tracks tersedia.</p>
            ) : (
              <div className="space-y-2">
                {recentTracks.map((track) => (
                  <Link key={track.id} to={`/tracks/${track.slug}`} className="flex items-start gap-3 p-3 rounded-lg hover:bg-muted/50 transition-colors border border-border/40">
                    <div className="p-2 bg-blue-500/10 rounded-full">
                      <BookOpen className="h-4 w-4 text-blue-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{track.name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{track.description}</p>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card className="shadow-sm border-border/40">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold flex items-center gap-2">
              <div className="p-2 bg-indigo-500/10 rounded-full">
                <Activity className="h-4 w-4 text-indigo-500" />
              </div>
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-3">
              <Button variant="outline" className="justify-start h-auto py-3 hover:bg-blue-500/5 hover:border-blue-500/20 transition-colors" asChild>
                <Link to="/admin/tracks">
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-1.5 bg-blue-500/10 rounded-full">
                      <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                    </div>
                    <span className="text-xs font-medium">Manage Tracks</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 hover:bg-sky-500/5 hover:border-sky-500/20 transition-colors" asChild>
                <Link to="/admin/modules">
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-1.5 bg-sky-500/10 rounded-full">
                      <Package className="h-3.5 w-3.5 text-sky-500" />
                    </div>
                    <span className="text-xs font-medium">Manage Modules</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 hover:bg-indigo-500/5 hover:border-indigo-500/20 transition-colors" asChild>
                <Link to="/admin/lessons">
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-1.5 bg-indigo-500/10 rounded-full">
                      <FileText className="h-3.5 w-3.5 text-indigo-500" />
                    </div>
                    <span className="text-xs font-medium">Manage Lessons</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 hover:bg-purple-500/5 hover:border-purple-500/20 transition-colors" asChild>
                <Link to="/challenges">
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-1.5 bg-purple-500/10 rounded-full">
                      <Trophy className="h-3.5 w-3.5 text-purple-500" />
                    </div>
                    <span className="text-xs font-medium">Manage Challenges</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 hover:bg-cyan-500/5 hover:border-cyan-500/20 transition-colors" asChild>
                <Link to="/admin/study-classes">
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-1.5 bg-cyan-500/10 rounded-full">
                      <School className="h-3.5 w-3.5 text-cyan-500" />
                    </div>
                    <span className="text-xs font-medium">Study Classes</span>
                  </div>
                </Link>
              </Button>
              <Button variant="outline" className="justify-start h-auto py-3 hover:bg-green-500/5 hover:border-green-500/20 transition-colors" asChild>
                <Link to="/user-management">
                  <div className="flex items-center gap-2 w-full">
                    <div className="p-1.5 bg-green-500/10 rounded-full">
                      <Users className="h-3.5 w-3.5 text-green-500" />
                    </div>
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
