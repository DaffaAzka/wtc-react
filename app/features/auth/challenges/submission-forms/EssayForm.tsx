import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Send } from "lucide-react";
import type { Challenge } from "@/types/model";

interface EssayFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function EssayForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: EssayFormProps) {
  const [content, setContent] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!content.trim()) {
      setError("Silakan isi jawaban Anda");
      return;
    }

    // Minimum word count check (optional, can be configured in challenge settings)
    const wordCount = content.trim().split(/\s+/).length;
    const minWords = 10; // Could come from challenge.settings?.min_words

    if (wordCount < minWords) {
      setError(`Jawaban harus minimal ${minWords} kata (saat ini: ${wordCount} kata)`);
      return;
    }

    onSubmit(null, content.trim());
    setError("");
  };

  const wordCount = content.trim().split(/\s+/).filter(w => w).length;
  const charCount = content.length;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Tulis Jawaban Essay</CardTitle>
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
            {/* Essay Textarea */}
            <div className="space-y-2">
              <Label htmlFor="essay-content" className="text-sm font-medium">
                Jawaban Anda
              </Label>
              <Textarea
                id="essay-content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Tuliskan jawaban essay Anda di sini..."
                rows={16}
                disabled={isSubmitting}
                className="text-sm leading-relaxed resize-none"
              />

              {/* Word and character count */}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{wordCount} kata</span>
                <span>{charCount} karakter</span>
              </div>

              {/* Rubric if available */}
              {challenge.settings?.explanation && (
                <div className="mt-4 p-3 bg-muted rounded-md">
                  <p className="text-xs font-semibold text-muted-foreground mb-1">
                    Kriteria Penilaian:
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {challenge.settings.explanation}
                  </p>
                </div>
              )}
            </div>

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
              disabled={isSubmitting || !content.trim()}
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
                  Kirim Jawaban
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
