import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, AlertCircle, Send, Code } from "lucide-react";
import type { Challenge } from "@/types/model";

interface CodeEditorFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function CodeEditorForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: CodeEditorFormProps) {
  const [code, setCode] = useState("");
  const [language, setLanguage] = useState("javascript");
  const [error, setError] = useState("");

  // Programming languages support
  const languages = [
    { value: "javascript", label: "JavaScript" },
    { value: "typescript", label: "TypeScript" },
    { value: "python", label: "Python" },
    { value: "java", label: "Java" },
    { value: "cpp", label: "C++" },
    { value: "c", label: "C" },
    { value: "go", label: "Go" },
    { value: "rust", label: "Rust" },
    { value: "php", label: "PHP" },
    { value: "ruby", label: "Ruby" },
    { value: "sql", label: "SQL" },
    { value: "html", label: "HTML" },
    { value: "css", label: "CSS" },
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!code.trim()) {
      setError("Silakan masukkan kode Anda");
      return;
    }

    // Minimum code length check
    const minLength = 10;
    if (code.trim().length < minLength) {
      setError(`Kode harus minimal ${minLength} karakter`);
      return;
    }

    // Format submission with language metadata
    const submissionData = {
      language,
      code: code.trim(),
      submitted_at: new Date().toISOString(),
    };

    onSubmit(null, JSON.stringify(submissionData));
    setError("");
  };

  const lineCount = code.split("\n").length;
  const charCount = code.length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Code className="h-5 w-5" />
          <CardTitle className="text-lg">Submit Kode</CardTitle>
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
              <Code className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-1">Tips Menulis Kode:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Gunakan indentasi yang konsisten (2 atau 4 spasi)</li>
                  <li>Tambahkan komentar untuk menjelaskan logika kompleks</li>
                  <li>Test kode Anda sebelum submit</li>
                  <li>Pastikan kode sesuai dengan requirement challenge</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* Language Selector */}
            <div className="space-y-2">
              <Label htmlFor="language" className="text-sm font-medium">
                Bahasa Pemrograman
              </Label>
              <Select value={language} onValueChange={setLanguage} disabled={isSubmitting}>
                <SelectTrigger id="language" className="w-full">
                  <SelectValue placeholder="Pilih bahasa..." />
                </SelectTrigger>
                <SelectContent>
                  {languages.map((lang) => (
                    <SelectItem key={lang.value} value={lang.value}>
                      {lang.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Code Editor */}
            <div className="space-y-2">
              <Label htmlFor="code-editor" className="text-sm font-medium">
                Kode Anda *
              </Label>
              <Textarea
                id="code-editor"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder={`// Tulis kode ${language} Anda di sini...\n\nfunction solve() {\n  // your solution\n}`}
                rows={20}
                disabled={isSubmitting}
                className="font-mono text-sm leading-relaxed resize-none bg-slate-950 text-green-400 border-slate-700"
                spellCheck={false}
              />

              {/* Code stats */}
              <div className="flex justify-between items-center text-xs text-muted-foreground">
                <span>{lineCount} baris</span>
                <span>{charCount} karakter</span>
              </div>

              {/* Syntax hints based on language */}
              {language === "python" && (
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Python menggunakan indentasi untuk block code, bukan kurung kurawal
                </p>
              )}
              {language === "javascript" && (
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Gunakan const/let, hindari var. Gunakan arrow function untuk callback
                </p>
              )}
              {language === "java" && (
                <p className="text-xs text-muted-foreground">
                  💡 Tip: Setiap class harus dalam package. Main method: public static void main(String[] args)
                </p>
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
              disabled={isSubmitting || !code.trim()}
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
                  Kirim Kode
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
