import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { Question } from "@/types/challenge";
import {
  generateMCQQuestions,
  generateEssayQuestions,
  generateMixedQuestions,
} from "@/helper/generate-questions";
import { useState } from "react";
import ConfirmReplaceDialog from "./confirm-replace-dialog";

type Props = {
  type: ChallengeFormType;
  maxScore: number;
  questions: Question[];
  onGenerate: (questions: Question[]) => void;
};

export default function QuestionGenerator({
  type,
  maxScore,
  questions,
  onGenerate,
}: Props) {
  const [mcqCount, setMcqCount] = useState("");
  const [essayCount, setEssayCount] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [errors, setErrors] = useState<{
    mcqCount?: string;
    essayCount?: string;
    questionCount?: string;
  }>({});

  const validateInput = (value: string): string | undefined => {
    if (!value.trim()) {
      return "This field is required.";
    }

    const num = Number(value);

    if (isNaN(num)) {
      return "Must be a valid number.";
    }

    if (num < 0) {
      return "Cannot be negative.";
    }

    if (!Number.isInteger(num)) {
      return "Must be a whole number.";
    }

    if (num < 1) {
      return "Must be at least 1.";
    }

    return undefined;
  };

  const validateMixed = (): boolean => {
    const newErrors: {
      mcqCount?: string;
      essayCount?: string;
    } = {};

    const mcqError = validateInput(mcqCount);
    const essayError = validateInput(essayCount);

    if (mcqError) {
      newErrors.mcqCount = mcqError;
    }

    if (essayError) {
      newErrors.essayCount = essayError;
    }

    if (!mcqError && !essayError) {
      const mcq = Number(mcqCount);
      const essay = Number(essayCount);

      if (mcq + essay === 0) {
        newErrors.mcqCount = "Total questions must be at least 1.";
        newErrors.essayCount = "Total questions must be at least 1.";
      }
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validateSingle = (): boolean => {
    const error = validateInput(questionCount);

    if (error) {
      setErrors({ questionCount: error });
      return false;
    }

    setErrors({});
    return true;
  };

  const handleGenerate = () => {
    let isValid = false;

    if (type === "mixed") {
      isValid = validateMixed();
    } else {
      isValid = validateSingle();
    }

    if (!isValid) {
      return;
    }

    if (questions.length > 0) {
      setShowConfirmDialog(true);
      return;
    }

    executeGenerate();
  };

  const executeGenerate = () => {
    let generatedQuestions: Question[] = [];

    if (type === "multiple_choice") {
      generatedQuestions = generateMCQQuestions(
        Number(questionCount),
        maxScore
      );
    } else if (type === "essay") {
      generatedQuestions = generateEssayQuestions(
        Number(questionCount),
        maxScore
      );
    } else if (type === "mixed") {
      generatedQuestions = generateMixedQuestions(
        Number(mcqCount),
        Number(essayCount),
        maxScore
      );
    }

    onGenerate(generatedQuestions);
    setShowConfirmDialog(false);
  };

  const handleConfirmReplace = () => {
    executeGenerate();
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Question Generator</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {type === "mixed" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="mcq-count">
                  MCQ Count <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="mcq-count"
                  type="number"
                  min="0"
                  step="1"
                  value={mcqCount}
                  onChange={(e) => {
                    setMcqCount(e.target.value);
                    setErrors((prev) => ({ ...prev, mcqCount: undefined }));
                  }}
                  placeholder="e.g., 20"
                />
                {errors.mcqCount && (
                  <p className="text-sm text-red-500">{errors.mcqCount}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="essay-count">
                  Essay Count <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="essay-count"
                  type="number"
                  min="0"
                  step="1"
                  value={essayCount}
                  onChange={(e) => {
                    setEssayCount(e.target.value);
                    setErrors((prev) => ({ ...prev, essayCount: undefined }));
                  }}
                  placeholder="e.g., 5"
                />
                {errors.essayCount && (
                  <p className="text-sm text-red-500">{errors.essayCount}</p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <Label htmlFor="question-count">
                Question Count <span className="text-red-500">*</span>
              </Label>
              <Input
                id="question-count"
                type="number"
                min="1"
                step="1"
                value={questionCount}
                onChange={(e) => {
                  setQuestionCount(e.target.value);
                  setErrors({});
                }}
                placeholder="e.g., 30"
              />
              {errors.questionCount && (
                <p className="text-sm text-red-500">{errors.questionCount}</p>
              )}
            </div>
          )}

          <Button type="button" onClick={handleGenerate} className="w-full">
            Generate Questions
          </Button>
        </CardContent>
      </Card>

      <ConfirmReplaceDialog
        isOpen={showConfirmDialog}
        onOpenChange={setShowConfirmDialog}
        onConfirm={handleConfirmReplace}
      />
    </>
  );
}
