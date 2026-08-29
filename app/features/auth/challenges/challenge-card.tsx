import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import type { Challenge } from "@/types/model";
import { Link } from "react-router";
import {
  Edit,
  Eye,
  MoreVertical,
  Trash2,
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
  onViewSubmissions?: (challenge: Challenge) => void;
};

const CHALLENGE_TYPE_ICONS: Record<string, React.ElementType> = {
  multiple_choice:   ListTodo,
  essay:             FileText,
  code_editor:       Code,
  file_upload:       Code,
  github_submission: GitBranch,
  docker_project:    Box,
  timed_exam:        Timer,
  quiz_group:        Lightbulb,
  mixed:             Lightbulb,
};

const CHALLENGE_TYPE_LABELS: Record<string, string> = {
  multiple_choice:   "Multiple Choice",
  essay:             "Essay",
  code_editor:       "Code Editor",
  file_upload:       "Coding Assignment",
  github_submission: "GitHub Submission",
  docker_project:    "Docker Project",
  timed_exam:        "Timed Exam",
  quiz_group:        "Mixed Quiz",
  mixed:             "Mixed Quiz",
};

const DIFFICULTY_STYLE: Record<string, { bg: string; text: string }> = {
  easy:   { bg: "bg-[#00E676]/10", text: "text-[#00E676]" },
  medium: { bg: "bg-[#f6b60b]/10", text: "text-[#f6b60b]" },
  hard:   { bg: "bg-[#ff007b]/10", text: "text-[#ff007b]" },
};

function getQuestionCount(challenge: Challenge): number {
  const questions = challenge.metadata?.questions;
  return Array.isArray(questions) ? questions.length : 0;
}

export default function ChallengeCard({
  challenge,
  onEdit,
  onDelete,
  onViewSubmissions,
}: Props) {
  const questionCount = getQuestionCount(challenge);
  const Icon = CHALLENGE_TYPE_ICONS[challenge.type] ?? Lightbulb;
  const typeLabel = CHALLENGE_TYPE_LABELS[challenge.type] ?? challenge.type;
  const diffStyle = challenge.difficulty
    ? DIFFICULTY_STYLE[challenge.difficulty.toLowerCase()]
    : null;

  return (
    <div className="group rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 overflow-hidden flex flex-col">
      {/* Header */}
      <div className="p-5 pb-3 border-b border-gray-100 dark:border-white/5">
        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className="shrink-0 w-10 h-10 rounded-xl bg-[#1c81ff]/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-[#1c81ff]" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0 space-y-1.5">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-extrabold text-[14px] text-gray-900 dark:text-white leading-snug line-clamp-2" style={{ letterSpacing: "-0.01em" }}>
                {challenge.title}
              </h3>

              {/* Actions dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className="flex items-center justify-center h-7 w-7 shrink-0 rounded-lg text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-gray-700 dark:hover:text-gray-300 opacity-0 group-hover:opacity-100 transition-all"
                    aria-label={`Actions for ${challenge.title}`}
                  >
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="rounded-xl">
                  <Link to={`/admin/challenges/${challenge.id}`}>
                    <DropdownMenuItem className="rounded-lg">
                      <Eye className="h-4 w-4 mr-2" /> View
                    </DropdownMenuItem>
                  </Link>
                  <DropdownMenuSeparator />
                  {onViewSubmissions && (
                    <>
                      <DropdownMenuItem className="rounded-lg" onClick={() => onViewSubmissions(challenge)}>
                        <ClipboardList className="h-4 w-4 mr-2" /> View Submissions
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  {onEdit && (
                    <DropdownMenuItem className="rounded-lg" onClick={() => onEdit(challenge)}>
                      <Edit className="h-4 w-4 mr-2" /> Edit
                    </DropdownMenuItem>
                  )}
                  {onDelete && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem variant="destructive" className="rounded-lg" onClick={() => onDelete(challenge)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Order */}
            {challenge.order !== undefined && challenge.order !== null && (
              <div className="flex items-center gap-1">
                <Hash className="h-3 w-3 text-gray-400 dark:text-gray-600" />
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-600">
                  Order {challenge.order}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-4 flex-1">
        {/* Badges */}
        <div className="flex flex-wrap gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2.5 py-0.5 text-[11px] font-bold text-gray-500 dark:text-gray-400">
            <Icon className="h-3 w-3" />
            {typeLabel}
          </span>
          {diffStyle && challenge.difficulty && (
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-bold uppercase tracking-[0.08em] capitalize ${diffStyle.bg} ${diffStyle.text}`}>
              {challenge.difficulty}
            </span>
          )}
          {questionCount > 0 && (
            <span className="inline-flex items-center gap-1 rounded-lg bg-[#2548d8]/10 border border-[#2548d8]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#2548d8]">
              <ListTodo className="h-3 w-3" />
              {questionCount} {questionCount === 1 ? "Question" : "Questions"}
            </span>
          )}
        </div>

        {/* Stats */}
        <div className="space-y-2">
          {[
            { icon: Target,  bg: "bg-[#1c81ff]/10",  color: "text-[#1c81ff]",  label: "Max Score",    value: challenge.max_score },
            ...(challenge.points !== undefined && challenge.points !== null
              ? [{ icon: Trophy, bg: "bg-[#f6b60b]/10", color: "text-[#f6b60b]", label: "Points (EXP)", value: challenge.points }]
              : []),
            { icon: RotateCw, bg: "bg-[#31c7c8]/10", color: "text-[#31c7c8]",  label: "Attempts",
              value: (challenge.allowed_attempts === null || challenge.allowed_attempts === -1 || challenge.allowed_attempts === 0)
                ? "Unlimited" : challenge.allowed_attempts },
            { icon: User, bg: "bg-gray-100 dark:bg-white/5", color: "text-gray-500 dark:text-gray-400", label: "Created By",
              value: (challenge as any).created_by?.name || "Admin" },
          ].map(({ icon: StatIcon, bg, color, label, value }) => (
            <div key={label} className="flex items-center gap-2">
              <div className={`w-6 h-6 rounded-md ${bg} flex items-center justify-center shrink-0`}>
                <StatIcon className={`h-3.5 w-3.5 ${color}`} />
              </div>
              <span className="text-[12px] text-gray-500 dark:text-gray-400 flex-1">{label}</span>
              <span className="text-[13px] font-bold text-gray-900 dark:text-white tabular-nums">{value}</span>
            </div>
          ))}
        </div>

        {/* Action */}
        {onViewSubmissions && (
          <button
            onClick={() => onViewSubmissions(challenge)}
            className="w-full flex items-center justify-center gap-2 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl py-2 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1c81ff] hover:border-[#1c81ff]/30 transition-all"
          >
            <ClipboardList className="h-3.5 w-3.5" />
            Submissions
          </button>
        )}
      </div>
    </div>
  );
}
