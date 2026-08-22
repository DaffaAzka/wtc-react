import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, AlertCircle, FileText } from "lucide-react";
import type { Challenge } from "@/types/model";

interface SubmissionFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function SubmissionForm({ challenge, canSubmit, isSubmitting, onSubmit }: SubmissionFormProps) {
  // Form state
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation helper
  const validateFile = (selectedFile: File): string | null => {
    // Max file size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      return "File size must be less than 10MB";
    }

    // File type validation based on challenge type
    if (challenge?.type === "file_upload") {
      // Allow common document and code files
      const allowedExtensions = [
        '.pdf', '.doc', '.docx', '.txt', '.zip', '.rar',
        '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c', '.html', '.css'
      ];
      const fileName = selectedFile.name.toLowerCase();
      const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

      if (!isAllowed) {
        return "File type not allowed. Please upload a valid document or code file.";
      }
    }

    return null;
  };

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setFileError("");
      return;
    }

    // Validate file
    const error = validateFile(selectedFile);
    if (error) {
      setFileError(error);
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setFileError("");
    setFile(selectedFile);
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation: at least one input is required
    if (!file && !content.trim()) {
      setFileError("Please provide either a file or text submission");
      return;
    }

    // Call parent submit handler
    onSubmit(file, content.trim());

    // Reset form on success (parent will handle the API call)
    setFile(null);
    setContent("");
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Kirim Jawaban</CardTitle>
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
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium">
                Upload File (Opsional)
              </Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="cursor-pointer"
              />
              {file && (
                <div className="flex items-center gap-2 p-2 bg-muted rounded-md">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <div className="flex-1">
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
              )}
              {fileError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{fileError}</AlertDescription>
                </Alert>
              )}
              <p className="text-xs text-muted-foreground">
                Ukuran file maksimal: 10MB
              </p>
            </div>

            {/* Text Content Section */}
            <div className="space-y-2">
              <Label htmlFor="content" className="text-sm font-medium">
                Jawaban Teks (Opsional)
              </Label>
              <Textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Masukkan jawaban atau kode Anda di sini..."
                rows={12}
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Anda dapat mengirim file, teks, atau keduanya
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || (!file && !content.trim())}
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
                  <Upload className="h-4 w-4 mr-2" />
                  Kirim Tugas
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
