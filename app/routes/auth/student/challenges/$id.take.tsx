import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router";
import { useGetChallenge } from "@/hooks/challenges";
import { useSubmitChallenge } from "@/hooks/submission";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Clock,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Circle,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { MCQQuestion } from "@/types/challenge";

export default function ChallengeQuizRunnerPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const challengeId = Number(id);

  const { challenge, loading, error } = useGetChallenge(challengeId);
  const { mutate: submitChallenge, isPending: isSubmitting } =
    useSubmitChallenge();

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  const questions = (challenge?.metadata?.questions || []) as MCQQuestion[];
  const currentQuestion = questions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === questions.length - 1;

  useEffect(() => {
    if (!challenge?.metadata?.estimated_minutes) return;

    const totalSeconds = challenge.metadata.estimated_minutes * 60;
    setTimeRemaining(totalSeconds);

    const interval = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          confirmSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [challenge]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const handleAnswerSelect = (answer: string) => {
    setAnswers((prev) => ({ ...prev, [currentQuestionIndex]: answer }));
  };

  const handlePrevious = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex((prev) => prev - 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prev) => prev + 1);
    }
  };

  const handleSubmitClick = () => {
    setShowConfirmDialog(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmDialog(false);

    const answersArray = questions.map((_, index) => answers[index] || "");

    submitChallenge(
      {
        challengeId,
        request: {
          submitted_content: {
            answers: answersArray,
          },
        },
      },
      {
        onSuccess: () => {
          navigate(`/student/challenges/${id}`);
        },
      },
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="space-y-4 text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Memuat challenge...</p>
        </div>
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Challenge tidak ditemukan"}
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

  if (questions.length === 0) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Challenge ini belum memiliki soal.
          </AlertDescription>
        </Alert>
        <Button variant="ghost" className="mt-4" asChild>
          <Link to={`/student/challenges/${id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Overview
          </Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Sidebar - Question Navigation */}
      <div className="w-full lg:w-64 border-b lg:border-b-0 lg:border-r bg-muted/30">
        <div className="p-4 border-b">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="w-full justify-start">
            <Link to={`/student/challenges/${id}`}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Kembali
            </Link>
          </Button>
        </div>

        <div className="p-4">
          <h3 className="text-sm font-semibold mb-3">Soal</h3>
          <div className="grid grid-cols-5 lg:grid-cols-1 gap-2">
            {questions.map((_, index) => {
              const isActive = currentQuestionIndex === index;
              const isAnswered = answers[index] !== undefined;

              return (
                <button
                  key={index}
                  onClick={() => setCurrentQuestionIndex(index)}
                  className={cn(
                    "flex items-center gap-2 p-3 rounded-lg border transition-colors text-left",
                    isActive &&
                      "bg-primary text-primary-foreground border-primary",
                    !isActive &&
                      isAnswered &&
                      "bg-green-50 dark:bg-green-950/20 border-green-200 dark:border-green-900",
                    !isActive && !isAnswered && "hover:bg-accent",
                  )}>
                  {isAnswered ? (
                    <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-green-600" />
                  ) : (
                    <Circle className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
                  )}
                  <span className="font-medium">{index + 1}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-h-screen lg:min-h-0">
        {/* Top Bar with Timer */}
        <div className="border-b p-4 bg-background">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div>
              <h1 className="text-lg font-semibold">{challenge.title}</h1>
              <p className="text-sm text-muted-foreground">
                Soal {currentQuestionIndex + 1} dari {questions.length}
              </p>
            </div>

            {timeRemaining !== null && (
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-muted">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span
                  className={cn(
                    "font-mono text-lg font-semibold",
                    timeRemaining < 60 && "text-red-600",
                  )}>
                  {formatTime(timeRemaining)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Question Display */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-8 space-y-6">
                {/* Question Text */}
                <div>
                  <div className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                    Pertanyaan {currentQuestionIndex + 1}
                  </div>
                  <h2 className="text-xl font-medium leading-relaxed">
                    {currentQuestion.question}
                  </h2>
                </div>

                {/* Answer Options */}
                <RadioGroup
                  value={answers[currentQuestionIndex]}
                  onValueChange={handleAnswerSelect}
                  className="space-y-3">
                  {currentQuestion.options.map((option, index) => {
                    const optionKey = String.fromCharCode(65 + index); // A, B, C, D
                    const isSelected =
                      answers[currentQuestionIndex] === optionKey;

                    return (
                      <div
                        key={optionKey}
                        className={cn(
                          "flex items-start gap-3 p-4 rounded-lg border-2 cursor-pointer transition-colors",
                          isSelected
                            ? "border-primary bg-primary/5"
                            : "border-border hover:border-primary/50 hover:bg-accent/50",
                        )}>
                        <RadioGroupItem
                          value={optionKey}
                          id={`option-${optionKey}`}
                          className="mt-0.5"
                        />
                        <Label
                          htmlFor={`option-${optionKey}`}
                          className="flex-1 cursor-pointer">
                          <span className="font-semibold mr-2">
                            {optionKey}.
                          </span>
                          {option}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom Navigation */}
        <div className="border-t p-4 bg-background">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentQuestionIndex === 0}>
              Sebelumnya
            </Button>

            <div className="text-sm text-muted-foreground">
              {Object.keys(answers).length} / {questions.length} terjawab
            </div>

            {isLastQuestion ? (
              <Button
                onClick={handleSubmitClick}
                disabled={isSubmitting}
                size="lg">
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Mengirim...
                  </>
                ) : (
                  "Kumpulkan"
                )}
              </Button>
            ) : (
              <Button
                onClick={handleNext}
                disabled={currentQuestionIndex >= questions.length - 1}>
                Selanjutnya
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Pengumpulan</AlertDialogTitle>
            <AlertDialogDescription>
              Anda yakin ingin mengumpulkan jawaban? Pastikan semua jawaban
              sudah benar. Setelah dikumpulkan, Anda tidak dapat mengubah
              jawaban lagi.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={confirmSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                "Ya, Kumpulkan"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
