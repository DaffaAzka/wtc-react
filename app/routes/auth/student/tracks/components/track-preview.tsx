import { Link } from "react-router";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { EnrollmentConfirmationModal } from "@/students/components/enrollment-confirmation-modal";
import { getPatternBackground } from "@/lib/utils";
import { ArrowLeft, Award, BookOpen, CheckCircle, CheckCircle2, Clock, Loader2, PlayCircle, Target } from "lucide-react";
import type { Track } from "@/types/model";

interface TrackPreviewProps {
  track: Track;
  showConfirmModal: boolean;
  enrollmentPending: boolean;
  onEnrollClick: () => void;
  onConfirmEnroll: () => void;
  onModalChange: (open: boolean) => void;
}

export function TrackPreview({ track, showConfirmModal, enrollmentPending, onEnrollClick, onConfirmEnroll, onModalChange }: TrackPreviewProps) {
  return (
    <div className="space-y-6">
      {/* <Button variant="ghost" asChild>
        <Link to="/student/tracks">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Katalog
        </Link>
      </Button> */}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card className="border-none shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="p-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Left: Details (75%) */}
                <div className="flex-1 space-y-6">
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2">
                      {track.modules_count && track.modules_count > 0 ? (
                        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none shadow-sm">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                          {track.modules_count} Modul
                        </Badge>
                      ) : (
                        <Badge className="bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-none shadow-sm">
                          <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                          Modul Pembelajaran
                        </Badge>
                      )}
                      <Badge className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20 border-none shadow-sm gap-1">
                        <Clock className="h-3.5 w-3.5" />
                        Self-Paced
                      </Badge>
                      <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-none shadow-sm gap-1">
                        <Award className="h-3.5 w-3.5" />
                        Gratis
                      </Badge>
                    </div>
                    <h1 className="text-3xl lg:text-4xl font-bold">{track.title}</h1>
                  </div>

                  <Separator />

                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-indigo-500/10">
                        <BookOpen className="h-4 w-4 text-indigo-500" />
                      </div>
                      <h2 className="text-lg font-semibold">Tentang Kelas Ini</h2>
                    </div>
                    {track.description ? (
                      <p className="leading-relaxed text-muted-foreground pl-10">{track.description}</p>
                    ) : (
                      <p className="italic text-muted-foreground pl-10">Deskripsi kelas akan segera ditambahkan.</p>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-full bg-blue-500/10">
                        <Target className="h-4 w-4 text-blue-500" />
                      </div>
                      <h2 className="text-lg font-semibold">Apa yang Akan Kamu Pelajari</h2>
                    </div>

                    <div className="space-y-3">
                      <Card className="border-none shadow-sm bg-blue-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-blue-500/10 shrink-0 mt-0.5">
                              <BookOpen className="h-4 w-4 text-blue-500" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-semibold text-sm">Modul Pembelajaran Terstruktur</h3>
                              <p className="text-sm text-muted-foreground">
                                Materi pembelajaran disusun secara sistematis dari tingkat dasar hingga lanjutan, dirancang untuk membangun pemahaman secara bertahap.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm bg-indigo-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-indigo-500/10 shrink-0 mt-0.5">
                              <PlayCircle className="h-4 w-4 text-indigo-500" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-semibold text-sm">Lessons Interaktif</h3>
                              <p className="text-sm text-muted-foreground">
                                Setiap modul dilengkapi dengan lessons interaktif, latihan praktis, dan challenges untuk menguji pemahamanmu secara langsung.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>

                      <Card className="border-none shadow-sm bg-cyan-500/5">
                        <CardContent className="p-4">
                          <div className="flex items-start gap-3">
                            <div className="p-2 rounded-full bg-cyan-500/10 shrink-0 mt-0.5">
                              <Award className="h-4 w-4 text-cyan-500" />
                            </div>
                            <div className="space-y-2">
                              <h3 className="font-semibold text-sm">Progress Tracking</h3>
                              <p className="text-sm text-muted-foreground">
                                Pantau perkembangan belajarmu dengan sistem tracking yang membantu kamu tetap termotivasi hingga menyelesaikan seluruh kelas.
                              </p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-none shadow-sm">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <div className="p-2 rounded-full bg-indigo-500/10">
                  <BookOpen className="h-5 w-5 text-indigo-500" />
                </div>
                Struktur Pembelajaran
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">Kurikulum kelas ini dirancang dengan pendekatan bertahap untuk memastikan pemahaman yang solid.</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-500/10 text-blue-500 font-semibold text-sm shrink-0">1</div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Fundamental Concepts</h4>
                    <p className="text-xs text-muted-foreground">Membangun fondasi dengan konsep-konsep dasar yang penting</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-indigo-500/10 text-indigo-500 font-semibold text-sm shrink-0">2</div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Practical Implementation</h4>
                    <p className="text-xs text-muted-foreground">Menerapkan teori ke dalam praktik dengan hands-on exercises</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-cyan-500/10 text-cyan-500 font-semibold text-sm shrink-0">3</div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Advanced Techniques</h4>
                    <p className="text-xs text-muted-foreground">Menguasai teknik-teknik lanjutan dan best practices</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:shadow-sm transition-shadow">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-green-500/10 text-green-500 font-semibold text-sm shrink-0">4</div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm">Real-World Projects</h4>
                    <p className="text-xs text-muted-foreground">Mengerjakan project nyata untuk portfolio dan pengalaman praktis</p>
                  </div>
                </div>
              </div>

              <div className="mt-4 p-4 rounded-lg bg-muted/50 border-l-4 border-blue-500">
                <p className="text-sm text-muted-foreground">
                  💡 <span className="font-medium text-foreground">Daftar sekarang</span> untuk mengakses kurikulum lengkap dengan detail modul, lessons, dan challenges interaktif.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-1">
          <Card className="lg:sticky lg:top-6 border-none shadow-lg h-[calc(100vh-3rem)]">
            <CardContent className="flex flex-col p-6 pt-2 h-full">
              <div className="space-y-4">
                <div className="py-6 text-center bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/5 rounded-lg">
                  <div className="mb-4 inline-flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-indigo-500/20">
                    <Award className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                  </div>
                  <p className="mb-1 text-3xl font-bold">Gratis</p>
                  <p className="text-sm font-medium text-muted-foreground">Akses Selamanya</p>
                </div>
              </div>
              <div className="mt-auto space-y-3">
                <h3 className="text-sm font-semibold flex items-center gap-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  Kelas ini mencakup:
                </h3>

                <div className="space-y-2.5 text-sm">
                  {/* {track.modules_count && track.modules_count > 0 ? ( */}
                  <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 rounded-full bg-blue-500/10">
                      <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                    </div>

                    <span>{track.modules_count} Modul pembelajaran</span>
                  </div>
                  {/* ) : (
                    <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors">
                      <div className="p-1.5 rounded-full bg-blue-500/10">
                        <BookOpen className="h-3.5 w-3.5 text-blue-500" />
                      </div>

                      <span>Modul pembelajaran terstruktur</span>
                    </div>
                  )} */}

                  <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 rounded-full bg-indigo-500/10">
                      <PlayCircle className="h-3.5 w-3.5 text-indigo-500" />
                    </div>

                    <span>Lessons interaktif</span>
                  </div>

                  <div className="flex items-center gap-2.5 p-2 rounded-md hover:bg-muted/50 transition-colors">
                    <div className="p-1.5 rounded-full bg-amber-500/10">
                      <Award className="h-3.5 w-3.5 text-amber-500" />
                    </div>

                    <span>Sertifikat penyelesaian</span>
                  </div>
                </div>
              </div>

              <div className="mt-auto space-y-4 ">
                <Button
                  size="lg"
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all"
                  onClick={onEnrollClick}
                  disabled={enrollmentPending}
                >
                  {enrollmentPending ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    <>
                      <Award className="h-5 w-5 mr-2" />
                      Ambil Kelas Sekarang
                    </>
                  )}
                </Button>

                <p className="text-center text-xs text-muted-foreground">Dengan mengambil kelas ini, Anda menyetujui untuk belajar dan menyelesaikan materi.</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <EnrollmentConfirmationModal open={showConfirmModal} onOpenChange={onModalChange} onConfirm={onConfirmEnroll} loading={enrollmentPending} trackTitle={track.title} />
    </div>
  );
}
