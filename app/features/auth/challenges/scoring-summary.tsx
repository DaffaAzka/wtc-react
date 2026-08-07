import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Question } from "@/types/challenge";
import {
  calculateMCQScore,
  calculateEssayScore,
  calculateMixedScores,
} from "@/helper/calculate-score";

type Props = {
  type: "multiple_choice" | "essay" | "mixed";
  maxScore: number;
  questions: Question[];
};

export default function ScoringSummary({ type, maxScore, questions }: Props) {
  const mcqCount = questions.filter(
    (q) => q.type === "multiple_choice"
  ).length;
  const essayCount = questions.filter((q) => q.type === "essay").length;
  const totalQuestions = questions.length;

  if (totalQuestions === 0) {
    return null;
  }

  const renderContent = () => {
    if (type === "multiple_choice") {
      const scorePerQuestion = calculateMCQScore(maxScore, mcqCount);
      return (
        <>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Score</span>
            <span className="font-semibold">{maxScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Questions</span>
            <span className="font-semibold">
              {mcqCount} × {scorePerQuestion} pts
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Total Questions</span>
            <span className="font-semibold">{totalQuestions}</span>
          </div>
        </>
      );
    }

    if (type === "essay") {
      const scorePerQuestion = calculateEssayScore(maxScore, essayCount);
      return (
        <>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Score</span>
            <span className="font-semibold">{maxScore}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Questions</span>
            <span className="font-semibold">
              {essayCount} × {scorePerQuestion} pts
            </span>
          </div>
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Total Questions</span>
            <span className="font-semibold">{totalQuestions}</span>
          </div>
        </>
      );
    }

    if (type === "mixed") {
      const { mcqScore, essayScore } = calculateMixedScores(
        maxScore,
        mcqCount,
        essayCount
      );
      return (
        <>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Max Score</span>
            <span className="font-semibold">{maxScore}</span>
          </div>
          {mcqCount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">MCQ</span>
              <span className="font-semibold">
                {mcqCount} × {mcqScore} pts
              </span>
            </div>
          )}
          {essayCount > 0 && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Essay</span>
              <span className="font-semibold">
                {essayCount} × {essayScore} pts
              </span>
            </div>
          )}
          <div className="flex justify-between border-t pt-2">
            <span className="text-muted-foreground">Total Questions</span>
            <span className="font-semibold">{totalQuestions}</span>
          </div>
        </>
      );
    }

    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scoring Summary</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">{renderContent()}</CardContent>
    </Card>
  );
}
