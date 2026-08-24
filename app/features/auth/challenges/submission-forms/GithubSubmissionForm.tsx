import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, AlertCircle, Send, FolderGit } from "lucide-react";
import type { Challenge } from "@/types/model";

interface GithubSubmissionFormProps {
  challenge: Challenge;
  canSubmit: boolean;
  isSubmitting: boolean;
  onSubmit: (file: File | null, content: string) => void;
}

export function GithubSubmissionForm({
  challenge,
  canSubmit,
  isSubmitting,
  onSubmit,
}: GithubSubmissionFormProps) {
  const [repoUrl, setRepoUrl] = useState("");
  const [branch, setBranch] = useState("main");
  const [error, setError] = useState("");

  // Validate GitHub URL
  const validateGithubUrl = (url: string): string | null => {
    if (!url.trim()) {
      return "URL repository GitHub tidak boleh kosong";
    }

    // Check if it's a valid GitHub URL
    const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w-]+\/[\w.-]+\/?$/;
    if (!githubPattern.test(url.trim())) {
      return "URL harus berupa repository GitHub yang valid (contoh: https://github.com/username/repo)";
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate URL
    const validationError = validateGithubUrl(repoUrl);
    if (validationError) {
      setError(validationError);
      return;
    }

    // Format submission content as JSON
    const submissionData = {
      repo_url: repoUrl.trim(),
      branch: branch.trim() || "main",
      submitted_at: new Date().toISOString(),
    };

    onSubmit(null, JSON.stringify(submissionData));
    setError("");
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2">
          <FolderGit className="h-5 w-5" />
          <CardTitle className="text-lg">Submit GitHub Repository</CardTitle>
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
              <FolderGit className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <p className="font-semibold mb-2">Instruksi:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs">
                  <li>Push code Anda ke repository GitHub (public atau private dengan akses instruktur)</li>
                  <li>Pastikan repository memiliki README.md yang jelas</li>
                  <li>Copy URL repository (contoh: https://github.com/username/repo)</li>
                  <li>Paste URL di bawah ini dan pilih branch yang akan dinilai</li>
                </ol>
              </AlertDescription>
            </Alert>

            {/* GitHub URL Input */}
            <div className="space-y-2">
              <Label htmlFor="repo-url" className="text-sm font-medium">
                URL Repository GitHub *
              </Label>
              <Input
                id="repo-url"
                type="url"
                value={repoUrl}
                onChange={(e) => setRepoUrl(e.target.value)}
                placeholder="https://github.com/username/repository"
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Format: https://github.com/username/repository
              </p>
            </div>

            {/* Branch Input */}
            <div className="space-y-2">
              <Label htmlFor="branch" className="text-sm font-medium">
                Branch (Opsional)
              </Label>
              <Input
                id="branch"
                type="text"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                placeholder="main"
                disabled={isSubmitting}
                className="font-mono text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Default: main. Masukkan nama branch yang akan dinilai (contoh: main, master, develop)
              </p>
            </div>

            {/* Preview */}
            {repoUrl && (
              <div className="p-3 bg-muted rounded-md space-y-2">
                <p className="text-xs font-semibold text-muted-foreground">Preview Submission:</p>
                <div className="text-xs font-mono space-y-1">
                  <p>Repository: <span className="text-primary">{repoUrl}</span></p>
                  <p>Branch: <span className="text-primary">{branch || "main"}</span></p>
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
              disabled={isSubmitting || !repoUrl.trim()}
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
                  Kirim Repository
                </>
              )}
            </Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
