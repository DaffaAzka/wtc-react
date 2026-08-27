import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import {
  Edit,
  MoreVertical,
  Trash2,
  Settings,
  ClipboardList,
  Code,
  ListTodo,
  FileText,
  Target,
  Lightbulb,
  Trophy,
  RotateCw,
  Hash,
  GitBranch,
  Box,
  Timer,
  User,
} from "lucide-react";

type Props = {
  challenge: Challenge;
  onEdit?: (challenge: Challenge) => void;
  onDelete?: (challenge: Challenge) => void;
  onManage?: (challenge: Challenge) => void;
  onViewSubmissions?: (challenge: Challenge) => void;
};

// Challenge type icon mapping
const challengeTypeIcons: Record<string, React.ElementType> = {
  multiple_choice: ListTodo,
  essay: FileText,
  code_editor: Code,
  file_upload: Code,
  github_submission: GitBranch,
  docker_project: Box,
  timed_exam: Timer,
  quiz_group: Lightbulb,
  mixed: Lightbulb,
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
  const Icon = challengeTypeIcons[challenge.type] || Lightbulb;

  // Difficulty color configuration
  const difficultyConfig = {
    easy: "bg-green-500/10 text-green-600 hover:bg-green-500/20 border-none",
    medium: "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/20 border-none",
    hard: "bg-red-500/10 text-red-600 hover:bg-red-500/20 border-none",
  };

  return (
    <Card className="border-none shadow-sm hover:shadow-md transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start gap-3">
          {/* Challenge Icon with Gradient Background */}
          <div className="p-2.5 rounded-lg bg-gradient-to-br from-blue-500/10 to-indigo-500/10 shrink-0">
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>

          {/* Title & Meta */}
          <div className="flex-1 min-w-0 space-y-2">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold leading-tight line-clamp-2">
                {challenge.title}
              </h3>

              {/* Actions Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity"
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
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => onDelete(challenge)}
                        className="text-red-600 focus:text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Order Badge */}
            {challenge.order !== undefined && challenge.order !== null && (
              <div className="flex items-center gap-1.5">
                <Hash className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground font-medium">
                  Order {challenge.order}
                </span>
              </div>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-3">
        {/* Type & Difficulty Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className="text-xs gap-1">
            <Icon className="h-3 w-3" />
            {getChallengeTypeLabel(challenge.type)}
          </Badge>
          {challenge.difficulty && (
            <Badge
              className={`text-xs ${
                difficultyConfig[challenge.difficulty as keyof typeof difficultyConfig]
              }`}>
              {challenge.difficulty.charAt(0).toUpperCase() +
                challenge.difficulty.slice(1)}
            </Badge>
          )}
          {questionCount > 0 && (
            <Badge variant="secondary" className="text-xs gap-1">
              <ListTodo className="h-3 w-3" />
              {questionCount} {questionCount === 1 ? "Question" : "Questions"}
            </Badge>
          )}
        </div>

        {/* Stats Grid */}
        <div className="space-y-2.5">
          {/* Max Score */}
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-md bg-blue-500/10">
              <Target className="h-3.5 w-3.5 text-blue-600" />
            </div>
            <div className="flex-1">
              <span className="text-muted-foreground text-xs">Max Score</span>
            </div>
            <span className="font-semibold text-sm">{challenge.max_score}</span>
          </div>

          {/* Points */}
          {challenge.points !== undefined && challenge.points !== null && (
            <div className="flex items-center gap-2 text-sm">
              <div className="p-1.5 rounded-md bg-amber-500/10">
                <Trophy className="h-3.5 w-3.5 text-amber-600" />
              </div>
              <div className="flex-1">
                <span className="text-muted-foreground text-xs">Points (EXP)</span>
              </div>
              <span className="font-semibold text-sm">{challenge.points}</span>
            </div>
          )}

          {/* Allowed Attempts */}
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-md bg-cyan-500/10">
              <RotateCw className="h-3.5 w-3.5 text-cyan-600" />
            </div>
            <div className="flex-1">
              <span className="text-muted-foreground text-xs">Attempts</span>
            </div>
            <span className="font-semibold text-sm">
              {challenge.allowed_attempts === null ||
              challenge.allowed_attempts === -1 ||
              challenge.allowed_attempts === 0
                ? "Unlimited"
                : challenge.allowed_attempts}
            </span>
          </div>

          {/* Created By */}
          <div className="flex items-center gap-2 text-sm">
            <div className="p-1.5 rounded-md bg-purple-500/10">
              <User className="h-3.5 w-3.5 text-purple-600" />
            </div>
            <div className="flex-1">
              <span className="text-muted-foreground text-xs">Created By</span>
            </div>
            <span className="font-semibold text-sm">
              {(challenge as any).created_by?.name || "Admin"}
            </span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-2">
          {onManage && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => onManage(challenge)}>
              <Settings className="h-3.5 w-3.5" />
              Manage
            </Button>
          )}
          {onViewSubmissions && (
            <Button
              size="sm"
              variant="outline"
              className="flex-1 gap-1.5"
              onClick={() => onViewSubmissions(challenge)}>
              <ClipboardList className="h-3.5 w-3.5" />
              Submissions
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
