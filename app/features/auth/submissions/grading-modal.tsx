import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { useGetSubmission, useUpdateSubmission, useGetSubmissionFile } from "@/hooks/submission";
import { Download, Calendar, Hash, FileText, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import type { UpdateSubmissionRequest } from "@/services/submission";

interface GradingModalProps {
  submissionId: number | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

function getStatusBadgeVariant(status: string) {
  switch (status) {
    case "submitted":
      return "default";
    case "graded":
      return "secondary";
    case "returned":
      return "outline";
    default:
      return "outline";
  }
}

function getStatusLabel(status: string) {
  switch (status) {
    case "submitted":
      return "Submitted";
    case "graded":
      return "Graded";
    case "returned":
      return "Returned";
    case "draft":
      return "Draft";
    default:
      return status;
  }
}

export default function GradingModal({ submissionId, isOpen, onOpenChange }: GradingModalProps) {
  const { data, isLoading, error } = useGetSubmission(submissionId || 0);
  const updateSubmission = useUpdateSubmission();
  const getFile = useGetSubmissionFile();

  const [score, setScore] = useState<string>("");
  const [feedback, setFeedback] = useState<string>("");
  const [status, setStatus] = useState<string>("submitted");
  const [scoreError, setScoreError] = useState<string>("");

  // Reset form when submission data changes
  useEffect(() => {
    if (data?.submission) {
      setScore(data.submission.score?.toString() || "");
      setFeedback(data.submission.feedback || "");
      setStatus(data.submission.status);
      setScoreError("");
    }
  }, [data]);

  const handleDownloadFile = () => {
    if (submissionId) {
      getFile.mutate(submissionId);
    }
  };

  const validateScore = (value: string): boolean => {
    if (!value) {
      setScoreError("Score is required");
      return false;
    }

    const numValue = parseFloat(value);
    if (isNaN(numValue)) {
      setScoreError("Score must be a number");
      return false;
    }

    const maxScore = data?.submission?.challenge?.max_score || 100;
    if (numValue < 0 || numValue > maxScore) {
      setScoreError(`Score must be between 0 and ${maxScore}`);
      return false;
    }

    setScoreError("");
    return true;
  };

  const handleSubmit = () => {
    if (!submissionId || !data?.submission) return;

    // Validate score
    if (!validateScore(score)) {
      return;
    }

    const request: UpdateSubmissionRequest = {
      score: parseFloat(score),
      feedback: feedback.trim() || undefined,
      status: status as "draft" | "submitted" | "graded" | "returned",
    };

    updateSubmission.mutate(
      { submissionId, request },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      }
    );
  };

  if (!isOpen || !submissionId) return null;

  const submission = data?.submission;
  const profile = submission?.profile;
  const challenge = submission?.challenge;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-muted-foreground">Loading submission...</div>
        ) : error ? (
          <div className="py-8 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-2 text-destructive" />
            <p className="text-sm text-destructive">Failed to load submission</p>
          </div>
        ) : submission ? (
          <div className="space-y-6">
            {/* Student Information */}
            <div className="flex items-center gap-3 p-4 bg-muted/50 rounded-lg">
              <Avatar size="lg">
                <AvatarImage src={profile?.avatar || undefined} alt={profile?.display_name || ""} />
                <AvatarFallback>
                  {profile?.display_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium">{profile?.display_name || "Unknown Student"}</h3>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
              <Badge variant={getStatusBadgeVariant(submission.status)}>
                {getStatusLabel(submission.status)}
              </Badge>
            </div>

            {/* Challenge Information */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Challenge</h4>
              <div className="p-3 bg-muted/30 rounded-lg space-y-1">
                <p className="font-medium">{challenge?.title}</p>
                <p className="text-xs text-muted-foreground">
                  Type: {challenge?.type} • Max Score: {challenge?.max_score}
                </p>
              </div>
            </div>

            {/* Submission Details */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium">Submission Details</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Hash className="h-3 w-3" />
                  <span>Attempt #{submission.attempt_number}</span>
                </div>
                {submission.submitted_at && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    <span>Submitted: {format(new Date(submission.submitted_at), "PPp")}</span>
                  </div>
                )}
                {submission.file_path && (
                  <div className="flex items-center gap-2">
                    <FileText className="h-3 w-3 text-muted-foreground" />
                    <span className="text-xs flex-1 truncate">{submission.file_path.split("/").pop()}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleDownloadFile}
                      disabled={getFile.isPending}
                    >
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                  </div>
                )}
                {submission.content && (
                  <div className="mt-2">
                    <Label>Submitted Content</Label>
                    <div className="mt-1 p-3 bg-muted/30 rounded-lg text-xs whitespace-pre-wrap max-h-40 overflow-y-auto">
                      {submission.content}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Grading Form */}
            <div className="space-y-4 pt-4 border-t">
              <div className="space-y-2">
                <Label htmlFor="score">
                  Score <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="score"
                  type="number"
                  step="0.1"
                  min="0"
                  max={challenge?.max_score || 100}
                  value={score}
                  onChange={(e) => {
                    setScore(e.target.value);
                    setScoreError("");
                  }}
                  placeholder={`Enter score (0-${challenge?.max_score || 100})`}
                  aria-invalid={!!scoreError}
                />
                {scoreError && (
                  <p className="text-xs text-destructive">{scoreError}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger id="status" className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="submitted">Submitted</SelectItem>
                    <SelectItem value="graded">Graded</SelectItem>
                    <SelectItem value="returned">Returned</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="feedback">Feedback</Label>
                <Textarea
                  id="feedback"
                  value={feedback}
                  onChange={(e) => setFeedback(e.target.value)}
                  placeholder="Enter feedback for the student (optional)"
                  rows={4}
                />
              </div>
            </div>
          </div>
        ) : null}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!submission || updateSubmission.isPending || isLoading}
          >
            {updateSubmission.isPending ? "Saving..." : "Save Grade"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
