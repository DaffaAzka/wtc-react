import { useEffect, useState } from "react";
import { Link } from "react-router";
import { useAuth } from "@/contexts/auth";
import { api } from "@/lib/axios";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

interface Track {
  id: string;
  name: string;
  description: string;
  slug: string;
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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        setError(null);

        // Fetch all data in parallel using axios
        const [tracksRes, challengesRes, classesRes] = await Promise.all([
          api.get("/tracks").catch(() => null),
          api.get("/challenges").catch(() => null),
          api.get("/study-classes").catch(() => null),
        ]);

        // Parse axios responses
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
        setError(err instanceof Error ? err.message : "Failed to load data");
        console.error("Error fetching dashboard data:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-64 mb-2" />
          <Skeleton className="h-4 w-48" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">
          Selamat datang, {user?.display_name?.trim() || "Student"}
        </h1>
        <p className="text-muted-foreground">Overview pembelajaran kamu</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Kelas Saya
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studyClasses.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Learning Paths
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{tracks.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Tantangan
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{challenges.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Learning Paths */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Learning Paths</h2>
          <Button variant="ghost" asChild>
            <Link to="/student/learning-path">Lihat Semua</Link>
          </Button>
        </div>

        {tracks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Belum ada learning path tersedia.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tracks.slice(0, 4).map((track) => (
              <Card key={track.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{track.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {track.description}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4" asChild>
                    <Link to={`/student/learning-path/${track.slug}`}>
                      Lihat Detail
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Study Classes */}
      {studyClasses.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold">Kelas Saya</h2>
            <Button variant="ghost" asChild>
              <Link to="/student/study-classes">Lihat Semua</Link>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {studyClasses.slice(0, 4).map((studyClass) => (
              <Card key={studyClass.id} className="hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-base">{studyClass.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {studyClass.description}
                  </p>
                  <Button variant="outline" size="sm" className="mt-4">
                    Lanjutkan Belajar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Challenges */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Tantangan</h2>
          <Button variant="ghost" asChild>
            <Link to="/student/challenges">Lihat Semua</Link>
          </Button>
        </div>

        {challenges.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-muted-foreground">Belum ada tantangan tersedia.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {challenges.slice(0, 5).map((challenge) => (
              <Card key={challenge.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="font-medium">{challenge.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-1">
                        {challenge.description}
                      </p>
                      <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                        <span className="capitalize">{challenge.difficulty}</span>
                        <span>•</span>
                        <span>{challenge.points} poin</span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      Mulai
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
