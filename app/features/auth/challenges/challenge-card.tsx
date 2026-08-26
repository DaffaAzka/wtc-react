import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Challenge } from "@/types/model";
import { Edit, MoreVertical, Trash2, Settings, ClipboardList } from "lucide-react";

type Props = {
  challenge: Challenge;
  onEdit?: (challenge: Challenge) => void;
  onDelete?: (challenge: Challenge) => void;
  onManage?: (challenge: Challenge) => void;
  onViewSubmissions?: (challenge: Challenge) => void;
};

const getChallengeTypeLabel = (type: string): string => {
  const labels: Record<string, string> = {
    multiple_choice: "Multiple Choice",
    essay: "Essay",
    code_editor: "Code Editor",
    file_upload: "Coding Assignment",
    github_submission: "GitHub Submission",
    docker_project: "Docker Project",
    timed_exam: "Timed Exam",
    quiz_group: "Mixed Quiz",
    mixed: "Mixed Quiz",
  };
  return labels[type] || type;
};

const getDifficultyVariant = (
  difficulty?: string,
): "default" | "secondary" | "destructive" => {
  if (difficulty === "easy") return "secondary";
  if (difficulty === "medium") return "default";
  if (difficulty === "hard") return "destructive";
  return "default";
};

const getQuestionCount = (challenge: Challenge): number => {
  const questions = challenge.metadata?.questions;
  if (Array.isArray(questions)) {
    return questions.length;
  }
  return 0;
};

export default function ChallengeCard({
  challenge,
  onEdit,
  onDelete,
  onManage,
  onViewSubmissions,
}: Props) {
  const questionCount = getQuestionCount(challenge);

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="space-y-2 flex-1 min-w-0">
            {/* Title with optional order badge */}
            <div className="flex items-center gap-2">
              {challenge.order !== undefined && challenge.order !== null && (
                <Badge variant="outline" className="shrink-0 font-mono text-xs">
                  #{challenge.order}
                </Badge>
              )}
              <CardTitle className="text-lg truncate">{challenge.title}</CardTitle>
            </div>

            {/* Type and Difficulty badges */}
            <div className="flex items-center gap-2 flex-wrap">
              <Badge variant="outline" className="font-normal">
                {getChallengeTypeLabel(challenge.type)}
              </Badge>
              {challenge.difficulty && (
                <Badge variant={getDifficultyVariant(challenge.difficulty)}>
                  {challenge.difficulty.charAt(0).toUpperCase() + challenge.difficulty.slice(1)}
                </Badge>
              )}
            </div>
          </div>

          {/* Action menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="shrink-0"
                aria-label={`Actions for ${challenge.title}`}>
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {onViewSubmissions && (
                <>
                  <DropdownMenuItem onClick={() => onViewSubmissions(challenge)}>
                    <ClipboardList className="h-4 w-4 mr-2" />
                    View Submissions
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              {onManage && (
                <DropdownMenuItem onClick={() => onManage(challenge)}>
                  <Settings className="h-4 w-4 mr-2" />
                  Manage
                </DropdownMenuItem>
              )}
              {onEdit && (
                <DropdownMenuItem onClick={() => onEdit(challenge)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
              )}
              {onDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(challenge)}
                  className="text-red-600 focus:text-red-600">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
          {/* Question count - prominently displayed if available */}
          {questionCount > 0 && (
            <div className="col-span-2 pb-2 border-b">
              <p className="text-muted-foreground text-xs">Questions</p>
              <p className="font-semibold text-base">{questionCount} {questionCount === 1 ? 'Question' : 'Questions'}</p>
            </div>
          )}
          
          {/* Max Score */}
          <div>
            <p className="text-muted-foreground text-xs">Max Score</p>
            <p className="font-medium">{challenge.max_score}</p>
          </div>
          
          {/* Points */}
          {challenge.points !== undefined && challenge.points !== null && (
            <div>
              <p className="text-muted-foreground text-xs">Points</p>
              <p className="font-medium">{challenge.points}</p>
            </div>
          )}
          
          {/* Allowed Attempts */}
          <div className="col-span-2">
            <p className="text-muted-foreground text-xs">Allowed Attempts</p>
            <p className="font-medium">
              {challenge.allowed_attempts === null || challenge.allowed_attempts === -1 || challenge.allowed_attempts === 0
                ? "Unlimited"
                : `${challenge.allowed_attempts} ${challenge.allowed_attempts === 1 ? 'Attempt' : 'Attempts'}`}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
