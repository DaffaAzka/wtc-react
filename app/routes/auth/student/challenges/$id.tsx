import { useState, useRef } from "react";
import { useParams, Link } from "react-router";
import { useGetChallenge } from "@/hooks/challenges";
import { useSubmitChallenge, useMySubmissions } from "@/hooks/submission";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, Upload, Loader2, AlertCircle, CheckCircle2, FileText, Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function ChallengeDetailPage() {
  // Get challenge ID from URL params
  const { id } = useParams<{ id: string }>();
  const challengeId = Number(id);

  // Hooks for data fetching
  const { challenge, loading, error } = useGetChallenge(challengeId);
  const { data: submissions = [], isLoading: submissionsLoading } = useMySubmissions(challengeId);
  const { mutate: submitChallenge, isPending: isSubmitting } = useSubmitChallenge();

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

    // Submit the challenge
    submitChallenge(
      {
        challengeId,
        request: {
          file: file || undefined,
          content: content.trim() || undefined,
        },
      },
      {
        onSuccess: () => {
          // Reset form on success
          setFile(null);
          setContent("");
          setFileError("");
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
      }
    );
  };

  // Calculate remaining attempts
  const submissionCount = submissions.length;
  const allowedAttempts = challenge?.allowed_attempts || 0;
  const remainingAttempts = allowedAttempts > 0 ? allowedAttempts - submissionCount : Infinity;
  const canSubmit = remainingAttempts > 0 || allowedAttempts === 0;

  // Loading state
  if (loading || submissionsLoading) {
    return (
      <div className="container max-w-4xl mx-auto p-6 space-y-6">
        <Skeleton className="h-10 w-32" />
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  // Error state
  if (error || !challenge) {
    return (
      <div className="container max-w-4xl mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || "Challenge not found"}
          </AlertDescription>
        </Alert>
        <Button variant="ghost" className="mt-4" asChild>
          <Link to="/student/dashboard">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
      </div>
    );
  }

  // Get challenge type display name
  const getChallengeTypeDisplay = (type: string) => {
    const typeMap: Record<string, string> = {
      multiple_choice: "Multiple Choice",
      essay: "Essay",
      code_editor: "Code Editor",
      file_upload: "File Upload",
      github_submission: "GitHub Submission",
      docker_project: "Docker Project",
      timed_exam: "Timed Exam",
      quiz_group: "Quiz Group",
    };
    return typeMap[type] || type;
  };

  // Get difficulty color
  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case "easy":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300";
      case "medium":
        return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300";
      case "hard":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300";
      default:
        return "";
    }
  };

  return (
    <div className="container max-w-4xl mx-auto p-6 space-y-6">
      {/* Back button */}
      <Button variant="ghost" size="sm" asChild>
        <Link to="/student/dashboard">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Kembali ke Dashboard
        </Link>
      </Button>

      {/* Challenge Details Card */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-3">{challenge.title}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                {challenge.difficulty && (
                  <Badge
                    variant="outline"
                    className={cn("capitalize", getDifficultyColor(challenge.difficulty))}
                  >
                    {challenge.difficulty}
                  </Badge>
                )}
                <Badge variant="secondary">
                  {challenge.max_score} poin
                </Badge>
                <Badge variant="outline">
                  {getChallengeTypeDisplay(challenge.type)}
                </Badge>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Challenge content */}
          <div
            className="prose prose-sm max-w-none dark:prose-invert"
            dangerouslySetInnerHTML={{ __html: challenge.content }}
          />

          {/* Challenge info panel */}
          <div className="mt-6 p-4 bg-muted rounded-lg space-y-3">
            <div className="flex justify-between items-center text-sm">
              <span className="text-muted-foreground">Skor Maksimum:</span>
              <span className="font-semibold">{challenge.max_score}</span>
            </div>

            {challenge.allowed_attempts && challenge.allowed_attempts > 0 && (
              <>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Percobaan Diizinkan:</span>
                  <span className="font-semibold">{challenge.allowed_attempts}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Sudah Dikumpulkan:</span>
                  <span className="font-semibold">{submissionCount}</span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground">Sisa Percobaan:</span>
                  <span
                    className={cn(
                      "font-semibold",
                      remainingAttempts === 0 && "text-destructive"
                    )}
                  >
                    {remainingAttempts}
                  </span>
                </div>
              </>
            )}
          </div>

          {/* Attachments */}
          {challenge.attachments && challenge.attachments.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-semibold mb-2">Lampiran:</h4>
              <div className="space-y-2">
                {challenge.attachments.map((attachment) => (
                  <div
                    key={attachment.id}
                    className="flex items-center gap-2 p-2 border rounded-md"
                  >
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{attachment.title}</p>
                      {attachment.description && (
                        <p className="text-xs text-muted-foreground">{attachment.description}</p>
                      )}
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {attachment.type}
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Previous Submissions */}
      {submissions.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Riwayat Pengumpulan</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {submissions.map((submission) => (
                <div
                  key={submission.id}
                  className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          Percobaan #{submission.attempt_number}
                        </span>
                        <Badge
                          variant={submission.status === 'graded' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {submission.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        {submission.submitted_at && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {new Date(submission.submitted_at).toLocaleString('id-ID')}
                          </span>
                        )}
                        {submission.score !== null && (
                          <span className="flex items-center gap-1 font-medium text-foreground">
                            <CheckCircle2 className="h-3 w-3" />
                            Skor: {submission.score}/{challenge.max_score}
                          </span>
                        )}
                      </div>
                      {submission.feedback && (
                        <p className="text-sm mt-2 p-2 bg-muted rounded">
                          <span className="font-medium">Feedback:</span> {submission.feedback}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submission Form */}
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
    </div>
  );
}
