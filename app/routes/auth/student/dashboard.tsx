import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/axios";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { ArrowRight, BookOpen, Award, TrendingUp, Target } from "lucide-react";

// Helper function to generate consistent pattern background based on text
function getPatternBackground(text: string): string {
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = (hash << 5) - hash + text.charCodeAt(i);
    hash = hash & hash;
  }

  // Map hash to theme colors (blue variations and grey)
  const colors = [
    { primary: "rgba(59, 130, 246, 0.1)", secondary: "rgba(59, 130, 246, 0.05)" }, // blue
    { primary: "rgba(14, 165, 233, 0.1)", secondary: "rgba(14, 165, 233, 0.05)" }, // sky
    { primary: "rgba(99, 102, 241, 0.1)", secondary: "rgba(99, 102, 241, 0.05)" }, // indigo
    { primary: "rgba(100, 116, 139, 0.1)", secondary: "rgba(100, 116, 139, 0.05)" }, // slate
  ];

  const colorIndex = Math.abs(hash) % colors.length;
  const selectedColor = colors[colorIndex];

  return `radial-gradient(circle at 20% 50%, ${selectedColor.primary} 0%, transparent 50%),
          radial-gradient(circle at 80% 80%, ${selectedColor.primary} 0%, transparent 50%),
          radial-gradient(circle at 40% 20%, ${selectedColor.secondary} 0%, transparent 50%),
          radial-gradient(circle at 90% 30%, ${selectedColor.secondary} 0%, transparent 50%),
          radial-gradient(circle at 10% 80%, ${selectedColor.primary} 0%, transparent 50%)`;
}

interface DashboardProfile {
  id: string;
  display_name: string;
  nickname: string;
  points: number;
  study_class: {
    name: string;
  } | null;
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
  progress: {
    percent: number;
  };
}

