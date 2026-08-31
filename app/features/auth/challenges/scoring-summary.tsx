import type { Question, ChallengeFormType } from "@/types/challenge";
import {
  calculateMCQScore,
  calculateEssayScore,
  calculateMixedScores,
} from "@/helper/calculate-score";

type Props = {
  type: ChallengeFormType;
  maxScore: number;
  questions: Question[];
};

export default function ScoringSummary({ type, maxScore, questions }: Props) {
  const mcqCount   = questions.filter((q) => q.type === "multiple_choice").length;
  const essayCount = questions.filter((q) => q.type === "essay").length;
  const totalQuestions = questions.length;

  if (totalQuestions === 0) return null;

  const rows: { label: string; value: string | number }[] = [];

  if (type === "multiple_choice" || type === "quiz_group") {
    const scorePerQuestion = calculateMCQScore(maxScore, mcqCount);
    rows.push(
      { label: "Max Score",        value: maxScore },
      { label: "Questions",        value: `${mcqCount} × ${scorePerQuestion} pts` },
      { label: "Total Questions",  value: totalQuestions },
    );
  } else if (type === "essay") {
    const scorePerQuestion = calculateEssayScore(maxScore, essayCount);
    rows.push(
      { label: "Max Score",        value: maxScore },
      { label: "Questions",        value: `${essayCount} × ${scorePerQuestion} pts` },
      { label: "Total Questions",  value: totalQuestions },
    );
  } else if (type === "mixed") {
    const { mcqScore, essayScore } = calculateMixedScores(maxScore, mcqCount, essayCount);
    rows.push({ label: "Max Score", value: maxScore });
    if (mcqCount > 0)   rows.push({ label: "MCQ",   value: `${mcqCount} × ${mcqScore} pts` });
    if (essayCount > 0) rows.push({ label: "Essay", value: `${essayCount} × ${essayScore} pts` });
    rows.push({ label: "Total Questions", value: totalQuestions });
  } else {
    return null;
  }

  return (
    <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-gray-100 dark:border-white/5">
        <span className="font-bold text-gray-900 dark:text-white">Scoring Summary</span>
      </div>

      {/* Rows */}
      <div className="p-4 space-y-2">
        {rows.map(({ label, value }, i) => (
          <div
            key={label}
            className={`flex items-center justify-between py-2 text-[14px] ${
              i === rows.length - 1
                ? "border-t border-gray-100 dark:border-white/5 pt-3 mt-1"
                : ""
            }`}
          >
            <span className="text-gray-500 dark:text-gray-400">{label}</span>
            <span className="font-bold text-gray-900 dark:text-white tabular-nums">{value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
