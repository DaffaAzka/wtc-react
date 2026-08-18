import { useParams, Link, useNavigate } from "react-router";
import { useGetTrack } from "@/hooks/tracks";
import { useGetModulesByTrack } from "@/hooks/modules";
import { useMyTracks, useEnrollTrack } from "@/students/hooks/enrollments";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { EmptyState } from "@/students/components/empty-state";
import { EnrollmentConfirmationModal } from "@/students/components/enrollment-confirmation-modal";
import { ArrowLeft, BookOpen, PlayCircle, CheckCircle2, Clock, Award } from "lucide-react";
import { useState } from "react";

export default function TrackDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { track, loading: trackLoading, error: trackError } = useGetTrack(slug!);
  const { modules, loading: modulesLoading, error: modulesError } = useGetModulesByTrack(slug!);
  const { myTracks, loading: myTracksLoading } = useMyTracks();
  const enrollMutation = useEnrollTrack();

  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const loading = trackLoading || modulesLoading || myTracksLoading;
  const error = trackError || modulesError;

  // Check if user is enrolled in this track
  const isEnrolled = myTracks.some((mt) => mt.slug === slug);

  const handleEnrollClick = () => {
    setShowConfirmModal(true);
  };

  const handleConfirmEnroll = async () => {
    enrollMutation.mutate(slug!, {
      onSuccess: () => {
        setShowConfirmModal(false);
        // Redirect to track catalog after successful enrollment
        setTimeout(() => {
          navigate("/student/classes");
        }, 1500);
      },
    });
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

  // NOT ENROLLED VIEW - Show detailed information with enrollment option
  if (!isEnrolled) {
    return (
      <div className="space-y-6">
        {/* Back Button */}
        <Button variant="ghost" asChild>
          <Link to="/student/classes">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Katalog
          </Link>
        </Button>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Track Details */}
          <div className="lg:col-span-2 space-y-6">
            {/* Track Header Card */}
            <Card>
              <CardContent className="p-0">
                {/* Track Image */}
                {track.image_url && (
                  <div className="aspect-video w-full overflow-hidden rounded-t-lg">
                    <img
                      src={track.image_url}
                      alt={track.title}
                      className="h-full w-full object-cover"
                    />
                  </div>
                )}

                <div className="p-6 space-y-4">
                  {/* Title and Badges */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="secondary">
                        {modules.length} Modul
                      </Badge>
                      <Badge variant="outline">
                        <Clock className="h-3 w-3 mr-1" />
                        Self-Paced
                      </Badge>
                    </div>
                    <h1 className="text-3xl font-bold">{track.title}</h1>
                  </div>

                  <Separator />

                  {/* Description */}
                  <div>
                    <h2 className="text-lg font-semibold mb-2">Tentang Kelas Ini</h2>
                    {track.description ? (
                      <p className="text-muted-foreground leading-relaxed">
                        {track.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        Deskripsi kelas akan segera ditambahkan.
                      </p>
                    )}
                  </div>

                  {/* Placeholder for future content */}
                  <div className="space-y-3">
                    <h2 className="text-lg font-semibold">Apa yang Akan Kamu Pelajari</h2>
                    <div className="grid gap-2">
                      {modules.slice(0, 5).map((module, index) => (
                        <div key={module.id} className="flex items-start gap-2">
                          <CheckCircle2 className="h-5 w-5 text-primary mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">
                            {module.title}
                          </span>
                        </div>
                      ))}
                      {modules.length > 5 && (
                        <p className="text-sm text-muted-foreground pl-7">
                          Dan {modules.length - 5} modul lainnya...
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Course Modules Preview */}
            <Card>
              <CardHeader>
                <CardTitle>Kurikulum Kelas</CardTitle>
              </CardHeader>
              <CardContent>
                {modules.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    Modul sedang dalam persiapan
                  </p>
                ) : (
                  <div className="space-y-2">
                    {modules.map((module, index) => (
                      <div
                        key={module.id}
                        className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30"
                      >
                        <Badge variant="outline" className="font-mono flex-shrink-0">
                          {String(module.order ?? index + 1).padStart(2, '0')}
                        </Badge>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm">{module.title}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Enrollment Card (Sticky) */}
          <div className="lg:col-span-1">
            <Card className="lg:sticky lg:top-6">
              <CardContent className="p-6 space-y-4">
                {/* Price Section - Placeholder for future */}
                <div className="text-center py-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-3">
                    <Award className="h-8 w-8 text-primary" />
                  </div>
                  <p className="text-3xl font-bold mb-1">Gratis</p>
                  <p className="text-sm text-muted-foreground">
                    Akses selamanya
                  </p>
                </div>

                <Separator />

                {/* Features */}
                <div className="space-y-3">
                  <h3 className="font-semibold text-sm">Kelas ini mencakup:</h3>
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

                {/* Enroll Button */}
                <Button
                  size="lg"
                  className="w-full"
                  onClick={handleEnrollClick}
                  disabled={enrollMutation.isPending}
                >
                  {enrollMutation.isPending ? "Memproses..." : "Ambil Kelas Sekarang"}
                </Button>

                <p className="text-xs text-muted-foreground text-center">
                  Dengan mengambil kelas ini, Anda menyetujui untuk belajar dan menyelesaikan materi.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Enrollment Confirmation Modal */}
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

  // ENROLLED VIEW - Show module list (existing functionality)
  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" asChild>
        <Link to="/student/classes">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Katalog
        </Link>
      </Button>

      {/* Main Content - Desktop: Side by Side, Mobile: Stacked */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Track Header */}
        <Card className="h-full">
          <CardContent className="p-0 h-full flex flex-col">
            {/* Track Image */}
            {track.image_url && (
              <div className="aspect-video w-full overflow-hidden flex-shrink-0">
                <img
                  src={track.image_url}
                  alt={track.title}
                  className="h-full w-full object-cover"
                />
              </div>
            )}

            <div className="p-6 flex-1">
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
                  <Badge variant="default" className="gap-1">
                    <CheckCircle2 className="h-3 w-3" />
                    Terdaftar
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
        <Card className="h-full flex flex-col">
          <CardHeader className="flex-shrink-0">
            <CardTitle className="text-2xl">Daftar Modul</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 overflow-y-auto">
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
                        <Button size="sm" variant="ghost" asChild>
                          <Link to={`/student/classes/${slug}/${module.slug}`}>
                            <PlayCircle className="h-4 w-4 mr-2" />
                            Mulai
                          </Link>
                        </Button>
                      </div>
                    </CardHeader>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Action Button */}
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
