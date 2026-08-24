import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Send, ClipboardList } from "lucide-react";
import type { Challenge } from "@/types/model";
import type { Question, MCQQuestion, EssayQuestion } from "@/types/challenge";

interface QuizGroupFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

type Answer = {
  questionIndex: number;
  type: "multiple_choice" | "essay";
  answer: string; // For MCQ: "A", "B", etc. For Essay: full text
};

export function QuizGroupForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: QuizGroupFormProps) {
  const questions = challenge.metadata?.questions || [];
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [error, setError] = useState("");

  if (questions.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quiz</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Quiz ini tidak memiliki soal. Silakan hubungi instruktur.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

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
      if (!text.trim()) return existing; // Remove if empty
      return [...existing, { questionIndex, type: "essay", answer: text }];
    });
  };

  const getAnswer = (questionIndex: number): string => {
    return answers.find((a) => a.questionIndex === questionIndex)?.answer || "";
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all questions are answered
    if (answers.length < questions.length) {
      setError(`Silakan jawab semua soal (${answers.length}/${questions.length} terjawab)`);
      return;
    }

    // Validate essay answers have minimum length
    const essayAnswers = answers.filter((a) => a.type === "essay");
    for (const answer of essayAnswers) {
      const wordCount = answer.answer.trim().split(/\s+/).length;
      if (wordCount < 10) {
        setError(`Jawaban essay harus minimal 10 kata (soal #${answer.questionIndex + 1})`);
        return;
      }
    }

    // Format submission
    const submissionData = {
      quiz_type: "quiz_group",
      total_questions: questions.length,
      answers: answers.sort((a, b) => a.questionIndex - b.questionIndex),
      submitted_at: new Date().toISOString(),
    };

    onSubmit(null, JSON.stringify(submissionData));
    setError("");
  };

  const totalScore = questions.reduce((sum, q) => sum + q.score, 0);
  const progress = (answers.length / questions.length) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5" />
            <CardTitle className="text-lg">Quiz Group</CardTitle>
          </div>
          <Badge variant="outline">{totalScore} poin total</Badge>
        </div>
        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{answers.length}/{questions.length} soal terjawab</span>
          </div>
          <div className="h-2 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {!canSubmit ? (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Anda telah mencapai batas maksimum percobaan untuk challenge ini.
            </AlertDescription>
          </Alert>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Render all questions */}
            {questions.map((question, index) => (
              <div key={index} className="space-y-4 p-4 border rounded-lg">
                {/* Question Header */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="secondary">Soal #{index + 1}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {question.score} poin
                      </Badge>
                      <Badge
                        variant={question.type === "multiple_choice" ? "default" : "secondary"}
                        className="text-xs"
                      >
                        {question.type === "multiple_choice" ? "Pilihan Ganda" : "Essay"}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium leading-relaxed">{question.question}</p>
                  </div>
                </div>

                {/* MCQ Options */}
                {question.type === "multiple_choice" && (
                  <RadioGroup
                    value={getAnswer(index)}
                    onValueChange={(value) => handleMCQAnswer(index, value)}
                    className="space-y-2 ml-4"
                  >
                    {(question as MCQQuestion).options.map((option, optIndex) => {
                      const optionKey = String.fromCharCode(65 + optIndex); // A, B, C, D
                      return (
                        <div
                          key={optIndex}
                          className="flex items-start space-x-3 p-3 border rounded-md hover:bg-muted/50 transition-colors"
                        >
                          <RadioGroupItem
                            value={optionKey}
                            id={`q${index}-${optionKey}`}
                            className="mt-0.5"
                          />
                          <Label
                            htmlFor={`q${index}-${optionKey}`}
                            className="flex-1 cursor-pointer text-sm"
                          >
                            <span className="font-semibold text-primary mr-2">{optionKey}.</span>
                            {option}
                          </Label>
                        </div>
                      );
                    })}
                  </RadioGroup>
                )}

                {/* Essay Textarea */}
                {question.type === "essay" && (
                  <div className="space-y-2 ml-4">
                    {(question as EssayQuestion).rubric && (
                      <div className="text-xs text-muted-foreground bg-muted p-2 rounded">
                        <span className="font-semibold">Rubrik:</span> {(question as EssayQuestion).rubric}
                      </div>
                    )}
                    <Textarea
                      value={getAnswer(index)}
                      onChange={(e) => handleEssayAnswer(index, e.target.value)}
                      placeholder="Tulis jawaban essay Anda di sini (minimal 10 kata)..."
                      rows={6}
                      disabled={isSubmitting}
                      className="text-sm"
                    />
                    <p className="text-xs text-muted-foreground">
                      {getAnswer(index).trim().split(/\s+/).filter(w => w).length} kata
                    </p>
                  </div>
                )}
              </div>
            ))}

            {/* Error Message */}
            {error && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || answers.length < questions.length}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengirim...
                </>
              ) : (
                <>
                  <Send className="h-4 w-4 mr-2" />
                  Kirim Jawaban Quiz ({answers.length}/{questions.length})
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
