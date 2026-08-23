import { useState } from "react";
import { Link, useParams } from "react-router";
import { useGetTrack } from "@/hooks/tracks";
import { useGetModulesByTrack } from "@/hooks/modules";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/students/components/empty-state";
import { EnrollmentConfirmationModal } from "@/students/components/enrollment-confirmation-modal";
import {
  useEnrollTrack,
  useMyTracks,
  useUnenrollTrack,
} from "@/students/hooks/enrollments";
import {
  ArrowLeft,
  Award,
  BookOpen,
  CheckCircle,
  CheckCircle2,
  Clock,
  Loader2,
  PlayCircle,
} from "lucide-react";

export default function TrackDetail() {
  const { slug } = useParams<{ slug: string }>();
  const {
    track,
    loading: trackLoading,
    error: trackError,
  } = useGetTrack(slug ?? "");
  const {
    modules,
    loading: modulesLoading,
    error: modulesError,
  } = useGetModulesByTrack(slug ?? "");
  const {
    myTracks,
    loading: myTracksLoading,
    error: myTracksError,
  } = useMyTracks();
  const enrollMutation = useEnrollTrack();
  const unenrollMutation = useUnenrollTrack();
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loading = trackLoading || modulesLoading || myTracksLoading;
  const error = trackError || modulesError || myTracksError;
  const isEnrolled =
    slug ? myTracks.some((myTrack) => myTrack.slug === slug) : false;

  const handleEnrollClick = () => {
    if (!slug) return;
    setShowConfirmModal(true);
  };

  const handleConfirmEnroll = async () => {
    if (!slug) return;
    await enrollMutation.mutateAsync(slug);
    setShowConfirmModal(false);
  };

  const handleUnenroll = async () => {
    if (!slug) return;
    await unenrollMutation.mutateAsync(slug);
  };

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
          description={
            error.message || "Terjadi kesalahan saat memuat detail kelas."
          }
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
            {Array.from({ length: 3 }).map((_, index) => (
              <Skeleton key={index} className="h-24 w-full" />
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

  if (!isEnrolled) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" asChild>
          <Link to="/student/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {track.image_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={track.image_url}
                      alt={track.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="space-y-4 p-6">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="secondary">{modules.length} Modul</Badge>
                      <Badge variant="outline" className="gap-1">
                        <Clock className="h-3 w-3" />
                        Self-Paced
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{track.title}</h1>
                  </div>

                  <Separator />

                  <div>
                    <h2 className="mb-2 text-lg font-semibold">
                      Tentang Kelas Ini
                    </h2>
                    {track.description ?
                      <p className="leading-relaxed text-muted-foreground">
                        {track.description}
                      </p>
                    : <p className="italic text-muted-foreground">
                        Deskripsi kelas akan segera ditambahkan.
                      </p>
                    }
                  </div>

                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold">
                      Apa yang Akan Kamu Pelajari
                    </h2>
                    <div className="grid gap-2">
                      {modules.slice(0, 5).map((module) => (
                        <div key={module.id} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                          <span className="text-sm text-muted-foreground">
                            {module.title}
                          </span>
                        </div>
                      ))}
                      {modules.length > 5 && (
                        <p className="pl-7 text-sm text-muted-foreground">
                          Dan {modules.length - 5} modul lainnya...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Kurikulum Kelas</CardTitle>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ?
                  <p className="py-4 text-center text-sm text-muted-foreground">
                    Modul sedang dalam persiapan
                  </p>
                : <div className="space-y-2">
                    {modules.map((module, index) => (
                      <div
                        key={module.id}
                        className="flex items-center gap-3 rounded-lg border bg-muted/30 p-3">
                        <Badge variant="outline" className="shrink-0 font-mono">
                          {String(module.order ?? index + 1).padStart(2, "0")}
                        </Badge>
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-medium">{module.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6">
              <CardContent className="space-y-4 p-6">
                <div className="py-4 text-center">
                  <div className="mb-3 inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">Gratis</p>
                  <p className="text-sm text-muted-foreground">
                    Akses selamanya
                  </p>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h3 className="text-sm font-semibold">Kelas ini mencakup:</h3>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>{modules.length} Modul pembelajaran</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Akses selamanya</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Belajar dengan tempo sendiri</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                      <span>Sertifikat penyelesaian</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleEnrollClick}
                  disabled={enrollMutation.isPending}>
                  {enrollMutation.isPending ?
                    "Memproses..."
                  : "Ambil Kelas Sekarang"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  Dengan mengambil kelas ini, Anda menyetujui untuk belajar dan
                  menyelesaikan materi.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        <EnrollmentConfirmationModal
          open={showConfirmModal}
          onOpenChange={setShowConfirmModal}
          onConfirm={handleConfirmEnroll}
          loading={enrollMutation.isPending}
          trackTitle={track.title}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Button variant="ghost" asChild>
        <Link to="/student/classes">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Katalog
        </Link>
      </Button>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="h-full">
          <CardContent className="flex h-full flex-col p-0">
            {track.image_url && (
              <div className="aspect-video w-full overflow-hidden">
                <img
                  src={track.image_url}
                  alt={track.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="flex flex-1 flex-col gap-4 p-6">
              <div className="space-y-3">
                <h1 className="text-3xl font-bold">{track.title}</h1>

                <div className="flex flex-wrap items-center gap-2">
                  {track.modules_count !== null &&
                    track.modules_count !== undefined && (
                      <Badge variant="secondary">
                        {track.modules_count} Modul
                      </Badge>
                    )}
                  <Badge variant="outline">
                    {modules.length} Modul Tersedia
                  </Badge>
                  <Badge variant="default" className="gap-1">
                    <CheckCircle className="h-3 w-3" />
                    Terdaftar
                  </Badge>
                </div>

                {track.description && (
                  <p className="leading-relaxed text-muted-foreground">
                    {track.description}
                  </p>
                )}

                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={handleUnenroll}
                    disabled={unenrollMutation.isPending}>
                    {unenrollMutation.isPending ?
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Memproses...
                      </>
                    : "Keluar dari Track"}
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="flex h-full flex-col">
          <CardHeader className="shrink-0">
            <CardTitle className="text-2xl">Daftar Modul</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
            {modules.length === 0 ?
              <EmptyState
                icon={BookOpen}
                title="Belum ada modul"
                description="Modul untuk kelas ini sedang dalam pengembangan."
              />
            : <div className="space-y-3">
                {modules.map((module, index) => (
                  <Card
                    key={module.id}
                    className="transition-shadow hover:shadow-md">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="shrink-0 font-mono">
                          {String(module.order ?? index + 1).padStart(2, "0")}
                        </Badge>
                        <CardTitle className="truncate text-lg">
                          {module.title}
                        </CardTitle>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            }
          </CardContent>
        </Card>
      </div>

      {modules.length > 0 && (
        <div className="flex justify-center pt-4">
          <Button size="lg" asChild>
            <Link to={`/student/classes/${slug}/${modules[0].slug}`}>
              <PlayCircle className="h-5 w-5 mr-2" />
              Mulai Belajar
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
