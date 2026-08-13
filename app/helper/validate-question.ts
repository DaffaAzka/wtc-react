import type { Question } from "@/types/challenge";

/**
 * Check if an array has duplicate values
 */
function hasDuplicates(arr: string[]): boolean {
  const trimmed = arr.map((s) => s.trim().toLowerCase());
  return new Set(trimmed).size !== trimmed.length;
}

/**
 * Validate Multiple Choice Question
 * @param question - MCQ question to validate
 * @param index - Question index for error messages
 * @returns Object with validation errors
 */
export function validateMCQQuestion(
  question: Question & { type: "multiple_choice" },
  index: number,
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Question is required
  if (!question.question.trim()) {
    errors[`question-${index}`] = "Question is required.";
  }

  // Must have exactly 4 options
  if (question.options.length !== 4) {
    errors[`options-${index}`] = "Must have exactly 4 options.";
  }

  // Check each option
  question.options.forEach((option, optionIndex) => {
    if (!option.trim()) {
      errors[`option-${index}-${optionIndex}`] =
        `Option ${String.fromCharCode(65 + optionIndex)} is required.`;
    }
  });

  // Check for duplicate options
  const nonEmptyOptions = question.options.filter((opt) => opt.trim());
  if (nonEmptyOptions.length > 0 && hasDuplicates(nonEmptyOptions)) {
    errors[`duplicate-${index}`] = "Duplicate options are not allowed.";
  }

  // Answer must be selected
  if (!question.answer) {
    errors[`answer-${index}`] = "Answer must be selected.";
  }

  // Score must be greater than 0
  if (question.score <= 0) {
    errors[`score-${index}`] = "Score must be greater than 0.";
  }

  return errors;
}

/**
 * Validate Essay Question
 * @param question - Essay question to validate
 * @param index - Question index for error messages
 * @returns Object with validation errors
 */
export function validateEssayQuestion(
  question: Question & { type: "essay" },
  index: number,
): Record<string, string> {
  const errors: Record<string, string> = {};

  // Question is required
  if (!question.question.trim()) {
    errors[`question-${index}`] = "Question is required.";
  }

  // Rubric is required
  if (!question.rubric.trim()) {
    errors[`rubric-${index}`] = "Rubric is required.";
  }

  // Score must be greater than 0
  if (question.score <= 0) {
    errors[`score-${index}`] = "Score must be greater than 0.";
  }

  return errors;
}

/**
 * Validate a single question based on its type
 * @param question - Question to validate
 * @param index - Question index
 * @param challengeType - Challenge type for consistency checking
 * @returns Object with validation errors
 */
export function validateQuestion(
  question: Question,
  index: number,
  challengeType: "multiple_choice" | "essay" | "mixed",
): Record<string, string> {
  // Check type consistency
  if (
    challengeType === "multiple_choice" &&
    question.type !== "multiple_choice"
  ) {
    return {
      [`type-${index}`]:
        "Multiple Choice challenge cannot have Essay questions.",
    };
  }

  if (challengeType === "essay" && question.type !== "essay") {
    return {
      [`type-${index}`]:
        "Essay challenge cannot have Multiple Choice questions.",
    };
  }

  // Validate based on question type
  if (question.type === "multiple_choice") {
    return validateMCQQuestion(
      question as Question & { type: "multiple_choice" },
      index,
    );
  }

  if (question.type === "essay") {
    return validateEssayQuestion(
      question as Question & { type: "essay" },
      index,
    );
  }

  return {};
}

/**
 * Validate all questions in a challenge
 * @param questions - Array of questions to validate
 * @param challengeType - Challenge type
 * @returns Object with all validation errors
 */
export function validateAllQuestions(
  questions: Question[],
  challengeType: "multiple_choice" | "essay" | "mixed",
): Record<string, string> {
  let allErrors: Record<string, string> = {};

  questions.forEach((question, index) => {
    const errors = validateQuestion(question, index, challengeType);
    allErrors = { ...allErrors, ...errors };
  });

  return allErrors;
}

/**
 * Get the index of the first question with errors
 * @param errors - Validation errors object
 * @returns Index of first question with error, or null
 */
export function getFirstErrorQuestionIndex(
  errors: Record<string, string>,
): number | null {
  const errorKeys = Object.keys(errors);
  if (errorKeys.length === 0) return null;

  // Extract question indices from error keys
  const indices = errorKeys
    .map((key) => {
      const match = key.match(/-(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((idx): idx is number => idx !== null);

  if (indices.length === 0) return null;

  return Math.min(...indices);
}
