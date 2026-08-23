import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, AlertCircle, FileText, X, Package } from "lucide-react";
import type { Challenge } from "@/types/model";

interface DockerProjectFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function DockerProjectForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: DockerProjectFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [dockerCommands, setDockerCommands] = useState("");
  const [notes, setNotes] = useState("");
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation for Docker projects
  const validateFile = (selectedFile: File): string | null => {
    const maxSize = 50 * 1024 * 1024; // 50MB for Docker projects
    if (selectedFile.size > maxSize) {
      return "Ukuran file harus kurang dari 50MB";
    }

    // Allow ZIP, TAR, and Docker-related files
    const allowedExtensions = ['.zip', '.tar', '.tar.gz', '.tgz', '.rar'];
    const fileName = selectedFile.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      return "File harus berupa arsip (ZIP, TAR, RAR) yang berisi Docker project";
    }

    return null;
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (!selectedFile) {
      setFile(null);
      setFileError("");
      return;
    }

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

  const handleRemoveFile = () => {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setFileError("Silakan upload file Docker project (ZIP/TAR)");
      return;
    }

    if (!dockerCommands.trim()) {
      setFileError("Silakan masukkan Docker commands untuk menjalankan project");
      return;
    }

    // Format submission data
    const submissionData = {
      docker_commands: dockerCommands.trim(),
      notes: notes.trim(),
      filename: file.name,
      submitted_at: new Date().toISOString(),
    };

    onSubmit(file, JSON.stringify(submissionData));

    // Reset form
    setFile(null);
    setDockerCommands("");
    setNotes("");
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Package className="h-5 w-5" />
          <CardTitle className="text-lg">Submit Docker Project</CardTitle>
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
              <Package className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-1">Requirement Docker Project:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>File harus berisi Dockerfile, docker-compose.yml (jika ada), dan source code</li>
                  <li>Compress project menjadi ZIP atau TAR (maksimal 50MB)</li>
                  <li>Pastikan Docker image bisa di-build tanpa error</li>
                  <li>Sertakan README.md dengan instruksi setup</li>
                  <li>Tulis Docker commands untuk build dan run</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="docker-file" className="text-sm font-medium">
                Upload Docker Project (ZIP/TAR) *
              </Label>
              <Input
                ref={fileInputRef}
                id="docker-file"
                type="file"
                accept=".zip,.tar,.tar.gz,.tgz,.rar"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="cursor-pointer"
              />

              {file && (
                <div className="flex items-center justify-between gap-2 p-3 bg-muted rounded-md">
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <FileText className="h-5 w-5 text-muted-foreground flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{file.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(file.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveFile}
                    disabled={isSubmitting}
                    className="flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}

              <p className="text-xs text-muted-foreground">
                Format: .zip, .tar, .tar.gz (maksimal 50MB)
              </p>
            </div>

            {/* Docker Commands */}
            <div className="space-y-2">
              <Label htmlFor="docker-commands" className="text-sm font-medium">
                Docker Commands *
              </Label>
              <Textarea
                id="docker-commands"
                value={dockerCommands}
                onChange={(e) => setDockerCommands(e.target.value)}
                placeholder="# Build image&#10;docker build -t myapp:latest .&#10;&#10;# Run container&#10;docker run -p 8080:8080 myapp:latest&#10;&#10;# Atau dengan docker-compose&#10;docker-compose up -d"
                rows={8}
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Tulis command untuk build dan run Docker project (contoh: docker build, docker run, docker-compose up)
              </p>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium">
                Catatan Tambahan (Opsional)
              </Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Environment variables yang dibutuhkan, port yang digunakan, atau informasi penting lainnya..."
                rows={4}
                disabled={isSubmitting}
                className="text-sm"
              />
            </div>

            {/* Error Message */}
            {fileError && (
              <Alert variant="destructive" className="py-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">{fileError}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !file || !dockerCommands.trim()}
              className="w-full"
              size="lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Mengupload...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Submit Docker Project
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
