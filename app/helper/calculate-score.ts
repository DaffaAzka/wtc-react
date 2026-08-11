import { MCQ_WEIGHT, ESSAY_WEIGHT, SCORE_DECIMAL_PLACES } from "./constants";

/**
 * Round score to specified decimal places
 * @param score - Score to round
 * @returns Rounded score
 */
export function roundScore(score: number): number {
  const multiplier = Math.pow(10, SCORE_DECIMAL_PLACES);
  return Math.round(score * multiplier) / multiplier;
}

/**
 * Calculate score per MCQ question
 * @param maxScore - Maximum total score
 * @param questionCount - Number of MCQ questions
 * @returns Score per question (rounded to 2 decimal places)
 */
export function calculateMCQScore(
  maxScore: number,
  questionCount: number,
): number {
  if (questionCount === 0) return 0;
  return roundScore(maxScore / questionCount);
}

/**
 * Calculate score per Essay question
 * @param maxScore - Maximum total score
 * @param questionCount - Number of Essay questions
 * @returns Score per question (rounded to 2 decimal places)
 */
export function calculateEssayScore(
  maxScore: number,
  questionCount: number,
): number {
  if (questionCount === 0) return 0;
  return roundScore(maxScore / questionCount);
}

/**
 * Calculate scores for mixed quiz (MCQ + Essay)
 * Uses default weights: MCQ 40%, Essay 60%
 * @param maxScore - Maximum total score
 * @param mcqCount - Number of MCQ questions
 * @param essayCount - Number of Essay questions
 * @returns Object with mcqScore and essayScore per question
 */
export function calculateMixedScores(
  maxScore: number,
  mcqCount: number,
  essayCount: number,
): { mcqScore: number; essayScore: number } {
  const mcqTotal = maxScore * MCQ_WEIGHT;
  const essayTotal = maxScore * ESSAY_WEIGHT;

  const mcqScore = mcqCount > 0 ? roundScore(mcqTotal / mcqCount) : 0;
  const essayScore = essayCount > 0 ? roundScore(essayTotal / essayCount) : 0;

  return { mcqScore, essayScore };
}

/**
 * Calculate score for a single question based on type and context
 * @param type - Question type
 * @param maxScore - Maximum total score
 * @param mcqCount - Number of MCQ questions (for mixed)
 * @param essayCount - Number of Essay questions (for mixed)
 * @param challengeType - Challenge type (multiple_choice, essay, or mixed)
 * @returns Calculated score for the question
 */
export function calculateQuestionScore(
  type: "multiple_choice" | "essay",
  maxScore: number,
  mcqCount: number,
  essayCount: number,
  challengeType: "multiple_choice" | "essay" | "mixed",
): number {
  if (challengeType === "multiple_choice") {
    return calculateMCQScore(maxScore, mcqCount);
  }

  if (challengeType === "essay") {
    return calculateEssayScore(maxScore, essayCount);
  }

  if (challengeType === "mixed") {
    const { mcqScore, essayScore } = calculateMixedScores(
      maxScore,
      mcqCount,
      essayCount,
    );
    return type === "multiple_choice" ? mcqScore : essayScore;
  }

  return 0;
}
