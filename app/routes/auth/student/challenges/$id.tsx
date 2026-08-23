import { useParams, useNavigate, Link } from "react-router";
import { useGetChallenge } from "@/hooks/challenges";
import { useGetModules } from "@/hooks/modules";
import { useGetLessons } from "@/hooks/lessons";
import { useGetChallengesByModule } from "@/hooks/challenges";
import { useMySubmissions } from "@/hooks/submission";
import { useGetTracks } from "@/hooks/tracks";
import { useQueries } from "@tanstack/react-query";
import { SubmissionService } from "@/services/submission";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  ArrowLeft,
  AlertCircle,
  PlayCircle,
  CheckCircle2,
  XCircle,
  Loader2,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { ChallengeDetails } from "@/features/auth/challenges/challenge-details";
import { SubmissionHistory } from "@/features/auth/challenges/submission-history";
import {
  getLatestSubmission,
  didSubmissionPass,
  getScorePercentage,
  getChallengeCompletionStatus,
  DEFAULT_PASSING_PERCENTAGE,
} from "@/lib/challenge-completion";
import { cn } from "@/lib/utils";

export default function ChallengeDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const challengeId = Number(id);

  const {
    challenge,
    loading: challengeLoading,
    error: challengeError,
  } = useGetChallenge(challengeId);
  const { data: submissions = [], isLoading: submissionsLoading } =
    useMySubmissions(challengeId);
  const { modules, loading: modulesLoading } = useGetModules();
  const { tracks, loading: tracksLoading } = useGetTracks();

  const currentModule = modules.find((m) => m.id === challenge?.module_id);
  const moduleSlug = currentModule?.slug || "";

  const currentTrack = tracks.find((t) => t.id === currentModule?.track_id);

  const trackModules = modules
    .filter((m) => m.track_id === currentModule?.track_id)
    .sort((a, b) => (a.order || 0) - (b.order || 0));
  const currentModuleIndex = trackModules.findIndex(
    (m) => m.id === currentModule?.id,
  );
  const nextModule =
    currentModuleIndex >= 0 && currentModuleIndex < trackModules.length - 1
      ? trackModules[currentModuleIndex + 1]
      : null;

  const { lessons, loading: lessonsLoading } = useGetLessons(
    currentModule ? { module_id: currentModule.id.toString() } : undefined,
  );
  const { challenges: moduleChallenges, loading: moduleChallengesLoading } =
    useGetChallengesByModule(moduleSlug);

  const submissionQueries = useQueries({
    queries: moduleChallenges.map((ch) => ({
      queryKey: ["submissions", "my", ch.id],
      queryFn: () => SubmissionService.mySubmissions(ch.id),
      enabled: !!ch.id,
    })),
  });

  const allSubmissions = submissionQueries
    .filter((q) => q.isSuccess && q.data)
    .flatMap((q) => q.data || []);

  const { lessons: nextModuleLessons, loading: nextModuleLessonsLoading } =
    useGetLessons(
      nextModule ? { module_id: nextModule.id.toString() } : undefined,
    );
  const nextModuleFirstLesson = [...nextModuleLessons].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  )[0];

  const sortedLessons = [...lessons].sort(
    (a, b) => (a.order || 0) - (b.order || 0),
  );
  const lastLesson = sortedLessons[sortedLessons.length - 1];

  const submissionCount = submissions.length;
  const allowedAttempts = challenge?.allowed_attempts || 0;
  const remainingAttempts =
    allowedAttempts > 0 ? allowedAttempts - submissionCount : Infinity;
  const canSubmit = remainingAttempts > 0 || allowedAttempts === 0;

  const latestSubmission = getLatestSubmission(submissions);
  const hasPassed =
    latestSubmission && latestSubmission.score !== null && challenge
      ? didSubmissionPass(latestSubmission, challenge)
      : false;
  const scorePercentage =
    latestSubmission && latestSubmission.score !== null && challenge
      ? getScorePercentage(latestSubmission.score, challenge.max_score)
      : null;
  const isPending = latestSubmission && latestSubmission.status === "pending";

  const allChallengesCompleted = moduleChallenges.every((ch) => {
    const challengeSubmissions = allSubmissions.filter(
      (sub) => sub.challenge_id === ch.id,
    );
    const status = getChallengeCompletionStatus(ch, challengeSubmissions);
    return status === "passed";
  });

  const handlePrevious = () => {
    if (lastLesson && currentModule && currentTrack) {
      navigate(
        `/student/classes/${currentTrack.slug}/${currentModule.slug}/${lastLesson.slug}`,
      );
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleNext = () => {
    if (nextModule && nextModuleFirstLesson && currentTrack) {
      navigate(
        `/student/classes/${currentTrack.slug}/${nextModule.slug}/${nextModuleFirstLesson.slug}`,
      );
    } else {
      navigate("/student/dashboard");
    }
  };

  const handleLessonClick = (lesson: (typeof sortedLessons)[0]) => {
    if (currentModule && currentTrack) {
      navigate(
        `/student/classes/${currentTrack.slug}/${currentModule.slug}/${lesson.slug}`,
      );
    }
  };

  const loading =
    challengeLoading ||
    submissionsLoading ||
    modulesLoading ||
    tracksLoading ||
    lessonsLoading ||
    moduleChallengesLoading;

  if (loading) {
    return (
      <div className="flex flex-col h-screen">
        <div className="flex-1 flex items-center justify-center">
          <div className="space-y-4 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
            <p className="text-sm text-muted-foreground">Memuat challenge...</p>
          </div>
        </div>
      </div>
    );
  }

  if (challengeError || !challenge || !currentModule) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {challengeError?.message || "Challenge atau Module tidak ditemukan"}
          </AlertDescription>
        </Alert>
        <Button variant="ghost" className="mt-4" asChild>
          <Link to="/student/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-5rem)] overflow-hidden">
      {/* Main Content Area - Same structure as lesson page */}
      <div className="flex flex-1 overflow-hidden">
        {/* Main Content - Scrollable */}
        <div className="flex-1 overflow-y-auto">
          <div className="container max-w-4xl mx-auto p-6 space-y-6">
            {/* Challenge Details */}
            <ChallengeDetails
              challenge={challenge}
              submissionCount={submissionCount}
              remainingAttempts={remainingAttempts}
            />

            {/* Latest Result Card (shows after submission) */}
            {latestSubmission && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Hasil Terbaru</span>
                    {isPending ? (
                      <Badge variant="secondary" className="text-sm">
                        <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                        SEDANG DINILAI
                      </Badge>
                    ) : latestSubmission.score !== null ? (
                      <Badge
                        variant={hasPassed ? "default" : "destructive"}
                        className="text-sm">
                        {hasPassed ? "LULUS" : "GAGAL"}
                      </Badge>
                    ) : null}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isPending ? (
                    <Alert>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <AlertDescription>
                        Jawaban Anda sedang dinilai oleh sistem. Mohon refresh
                        halaman ini dalam beberapa saat untuk melihat hasil.
                      </AlertDescription>
                    </Alert>
                  ) : latestSubmission.score !== null ? (
                    <>
                      {/* Score Display */}
                      <div>
                        <div className="text-sm text-muted-foreground mb-1">
                          Skor
                        </div>
                        <div className="text-2xl font-bold">
                          {latestSubmission.score} / {challenge.max_score}
                          <span className="text-lg text-muted-foreground ml-2">
                            ({scorePercentage}%)
                          </span>
                        </div>
                      </div>

                      {/* Passing Grade Info */}
                      <div className="text-sm text-muted-foreground">
                        Nilai minimal untuk lulus:{" "}
                        {Math.round(DEFAULT_PASSING_PERCENTAGE * 100)}%
                      </div>

                      {/* Pass/Fail Message */}
                      {hasPassed ? (
                        <Alert className="bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900">
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                          <AlertDescription className="text-green-800 dark:text-green-200">
                            Selamat! Anda telah menyelesaikan challenge ini.
                          </AlertDescription>
                        </Alert>
                      ) : (
                        <Alert variant="destructive">
                          <XCircle className="h-4 w-4" />
                          <AlertDescription>
                            Anda belum mencapai nilai minimal. Silakan coba
                            lagi.
                          </AlertDescription>
                        </Alert>
                      )}
                    </>
                  ) : (
                    <Alert variant="destructive">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Submission gagal dinilai. Silakan hubungi administrator.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Previous Submissions */}
            <SubmissionHistory
              submissions={submissions}
              maxScore={challenge.max_score}
            />

            {/* Start Challenge Button */}
            <Card>
              <CardHeader>
                <CardTitle>Mulai Challenge</CardTitle>
              </CardHeader>
              <CardContent>
                {canSubmit ? (
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">
                      Klik tombol di bawah untuk memulai mengerjakan challenge
                      ini.
                    </p>
                    <Button asChild size="lg" className="w-full">
                      <Link to={`/student/challenges/${challenge.id}/take`}>
                        <PlayCircle className="h-5 w-5 mr-2" />
                        Mulai
                      </Link>
                    </Button>
                  </div>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Anda telah mencapai batas maksimum percobaan untuk
                      challenge ini.
                    </AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Right Sidebar - Same as lesson page */}
        <div className="hidden lg:flex lg:w-80 xl:w-96 border-l bg-muted/30 h-full">
          <div className="flex flex-col w-full h-full">
            {/* Module Info Header */}
            <div className="p-6 border-b bg-background">
              <div className="space-y-2">
                <div className="text-xs font-semibold text-muted-foreground uppercase">
                  Module
                </div>
                <h3 className="text-lg font-bold leading-tight">
                  {currentModule.title}
                </h3>
              </div>
            </div>

            {/* Lessons & Challenges List - Scrollable */}
            <ScrollArea className="flex-1">
              <div className="p-4 space-y-6">
                {/* Lessons List */}
                {sortedLessons.length > 0 && (
                  <div>
                    <div className="px-3 mb-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        Pelajaran
                      </h3>
                    </div>
                    <div className="space-y-2">
                      {sortedLessons.map((lesson, index) => (
                        <button
                          key={lesson.id}
                          onClick={() => handleLessonClick(lesson)}
                          className="w-full text-left p-3 rounded-lg transition-colors hover:bg-accent/50">
                          <div className="flex items-start gap-3">
                            <div className="flex-shrink-0 mt-1">
                              <Circle className="h-5 w-5 text-muted-foreground" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-mono text-muted-foreground mb-1">
                                {String(index + 1).padStart(2, "0")}
                              </div>
                              <h3 className="text-sm font-medium text-foreground line-clamp-2">
                                {lesson.title}
                              </h3>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Challenges List */}
                {moduleChallenges.length > 0 && (
                  <div className="pt-6 border-t">
                    <div className="px-3 mb-3">
                      <h3 className="text-sm font-semibold text-foreground">
                        Tantangan
                      </h3>
                      <p className="text-xs text-muted-foreground mt-1">
                        Selesaikan tantangan untuk membuka modul berikutnya
                      </p>
                    </div>
                    <div className="space-y-2">
                      {moduleChallenges.map((ch, index) => {
                        const isCurrentChallenge = ch.id === challenge.id;
                        const challengeSubmissions = allSubmissions.filter(
                          (sub) => sub.challenge_id === ch.id,
                        );
                        const status = getChallengeCompletionStatus(
                          ch,
                          challengeSubmissions,
                        );

                        return (
                          <Link
                            key={ch.id}
                            to={`/student/challenges/${ch.id}`}
                            className="block">
                            <button
                              className={cn(
                                "w-full text-left p-3 rounded-lg transition-colors",
                                isCurrentChallenge
                                  ? "bg-primary/10 border-2 border-primary"
                                  : "hover:bg-accent/50",
                              )}>
                              <div className="flex items-start gap-3">
                                <div className="flex-shrink-0 mt-1">
                                  {(() => {
                                    if (status === "passed") {
                                      return (
                                        <CheckCircle2 className="h-5 w-5 text-green-600" />
                                      );
                                    } else if (status === "failed") {
                                      return (
                                        <XCircle className="h-5 w-5 text-red-600" />
                                      );
                                    } else {
                                      return (
                                        <Circle className="h-5 w-5 text-muted-foreground" />
                                      );
                                    }
                                  })()}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xs font-mono text-muted-foreground">
                                      {String(index + 1).padStart(2, "0")}
                                    </span>
                                    <span className="text-xs px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                                      {ch.type.replace(/_/g, " ")}
                                    </span>
                                  </div>
                                  <h3 className="text-sm font-medium text-foreground line-clamp-2">
                                    {ch.title}
                                  </h3>
                                </div>
                              </div>
                            </button>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </div>
        </div>
      </div>

      {/* Bottom Navigation - Same as lesson page */}
      <div className="border-t bg-background">
        <div className="container max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              onClick={handlePrevious}
              className="min-w-32">
              <ChevronLeft className="h-4 w-4 mr-2" />
              Sebelumnya
            </Button>

            <div className="text-center">
              <div className="text-sm font-medium">{challenge.title}</div>
              <div className="text-xs text-muted-foreground">
                {hasPassed ? "✅ Selesai" : "Tantangan"}
              </div>
            </div>

            <Button
              onClick={handleNext}
              disabled={
                !allChallengesCompleted ||
                Boolean(nextModule && nextModuleLessonsLoading)
              }
              className="min-w-32">
              Selanjutnya
              <ChevronRight className="h-4 w-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
