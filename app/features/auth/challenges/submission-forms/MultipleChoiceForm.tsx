import { useState } from "react";
import { AlertCircle, Send, Loader2 } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import type { Challenge } from "@/types/model";

interface MultipleChoiceFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function MultipleChoiceForm({ challenge, canSubmit, isSubmitting, onSubmit }: MultipleChoiceFormProps) {
  const [selectedOption, setSelectedOption] = useState<string>("");
  const [error, setError] = useState("");

  // Single MCQ: options live in metadata.questions[0].options (string[])
  // Legacy: options could also be in settings.options ({key,text,is_correct}[])
  const metaQuestion = challenge.metadata?.questions?.[0] as any;
  const rawOptions: { key: string; text: string }[] =
    Array.isArray(metaQuestion?.options)
      ? (metaQuestion.options as string[]).map((text: string, i: number) => ({
          key: String.fromCharCode(65 + i).toLowerCase(), // a, b, c, d
          text,
        }))
      : (challenge.settings?.options ?? []).map((o: any) => ({
          key: o.key,
          text: o.text,
        }));

  const options = rawOptions;
  const [displayOptions] = useState(() =>
    challenge.settings?.shuffle_options
      ? [...options].sort(() => Math.random() - 0.5)
      : options
  );

  // question text from metadata (single-MCQ case)
  const questionText = metaQuestion?.question ?? null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOption) { setError("Silakan pilih salah satu jawaban"); return; }
    onSubmit(null, selectedOption);
    setError("");
  };

  if (!options || options.length === 0) {
    return (
      <div className="flex items-start gap-3 rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-5">
        <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
        <p className="text-[15px] text-red-600 dark:text-red-400">Challenge ini tidak memiliki opsi pilihan. Silakan hubungi instruktur.</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      <div className="flex items-center gap-3 px-6 py-4 border-b border-gray-100 dark:border-white/5">
        <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
          <Send className="h-4 w-4 text-[#1c81ff]" />
        </div>
        <span className="font-bold text-gray-900 dark:text-white">Pilih Jawaban</span>
      </div>

      <div className="p-5">
        {!canSubmit ? (
          <div className="flex items-start gap-3 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
            <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
            <p className="text-[14px] text-red-600 dark:text-red-400">Anda telah mencapai batas maksimum percobaan untuk challenge ini.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            {questionText && (
              <p className="text-[15px] font-bold text-gray-900 dark:text-white leading-relaxed">
                {questionText}
              </p>
            )}
            <RadioGroup value={selectedOption} onValueChange={setSelectedOption} className="space-y-2.5">
              {displayOptions.map((option: any) => (
                <div
                  key={option.key}
                  className={`flex items-start gap-3 rounded-xl border-[1.5px] p-4 cursor-pointer transition-all ${
                    selectedOption === option.key
                      ? "border-[#1c81ff] bg-[#1c81ff]/5 dark:bg-[#1c81ff]/10"
                      : "border-gray-200 dark:border-white/10 hover:border-[#1c81ff]/40 hover:bg-gray-50 dark:hover:bg-white/5"
                  }`}
                >
                  <RadioGroupItem value={option.key} id={option.key} className="mt-0.5 shrink-0" />
                  <Label htmlFor={option.key} className="flex-1 cursor-pointer text-[14px] leading-relaxed text-gray-700 dark:text-gray-300">
                    <span className={`font-extrabold mr-2 ${selectedOption === option.key ? "text-[#1c81ff]" : "text-gray-400 dark:text-gray-600"}`}>
                      {option.key.toUpperCase()}.
                    </span>
                    {option.text}
                  </Label>
                </div>
              ))}
            </RadioGroup>

            {error && (
              <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
                <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                <p className="text-[13px] text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <button type="submit" disabled={isSubmitting || !selectedOption}
              className="w-full flex items-center justify-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-3 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
              {isSubmitting ? <><Loader2 className="h-4 w-4 animate-spin" />Mengirim…</> : <><Send className="h-4 w-4" />Kirim Jawaban</>}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
