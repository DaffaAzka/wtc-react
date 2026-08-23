import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Send } from "lucide-react";
import type { Challenge } from "@/types/model";

interface MultipleChoiceFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function MultipleChoiceForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: MultipleChoiceFormProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [error, setError] = useState("");

  // Get options from challenge settings
  const options = challenge.settings?.options || [];
  const shuffleOptions = challenge.settings?.shuffle_options || false;

  // Shuffle options if needed (only on first render)
  const [displayOptions] = useState(() => {
    if (shuffleOptions) {
      return [...options].sort(() => Math.random() - 0.5);
    }
    return options;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedOption) {
      setError("Silakan pilih salah satu jawaban");
      return;
    }

    // Submit the selected option key as content
    onSubmit(null, selectedOption);
    setError("");
  };

  if (!options || options.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Kirim Jawaban</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Challenge ini tidak memiliki opsi pilihan. Silakan hubungi instruktur.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Pilih Jawaban</CardTitle>
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
            {/* Multiple Choice Options */}
            <RadioGroup
              value={selectedOption}
              onValueChange={setSelectedOption}
              className="space-y-3"
            >
              {displayOptions.map((option) => (
                <div
                  key={option.key}
                  className="flex items-start space-x-3 p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <RadioGroupItem
                    value={option.key}
                    id={option.key}
                    className="mt-1"
                  />
                  <Label
                    htmlFor={option.key}
                    className="flex-1 cursor-pointer text-sm leading-relaxed"
                  >
                    <span className="font-semibold text-primary mr-2">
                      {option.key.toUpperCase()}.
                    </span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

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
              disabled={isSubmitting || !selectedOption}
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
