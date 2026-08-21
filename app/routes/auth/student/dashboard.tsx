import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface Track {
  id: string;
  name: string;
  description: string;
  slug: string;
  image_url?: string;
  modules_count?: number;
}

interface Challenge {
  id: string;
  title: string;
  description: string;
  difficulty: string;
  points: number;
}

interface StudyClass {
  id: string;
  name: string;
  description: string;
}

export default function Dashboard() {
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [challenges, setChallenges] = useState<Challenge[]>([]);
  const [studyClasses, setStudyClasses] = useState<StudyClass[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);

        const [tracksRes, challengesRes, classesRes] = await Promise.all([
          api.get("/tracks").catch(() => null),
          api.get("/challenges").catch(() => null),
          api.get("/study-classes").catch(() => null),
        ]);

        if (tracksRes?.data) {
          const data = tracksRes.data;
          setTracks(Array.isArray(data) ? data : data.data || []);
        }

        if (challengesRes?.data) {
          const data = challengesRes.data;
          setChallenges(Array.isArray(data) ? data : data.data || []);
        }

        if (classesRes?.data) {
          const data = classesRes.data;
          setStudyClasses(Array.isArray(data) ? data : data.data || []);
        }
      } catch (err) {
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "Selamat Pagi";
    if (hour >= 12 && hour < 15) return "Selamat Siang";
    if (hour >= 15 && hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  // Calculate profile completion (mock)
  const calculateProfileCompletion = () => {
    let completion = 0;
    if (user?.display_name) completion += 25;
    if (user?.email) completion += 25;
    if (user?.avatar) completion += 25;
    if (user?.study_class_id) completion += 25;
    return completion;
  };

  const profileCompletion = calculateProfileCompletion();

  if (loading) {
    return (
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-4 space-y-4">
          <Skeleton className="h-64" />
          <Skeleton className="h-48" />
        </div>
        <div className="col-span-8 space-y-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {getGreeting()} {user?.display_name?.trim() || "Student"}!
        </h1>
        <p className="text-sm text-muted-foreground">
          Semoga aktivitas belajarmu menyenangkan.
        </p>
      </div>

      {/* New Layout Structure - No Empty Space */}
      <div className="space-y-6">
        {/* Top Row: Profile + Stats Side by Side */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* User Profile Card - Dark */}
          <Card className="bg-slate-900 dark:bg-slate-950 text-white border-slate-800">
            <CardContent className="p-6">
              <div className="flex flex-col items-center text-center space-y-4">
                {/* Avatar */}
                <div className="w-20 h-20 rounded-full bg-slate-700 flex items-center justify-center text-2xl font-bold">
                  {user?.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.display_name || "User"}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span>{user?.display_name?.charAt(0)?.toUpperCase() || "U"}</span>
                  )}
                </div>

                <div>
                  <h3 className="font-semibold text-lg mb-1">
                    {user?.display_name?.trim() || "Student"}
                  </h3>
                  <p className="text-sm text-slate-300 mb-1">
                    {user?.email || ""}
                  </p>
                  {user?.roles && user.roles.length > 0 && (
                    <Badge variant="secondary" className="text-xs mt-2">
                      {user.roles[0].display_name || user.roles[0].name}
                    </Badge>
                  )}
                </div>

                <Button variant="secondary" size="sm" asChild className="w-full">
                  <Link to="/student/profile">Lihat Profil</Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stats Card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div>
                <div className="text-sm font-medium text-muted-foreground mb-1">
                  Total Poin
                </div>
                <div className="text-3xl font-bold">{user?.points || 0}</div>
              </div>

              <div className="pt-4 border-t space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Learning Paths</span>
                  <span className="font-semibold">{tracks.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Tantangan</span>
                  <span className="font-semibold">{challenges.length}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Kelas Aktif</span>
                  <span className="font-semibold">{studyClasses.length}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Full Width Content Sections Below */}
        <div className="space-y-6">
          {/* Aktivitas Belajar */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Aktivitas Belajar</h2>
              {tracks.length > 3 && (
                <Link
                  to="/student/learning-path"
                  className="text-sm text-primary hover:underline"
                >
                  Selengkapnya
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {tracks.slice(0, 3).map((track) => (
                <Card key={track.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="text-sm text-muted-foreground mb-1">
                          Sedang dipelajari
                        </div>
                        <h3 className="font-semibold mb-1">{track.name}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1">
                          {track.description}
                        </p>
                      </div>
                      <Button variant="link" size="sm" className="text-primary" asChild>
                        <Link to={`/student/learning-path/${track.slug}`}>
                          Lanjutkan
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {tracks.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      Belum ada aktivitas belajar. Mulai dengan memilih learning path!
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Learning Paths Available */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Learning Path</h2>
              {tracks.length > 4 && (
                <Link
                  to="/student/learning-path"
                  className="text-sm text-primary hover:underline"
                >
                  Selengkapnya
                </Link>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tracks.slice(0, 4).map((track) => (
                <Card key={track.id} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <Link to={`/student/learning-path/${track.slug}`} className="block">
                    {track.image_url && (
                      <div className="relative h-40 bg-muted">
                        <img
                          src={track.image_url}
                          alt={track.name}
                          className="w-full h-full object-cover"
                        />
                        {track.modules_count !== undefined && (
                          <Badge className="absolute top-3 right-3 bg-white/95 text-black hover:bg-white text-xs">
                            {track.modules_count} Modules
                          </Badge>
                        )}
                      </div>
                    )}
                    <CardContent className="p-4">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-1">
                        {track.name}
                      </h3>
                      <p className="text-xs text-muted-foreground line-clamp-2 mb-3">
                        {track.description}
                      </p>
                      <div className="text-xs text-primary font-medium">
                        Lihat Detail →
                      </div>
                    </CardContent>
                  </Link>
                </Card>
              ))}
            </div>
          </div>

          {/* Tantangan */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold">Challenge yang Anda ikuti</h2>
              {challenges.length > 3 && (
                <Link
                  to="/student/challenges"
                  className="text-sm text-primary hover:underline"
                >
                  Selengkapnya
                </Link>
              )}
            </div>

            <div className="space-y-3">
              {challenges.slice(0, 3).map((challenge) => (
                <Card key={challenge.id} className="shadow-sm">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <h3 className="font-semibold mb-1">{challenge.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-1 mb-2">
                          {challenge.description}
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs capitalize">
                            {challenge.difficulty}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            • {challenge.points} poin
                          </span>
                        </div>
                      </div>
                      <Button size="sm" asChild>
                        <Link to={`/student/challenges/${challenge.id}`}>Mulai</Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {challenges.length === 0 && (
                <Card>
                  <CardContent className="p-8 text-center">
                    <p className="text-muted-foreground text-sm">
                      Telusuri challenge dari WebTech TC
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          {/* Kelas Saya */}
          {studyClasses.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Kelas Saya</h2>
                {studyClasses.length > 2 && (
                  <Link
                    to="/student/study-classes"
                    className="text-sm text-primary hover:underline"
                  >
                    Selengkapnya
                  </Link>
                )}
              </div>

              <div className="space-y-3">
                {studyClasses.slice(0, 2).map((studyClass) => (
                  <Card key={studyClass.id} className="shadow-sm">
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-1">{studyClass.name}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {studyClass.description}
                      </p>
                      <Button variant="outline" size="sm" className="w-full">
                        Lanjutkan Belajar
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
