export type ChallengeFormType = "multiple_choice" | "quiz_group" | "essay" | "mixed";

export type MCQQuestion = {
  type: "multiple_choice";
  question: string;
  options: string[];
  answer: "A" | "B" | "C" | "D";
  score: number;
};

export type EssayQuestion = {
  type: "essay";
  question: string;
  rubric: string;
  score: number;
};

export type Question = MCQQuestion | EssayQuestion;
export type ChallengeFormTypeQuestion = Question;