interface ContinueLearning {
  track: {
    title: string;
    slug: string;
  };
  module: {
    title: string;
  };
  lesson: {
    title: string;
    slug: string;
  };
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

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get("/my/dashboard");
        setData(response.data?.data || response.data);
      } catch (error) {
        // Error silently handled
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

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
        <div className="grid grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="shadow-sm">
              <CardContent className="p-6">
                <div className="h-8 w-20 bg-muted animate-pulse rounded-md mb-2" />
                <div className="h-3 w-24 bg-muted animate-pulse rounded-md" />
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tracks Skeleton */}
        <div className="space-y-4">
          <div className="h-6 w-40 bg-muted animate-pulse rounded-md" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="shadow-sm overflow-hidden">
                <div className="h-36 w-full bg-muted animate-pulse" />
                <CardContent className="p-4">
                  <div className="h-5 w-3/4 bg-muted animate-pulse rounded-md mb-3" />
                  <div className="h-3 w-1/2 bg-muted animate-pulse rounded-md mb-2" />
                  <div className="h-2 w-full bg-muted animate-pulse rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <p className="text-muted-foreground">Gagal memuat data dashboard</p>
          <Button onClick={() => window.location.reload()} variant="outline" size="sm">
            Coba Lagi
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in-50 duration-300">
      {/* Welcome Section */}
      <div className="flex items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">
            {getGreeting()}, {data.profile.display_name}
          </h1>
          <p className="text-muted-foreground">Semangat belajar hari ini! 🚀</p>
        </div>

        <div className="hidden lg:flex items-center gap-4">
          <Avatar className="h-14 w-14 shadow-sm">
            <AvatarImage src={typeof user?.avatar === 'string' ? user.avatar : (user?.avatar && 'url' in user.avatar ? user.avatar.url : undefined)} alt={data.profile.display_name} />
            <AvatarFallback className="text-lg font-semibold">{data.profile.display_name?.charAt(0)?.toUpperCase()}</AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold">{data.profile.display_name}</div>
            {data.profile.study_class && <div className="text-sm text-muted-foreground">{data.profile.study_class.name}</div>}
          </div>
        </div>
      </div>

      {/* Continue Learning Hero Card */}
      {data.continue_learning && (
        <Card className="relative overflow-hidden border-border/40 shadow-sm min-h-55">
          {/* Background Layer - Image or Pattern */}
          {(() => {
            const trackImage = data.tracks.find((t) => t.slug === data.continue_learning?.track.slug)?.image_url;

            if (trackImage) {
              return (
                <>
                  <img
                    src={trackImage}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                  <div className="absolute inset-0 bg-linear-to-tr from-background via-background/80 to-blue-800/20" />
                </>
              );
            } else {
              return <div className="absolute inset-0" style={{ background: getPatternBackground(data.continue_learning?.track.title || "") }} />;
            }
          })()}

          {/* Content Layer */}
          <CardContent className="relative z-10 p-8 h-full flex flex-col justify-center">
            <div className="flex items-center justify-between gap-6">
              <div className="flex-1 space-y-3">
                <div className="flex items-center gap-2 text-blue-500">
                  <BookOpen className="h-5 w-5" />
                  <span className="text-sm font-medium uppercase tracking-wide">Lanjutkan Belajar</span>
                </div>
                <div>
                  <div className="text-2xl font-bold mb-1">{data.continue_learning.lesson.title}</div>
                  <div className="text-sm text-muted-foreground">
                    {data.continue_learning.track.title} • {data.continue_learning.module.title}
                  </div>
                </div>
              </div>
              <Button size="lg" asChild className="shadow-sm">
                <Link to={`/student/classes/${data.continue_learning.track.slug}`}>
                  Lanjutkan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-blue-500/10 rounded-full">
                <Award className="h-5 w-5 text-blue-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{data.profile.points}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Total Poin</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-sky-500/10 rounded-full">
                <BookOpen className="h-5 w-5 text-sky-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{data.stats.active_tracks}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Active Tracks</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-indigo-500/10 rounded-full">
                <Target className="h-5 w-5 text-indigo-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{data.stats.total_completed_challenges}</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Challenges Done</div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border/40">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 bg-cyan-500/10 rounded-full">
                <TrendingUp className="h-5 w-5 text-cyan-500" />
              </div>
            </div>
            <div className="text-3xl font-bold mb-1">{Math.round(data.stats.overall_progress)}%</div>
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Overall Progress</div>
          </CardContent>
        </Card>
      </div>

      {/* My Active Tracks */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">Learning Paths Aktif</h2>
          {data.tracks.length > 4 && (
            <Button variant="link" size="sm" asChild className="gap-1">
              <Link to="/student/progress">
                Lihat Semua
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </div>

        {data.tracks.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
              <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
              <p className="text-muted-foreground mb-4">Belum ada learning path yang aktif</p>
              <Button variant="outline" size="sm" asChild>
                <Link to="/student/classes">Jelajahi Learning Paths</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.tracks.slice(0, 3).map((track) => (
              <Link key={track.id} to={`/student/classes/${track.slug}`}>
                <Card className="shadow-sm p-0 hover:shadow-md transition-all duration-200 border-border/40 hover:border-border group overflow-hidden">
                  {track.image_url && (
                    <div className="h-48 w-full overflow-hidden shrink-0" style={{ background: getPatternBackground(track.title) }}>
                      <img
                        src={track.image_url}
                        alt={track.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    </div>
                  )}
                  <CardContent className="pb-8 pt-2 px-5 space-y-2">
                    <div>
                      <h3 className="font-semibold text-lg mb-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors line-clamp-1">{track.title}</h3>
                      <div className="text-sm text-muted-foreground">{Math.round(track.progress.percent)}% selesai</div>
                    </div>
                    <Progress value={track.progress.percent} className="h-2" />
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Tip of The Day */}
      <Card className="bg-gradient-to-r from-blue-50/50 to-sky-50/50 dark:from-blue-950/20 dark:to-sky-950/30 border-blue-200/50 dark:border-blue-800/30 shadow-sm">
        <CardContent className="p-6">
          <div className="flex items-start gap-3">
            <div className="text-2xl">💡</div>
            <div className="flex-1">
              <div className="font-semibold text-sm mb-1">Tip of The Day</div>
              <p className="text-sm text-muted-foreground italic">Konsistensi adalah kunci. Luangkan 30 menit setiap hari untuk belajar hal baru!</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
