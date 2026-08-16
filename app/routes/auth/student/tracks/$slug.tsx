import { useParams, Link } from "react-router";
import { useGetTrack } from "@/hooks/tracks";
import { useGetModulesByTrack } from "@/hooks/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/students/components/empty-state";
import { ArrowLeft, BookOpen, PlayCircle } from "lucide-react";

export default function TrackDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { track, loading: trackLoading, error: trackError } = useGetTrack(slug!);
  const { modules, loading: modulesLoading, error: modulesError } = useGetModulesByTrack(slug!);

  const loading = trackLoading || modulesLoading;
  const error = trackError || modulesError;

  if (error) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Gagal memuat data"
          description={error.message || "Terjadi kesalahan saat memuat detail kelas."}
        />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-10 w-48" />
        <div className="space-y-4">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-20 w-full" />
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <Skeleton key={i} className="h-24 w-full" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!track) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>
        <EmptyState
          icon={BookOpen}
          title="Kelas tidak ditemukan"
          description="Kelas yang kamu cari tidak ditemukan atau sudah tidak tersedia."
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to="/student/classes">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Katalog
        </Link>
      </Button>

      {/* Track Header */}
      <Card>
        <CardContent className="p-0">
          {/* Track Image */}
          {track.image_url && (
            <div className="aspect-video w-full overflow-hidden">
              <img
                src={track.image_url}
                alt={track.title}
                className="h-full w-full object-cover"
              />
            </div>
          )}

          <div className="p-6">
            {/* Title and Meta */}
            <div className="space-y-3">
              <h1 className="text-3xl font-bold">{track.title}</h1>
              
              <div className="flex items-center gap-2">
                {track.modules_count !== null && track.modules_count !== undefined && (
                  <Badge variant="secondary">
                    {track.modules_count} Modul
                  </Badge>
                )}
                <Badge variant="outline">
                  {modules.length} Modul Tersedia
                </Badge>
              </div>

              {/* Description */}
              {track.description && (
                <p className="text-muted-foreground leading-relaxed">
                  {track.description}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Modules Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-semibold">Daftar Modul</h2>
        </div>

        {modules.length === 0 ? (
          <EmptyState
            icon={BookOpen}
            title="Belum ada modul"
            description="Modul untuk kelas ini sedang dalam pengembangan."
          />
        ) : (
          <div className="space-y-3">
            {modules.map((module, index) => (
              <Card key={module.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <Badge variant="outline" className="font-mono">
                          {String(module.order ?? index + 1).padStart(2, '0')}
                        </Badge>
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                      </div>
                    </div>
                    <Button size="sm" variant="ghost">
                      <PlayCircle className="h-4 w-4 mr-2" />
                      Mulai
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Action Button */}
      {modules.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button size="lg">
            <PlayCircle className="h-5 w-5 mr-2" />
            Mulai Belajar
          </Button>
        </div>
      )}
    </div>
  );
}