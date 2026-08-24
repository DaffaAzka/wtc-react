import { useState, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Upload, Loader2, AlertCircle, FileText, X } from "lucide-react";
import type { Challenge } from "@/types/model";

interface FileUploadFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function FileUploadForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: FileUploadFormProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // File validation helper
  const validateFile = (selectedFile: File): string | null => {
    // Max file size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (selectedFile.size > maxSize) {
      return "Ukuran file harus kurang dari 10MB";
    }

    // File type validation - allow common document and code files
    const allowedExtensions = [
      '.pdf', '.doc', '.docx', '.txt', '.zip', '.rar', '.7z',
      '.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.cpp', '.c',
      '.html', '.css', '.json', '.xml', '.md', '.sql',
      '.png', '.jpg', '.jpeg', '.gif', '.svg'
    ];
    const fileName = selectedFile.name.toLowerCase();
    const isAllowed = allowedExtensions.some(ext => fileName.endsWith(ext));

    if (!isAllowed) {
      return "Tipe file tidak diizinkan. Silakan upload dokumen, kode, atau arsip yang valid.";
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

  // Handle file removal
  const handleRemoveFile = () => {
    setFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!file) {
      setFileError("Silakan pilih file untuk diupload");
      return;
    }

    // Call parent submit handler
    onSubmit(file, "");

    // Reset form after submission
    setFile(null);
    setFileError("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Upload File</CardTitle>
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
            {/* File Upload Instructions */}
            <Alert>
              <Upload className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-1">Instruksi Upload:</p>
                <ul className="list-disc list-inside space-y-1 text-xs">
                  <li>Ukuran file maksimal: 10MB</li>
                  <li>Format yang diizinkan: PDF, DOC, ZIP, kode, gambar</li>
                  <li>Pastikan file sudah sesuai dengan requirement challenge</li>
                </ul>
              </AlertDescription>
            </Alert>

            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="file" className="text-sm font-medium">
                Pilih File *
              </Label>
              <Input
                ref={fileInputRef}
                id="file"
                type="file"
                onChange={handleFileChange}
                disabled={isSubmitting}
                className="cursor-pointer"
              />

              {/* Selected File Preview */}
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

              {/* Error Message */}
              {fileError && (
                <Alert variant="destructive" className="py-2">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-sm">{fileError}</AlertDescription>
                </Alert>
              )}

              {/* File Type Hint */}
              <p className="text-xs text-muted-foreground">
                Tipe file yang didukung: .pdf, .doc, .docx, .txt, .zip, .rar, kode sumber, dan gambar
              </p>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting || !file}
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
                  Upload File
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
