import type { Question } from "@/types/challenge";
import {
  calculateMCQScore,
  calculateEssayScore,
  calculateMixedScores,
} from "./calculate-score";

/**
 * Generate multiple choice questions with calculated scores
 * @param count - Number of MCQ questions to generate
 * @param maxScore - Maximum total score for auto-calculation
 * @returns Array of empty MCQ questions with calculated scores
 */
export function generateMCQQuestions(
  count: number,
  maxScore: number,
): Question[] {
  const questions: Question[] = [];
  const scorePerQuestion = calculateMCQScore(maxScore, count);

  for (let i = 0; i < count; i++) {
    questions.push({
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      answer: "A",
      score: scorePerQuestion,
    });
  }

  return questions;
}

/**
 * Generate essay questions with calculated scores
 * @param count - Number of essay questions to generate
 * @param maxScore - Maximum total score for auto-calculation
 * @returns Array of empty essay questions with calculated scores
 */
export function generateEssayQuestions(
  count: number,
  maxScore: number,
): Question[] {
  const questions: Question[] = [];
  const scorePerQuestion = calculateEssayScore(maxScore, count);

  for (let i = 0; i < count; i++) {
    questions.push({
      type: "essay",
      question: "",
      rubric: "",
      score: scorePerQuestion,
    });
  }

  return questions;
}

/**
 * Generate mixed questions (MCQ + Essay) with calculated scores
 * Uses default weights: MCQ 40%, Essay 60%
 * @param mcqCount - Number of MCQ questions
 * @param essayCount - Number of essay questions
 * @param maxScore - Maximum total score for auto-calculation
 * @returns Array of questions (all MCQs first, then all essays) with calculated scores
 */
export function generateMixedQuestions(
  mcqCount: number,
  essayCount: number,
  maxScore: number,
): Question[] {
  const { mcqScore, essayScore } = calculateMixedScores(
    maxScore,
    mcqCount,
    essayCount,
  );

  const mcqQuestions: Question[] = [];
  for (let i = 0; i < mcqCount; i++) {
    mcqQuestions.push({
      type: "multiple_choice",
      question: "",
      options: ["", "", "", ""],
      answer: "A",
      score: mcqScore,
    });
  }

  const essayQuestions: Question[] = [];
  for (let i = 0; i < essayCount; i++) {
    essayQuestions.push({
      type: "essay",
      question: "",
      rubric: "",
      score: essayScore,
    });
  }

  return [...mcqQuestions, ...essayQuestions];
}
