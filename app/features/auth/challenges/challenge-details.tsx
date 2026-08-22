import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Challenge, ChallengeAttachment } from "@/types/model";

interface ChallengeDetailsProps {
  challenge: Challenge;
  submissionCount: number;
  remainingAttempts: number | typeof Infinity;
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

export function ChallengeDetails({ challenge, submissionCount, remainingAttempts }: ChallengeDetailsProps) {
  return (
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
              {challenge.attachments.map((attachment: ChallengeAttachment) => (
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
  );
}
