import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, AlertCircle, Send, PenLine } from "lucide-react";
import type { Challenge } from "@/types/model";

interface FillBlankFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function FillBlankForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: FillBlankFormProps) {
  // Parse blanks from challenge content or settings
  // For now, we'll use a simple approach: show numbered blanks
  // The challenge content should indicate how many blanks there are
  const numberOfBlanks = (challenge.settings?.blank_count as number | undefined) ?? 5;

  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [error, setError] = useState("");

  const handleAnswerChange = (blankIndex: number, value: string) => {
    setAnswers((prev) => ({
      ...prev,
      [blankIndex]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if all blanks are filled
    const filledCount = Object.keys(answers).filter(
      (key) => answers[Number(key)]?.trim()
    ).length;

    if (filledCount < numberOfBlanks) {
      setError(
        `Silakan isi semua blank (${filledCount}/${numberOfBlanks} terisi)`
      );
      return;
    }

    // Format submission as JSON array
    const submissionData = {
      type: "fill_blank",
      blanks: Array.from({ length: numberOfBlanks }, (_, i) => ({
        blank_number: i + 1,
        answer: answers[i + 1]?.trim() || "",
      })),
      submitted_at: new Date().toISOString(),
    };

    onSubmit(null, JSON.stringify(submissionData));
    setError("");
  };

  const filledCount = Object.keys(answers).filter(
    (key) => answers[Number(key)]?.trim()
  ).length;
  const progress = (filledCount / numberOfBlanks) * 100;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PenLine className="h-5 w-5" />
            <CardTitle className="text-lg">Fill in the Blanks</CardTitle>
          </div>
          <Badge variant="outline">
            {filledCount}/{numberOfBlanks} terisi
          </Badge>
        </div>

        {/* Progress Bar */}
        <div className="mt-3">
          <div className="flex justify-between text-xs text-muted-foreground mb-1">
            <span>Progress</span>
            <span>{Math.round(progress)}%</span>
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
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Instructions */}
            <Alert>
              <PenLine className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-1">Instruksi:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Baca soal dengan teliti</li>
                  <li>Isi setiap blank dengan jawaban yang tepat</li>
                  <li>Perhatikan kapitalisasi dan ejaan</li>
                  <li>Pastikan semua blank terisi sebelum submit</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Challenge Content */}
            <div className="prose prose-sm max-w-none dark:prose-invert">
              <div dangerouslySetInnerHTML={{ __html: challenge.content }} />
            </div>

            {/* Blank Input Fields */}
            <div className="space-y-4 p-4 bg-muted/30 rounded-lg">
              <h4 className="text-sm font-semibold flex items-center gap-2">
                <PenLine className="h-4 w-4" />
                Jawaban Anda:
              </h4>

              <div className="grid gap-4">
                {Array.from({ length: numberOfBlanks }, (_, i) => {
                  const blankNumber = i + 1;
                  const isFilled = answers[blankNumber]?.trim();

                  return (
                    <div key={blankNumber} className="space-y-2">
                      <Label
                        htmlFor={`blank-${blankNumber}`}
                        className="text-sm font-medium flex items-center gap-2"
                      >
                        Blank #{blankNumber}
                        {isFilled && (
                          <Badge variant="secondary" className="text-xs">
                            ✓
                          </Badge>
                        )}
                      </Label>
                      <Input
                        id={`blank-${blankNumber}`}
                        type="text"
                        value={answers[blankNumber] || ""}
                        onChange={(e) =>
                          handleAnswerChange(blankNumber, e.target.value)
                        }
                        placeholder={`Isi blank #${blankNumber}...`}
                        disabled={isSubmitting}
                        className="font-mono"
                      />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Summary */}
            {filledCount > 0 && (
              <div className="p-3 bg-muted rounded-md">
                <p className="text-xs font-semibold text-muted-foreground mb-2">
                  Preview Jawaban:
                </p>
                <div className="space-y-1 text-xs">
                  {Object.entries(answers)
                    .filter(([_, value]) => value?.trim())
                    .sort(([a], [b]) => Number(a) - Number(b))
                    .map(([key, value]) => (
                      <div key={key} className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          Blank #{key}:
                        </span>
                        <span className="font-mono font-semibold text-primary">
                          {value}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            )}

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
              disabled={isSubmitting || filledCount < numberOfBlanks}
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
                  Kirim Jawaban ({filledCount}/{numberOfBlanks})
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
