import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Send, Clock, AlertTriangle } from "lucide-react";
import type { Challenge } from "@/types/model";
import type { Question, MCQQuestion, EssayQuestion } from "@/types/challenge";

interface TimedExamFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

type Answer = {
  questionIndex: number;
  type: "multiple_choice" | "essay";
  answer: string;
};

export function TimedExamForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: TimedExamFormProps) {
  const questions = challenge.metadata?.questions || [];
  const estimatedMinutes = challenge.metadata?.estimated_minutes || 60;
  const totalSeconds = estimatedMinutes * 60;

  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(totalSeconds);
  const [examStarted, setExamStarted] = useState(false);
  const [examEnded, setExamEnded] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Timer logic
  useEffect(() => {
    if (examStarted && !examEnded && timeRemaining > 0) {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            // Time's up - auto submit
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [examStarted, examEnded, timeRemaining]);

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const getTimeColor = (): string => {
    const percentage = (timeRemaining / totalSeconds) * 100;
    if (percentage > 50) return "text-green-600";
    if (percentage > 20) return "text-yellow-600";
    return "text-red-600";
  };

  const handleStartExam = () => {
    setExamStarted(true);
  };

  const handleAutoSubmit = () => {
    setExamEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);

    // Auto-submit with current answers
    const submissionData = {
      exam_type: "timed_exam",
      total_questions: questions.length,
      time_limit_minutes: estimatedMinutes,
      time_used_seconds: totalSeconds - timeRemaining,
      answers: answers.sort((a, b) => a.questionIndex - b.questionIndex),
      auto_submitted: true,
      submitted_at: new Date().toISOString(),
    };

    onSubmit(null, JSON.stringify(submissionData));
  };

  const handleMCQAnswer = (questionIndex: number, selectedOption: string) => {
    setAnswers((prev) => {
      const existing = prev.filter((a) => a.questionIndex !== questionIndex);
      return [
        ...existing,
        { questionIndex, type: "multiple_choice", answer: selectedOption },
      ];
    });
  };

  const handleEssayAnswer = (questionIndex: number, text: string) => {
    setAnswers((prev) => {
      const existing = prev.filter((a) => a.questionIndex !== questionIndex);
      if (!text.trim()) return existing;
      return [...existing, { questionIndex, type: "essay", answer: text }];
    });
  };

  const getAnswer = (questionIndex: number): string => {
    return answers.find((a) => a.questionIndex === questionIndex)?.answer || "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!examStarted) {
      setError("Silakan mulai ujian terlebih dahulu");
      return;
    }

    if (examEnded) {
      setError("Ujian telah berakhir");
      return;
    }

    if (answers.length < questions.length) {
      setError(`Beberapa soal belum dijawab (${answers.length}/${questions.length})`);
      return;
    }

    setExamEnded(true);
    if (timerRef.current) clearInterval(timerRef.current);

    const submissionData = {
      exam_type: "timed_exam",
      total_questions: questions.length,
      time_limit_minutes: estimatedMinutes,
      time_used_seconds: totalSeconds - timeRemaining,
      answers: answers.sort((a, b) => a.questionIndex - b.questionIndex),
      auto_submitted: false,
      submitted_at: new Date().toISOString(),
    };

    onSubmit(null, JSON.stringify(submissionData));
    setError("");
  };

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Timed Exam</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Ujian ini tidak memiliki soal. Silakan hubungi instruktur.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
  const progress = (answers.length / questions.length) * 100;

  // Before exam starts
  if (!examStarted) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle className="text-lg">Timed Exam</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <p className="font-semibold mb-2">Informasi Ujian:</p>
              <ul className="list-disc list-inside space-y-1 text-sm">
                <li>Jumlah soal: {questions.length}</li>
                <li>Total skor: {totalScore} poin</li>
                <li>Waktu: {estimatedMinutes} menit</li>
                <li>Timer akan mulai berjalan setelah Anda klik "Mulai Ujian"</li>
                <li>Ujian akan otomatis ter-submit saat waktu habis</li>
                <li>Pastikan koneksi internet stabil</li>
              </ul>
            </AlertDescription>
          </Alert>

          {!canSubmit ? (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Anda telah mencapai batas maksimum percobaan untuk challenge ini.
              </AlertDescription>
            </Alert>
          ) : (
            <Button onClick={handleStartExam} className="w-full" size="lg">
              <Clock className="h-4 w-4 mr-2" />
              Mulai Ujian ({estimatedMinutes} menit)
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  // During exam
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            <CardTitle className="text-lg">Timed Exam</CardTitle>
          </div>
          <div className="flex items-center gap-3">
            <Badge variant="outline">{totalScore} poin</Badge>
            <Badge variant={timeRemaining > totalSeconds * 0.2 ? "default" : "destructive"} className="text-lg px-3 py-1">
              <Clock className="h-4 w-4 mr-2" />
              <span className={getTimeColor()}>{formatTime(timeRemaining)}</span>
            </Badge>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{answers.length}/{questions.length} terjawab</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Time warning */}
        {timeRemaining <= 60 && timeRemaining > 0 && (
          <Alert variant="destructive" className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Waktu tersisa kurang dari 1 menit! Segera selesaikan ujian Anda.
            </AlertDescription>
          </Alert>
        )}
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Questions */}
          {questions.map((question, index) => (
            <div key={index} className="space-y-4 p-4 border rounded-lg">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="secondary">#{index + 1}</Badge>
                    <Badge variant="outline" className="text-xs">{question.score} poin</Badge>
                    <Badge variant={question.type === "multiple_choice" ? "default" : "secondary"} className="text-xs">
                      {question.type === "multiple_choice" ? "MCQ" : "Essay"}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium">{question.question}</p>
                </div>
              </div>

              {question.type === "multiple_choice" && (
                <RadioGroup
                  value={getAnswer(index)}
                  onValueChange={(value) => handleMCQAnswer(index, value)}
                  className="space-y-2 ml-4"
                >
                  {(question as MCQQuestion).options.map((option, optIndex) => {
                    const key = String.fromCharCode(65 + optIndex);
                    return (
                      <div key={optIndex} className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50">
                        <RadioGroupItem value={key} id={`q${index}-${key}`} className="mt-0.5" />
                        <Label htmlFor={`q${index}-${key}`} className="flex-1 cursor-pointer text-sm">
                          <span className="font-semibold mr-2">{key}.</span>{option}
                        </Label>
                      </div>
                    );
                  })}
                </RadioGroup>
              )}

              {question.type === "essay" && (
                <Textarea
                  value={getAnswer(index)}
                  onChange={(e) => handleEssayAnswer(index, e.target.value)}
                  placeholder="Jawaban essay..."
                  rows={6}
                  disabled={isSubmitting || examEnded}
                  className="text-sm ml-4"
                />
              )}
            </div>
          ))}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <Button
            type="submit"
            disabled={isSubmitting || examEnded || answers.length < questions.length}
            className="w-full"
            size="lg"
          >
            {isSubmitting ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Mengirim...</>
            ) : (
              <><Send className="h-4 w-4 mr-2" />Submit Ujian ({answers.length}/{questions.length})</>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
