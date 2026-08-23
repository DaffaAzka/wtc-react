import type { Challenge } from "@/types/model";
import type { Submission } from "@/types/submission";

/**
 * Default passing grade percentage (75%)
 */
export const DEFAULT_PASSING_PERCENTAGE = 0.75;

/**
 * Challenge completion status
 */
export type ChallengeCompletionStatus = "passed" | "failed" | "not_attempted";

/**
 * Get passing score for a challenge (75% of max_score by default)
 */
export function getPassingScore(challenge: Challenge, passingPercentage = DEFAULT_PASSING_PERCENTAGE): number {
  return Math.ceil(challenge.max_score * passingPercentage);
}

/**
 * Get the latest submission from an array of submissions
 */
export function getLatestSubmission(submissions: Submission[]): Submission | null {
  if (!submissions || submissions.length === 0) return null;

  // Sort by submitted_at descending and return the first one
  const sorted = [...submissions].sort((a, b) => {
    const dateA = a.submitted_at ? new Date(a.submitted_at).getTime() : 0;
    const dateB = b.submitted_at ? new Date(b.submitted_at).getTime() : 0;
    return dateB - dateA;
  });

  return sorted[0];
}

/**
 * Check if a challenge is completed (passed) based on submission
 */
export function getChallengeCompletionStatus(
  challenge: Challenge,
  submissions: Submission[],
  passingPercentage = DEFAULT_PASSING_PERCENTAGE
): ChallengeCompletionStatus {
  const latestSubmission = getLatestSubmission(submissions);

  if (!latestSubmission || latestSubmission.score === null) {
    return "not_attempted";
  }

  const passingScore = getPassingScore(challenge, passingPercentage);

  return latestSubmission.score >= passingScore ? "passed" : "failed";
}

/**
 * Calculate score percentage
 */
export function getScorePercentage(score: number, maxScore: number): number {
  if (maxScore === 0) return 0;
  return Math.round((score / maxScore) * 100);
}

/**
 * Check if a submission passed
 */
export function didSubmissionPass(
  submission: Submission,
  challenge: Challenge,
  passingPercentage = DEFAULT_PASSING_PERCENTAGE
): boolean {
  if (submission.score === null) return false;
  const passingScore = getPassingScore(challenge, passingPercentage);
  return submission.score >= passingScore;
}
