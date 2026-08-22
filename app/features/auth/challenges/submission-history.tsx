import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2 } from "lucide-react";
import type { Submission } from "@/types/submission";

interface SubmissionHistoryProps {
  submissions: Submission[];
  maxScore: number;
}

export function SubmissionHistory({ submissions, maxScore }: SubmissionHistoryProps) {
  if (submissions.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Riwayat Pengumpulan</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {submissions.map((submission, index) => (
            <div
              key={submission.id}
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-medium">
                      Percobaan #{index + 1}
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
                        Skor: {submission.score}/{maxScore}
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
  );
}
