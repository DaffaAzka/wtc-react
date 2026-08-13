import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronDown,
  ChevronRight,
  Copy,
  Plus,
  Trash2,
  ChevronsDown,
  ChevronsUp,
} from "lucide-react";
import { useEffect, useState, useRef, memo } from "react";
import MCQForm from "./mcq-form";
import EssayForm from "./essay-form";
import QuestionGenerator from "./question-generator";
import ScoringSummary from "./scoring-summary";
import ValidationSummary from "./validation-summary";
import DeleteQuestionDialog from "./delete-question-dialog";
import { useKeyboardShortcuts } from "@/hooks/use-keyboard-shortcuts";
import { getFirstErrorQuestionIndex } from "@/helper/validate-question";
import type { Question, ChallengeFormTypeQuestion } from "@/types/challenge";

type Props = {
  type: ChallengeFormType;
  maxScore: number;
  questions: Question[];
  onChange: (questions: Question[]) => void;
  questionErrors: Record<string, string>;
  setQuestionErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  isModalOpen: boolean;
};

function isQuestionEmpty(question: Question): boolean {
  if (!question.question.trim()) {
    if (question.type === "multiple_choice") {
      return question.options.every((opt) => !opt.trim());
    }
    if (question.type === "essay") {
      return !question.rubric.trim();
    }
  }
  return false;
}

const QuestionCard = memo(function QuestionCard({
  question,
  index,
  isOpen,
  onToggle,
  onUpdate,
  onDuplicate,
  onDelete,
  questionErrors,
  setQuestionErrors,
  renderAddButton,
  shouldAutoFocus,
}: {
  question: Question;
  index: number;
  isOpen: boolean;
  onToggle: () => void;
  onUpdate: (value: Question) => void;
  onDuplicate: () => void;
  onDelete: () => void;
  questionErrors: Record<string, string>;
  setQuestionErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
  renderAddButton: () => React.ReactNode;
  shouldAutoFocus: boolean;
}) {
  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={onToggle}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            {isOpen ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
            <CardTitle>Question {index + 1}</CardTitle>
          </div>

          <div className="flex items-center gap-2">
            {!isOpen && (
              <span className="text-sm text-muted-foreground">
                {question.score} pts
              </span>
            )}
            <Badge variant="secondary">
              {question.type === "multiple_choice"
                ? "Multiple Choice"
                : "Essay"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      {isOpen && (
        <CardContent className="space-y-6">
          {question.type === "multiple_choice" ? (
            <MCQForm
              index={index}
              data={question}
              onChange={onUpdate}
              questionErrors={questionErrors}
              setQuestionErrors={setQuestionErrors}
              shouldAutoFocus={shouldAutoFocus}
            />
          ) : (
            <EssayForm
              index={index}
              data={question}
              onChange={onUpdate}
              questionErrors={questionErrors}
              setQuestionErrors={setQuestionErrors}
              shouldAutoFocus={shouldAutoFocus}
            />
          )}

          <div className="flex justify-between border-t pt-5">
            <Button variant="destructive" type="button" onClick={onDelete}>
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>

            <div className="flex gap-2">
              <Button variant="outline" type="button" onClick={onDuplicate}>
                <Copy className="mr-2 h-4 w-4" />
                Duplicate
              </Button>

              {renderAddButton()}
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
});

export default function Builder({
  type,
  maxScore,
  questions,
  onChange,
  questionErrors,
  setQuestionErrors,
  isModalOpen,
}: Props) {
  const [openIndex, setOpenIndex] = useState(0);
  const [lastAddedIndex, setLastAddedIndex] = useState<number | null>(null);
  const [deleteDialog, setDeleteDialog] = useState<{
    isOpen: boolean;
    index: number | null;
  }>({
    isOpen: false,
    index: null,
  });
  const lastQuestionRef = useRef<HTMLDivElement | null>(null);
  const prevErrorsRef = useRef<Record<string, string>>({});

  useKeyboardShortcuts({
    isEnabled: isModalOpen,
    onDuplicate: () => {
      if (openIndex >= 0 && openIndex < questions.length) {
        duplicateQuestion(openIndex);
      }
    },
    onAddQuestion: () => {
      if (type === "multiple_choice") {
        addMCQ();
      } else if (type === "essay") {
        addEssay();
      }
    },
    onEscape: () => {
      if (deleteDialog.isOpen) {
        setDeleteDialog({ isOpen: false, index: null });
      }
    },
  });

  // Auto-open first error question when validation errors appear
  useEffect(() => {
    const prevErrorCount = Object.keys(prevErrorsRef.current).length;
    const currentErrorCount = Object.keys(questionErrors).length;

    // If errors just appeared (was 0, now > 0), open first error question
    if (prevErrorCount === 0 && currentErrorCount > 0) {
      const firstErrorIndex = getFirstErrorQuestionIndex(questionErrors);
      if (firstErrorIndex !== null && questions.length > 0) {
        setOpenIndex(firstErrorIndex);
        
        // Scroll to error question after a short delay
        setTimeout(() => {
          const errorElement = document.querySelector(
            `[data-question-index="${firstErrorIndex}"]`
          );
          errorElement?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
        }, 100);
      }
    }

    prevErrorsRef.current = questionErrors;
  }, [questionErrors, questions.length]);

  const addMCQ = () => {
    const newIndex = questions.length;
    onChange([
      ...questions,
      {
        type: "multiple_choice",
        question: "",
        options: ["", "", "", ""],
        answer: "A",
        score: 10,
      },
    ]);
    setOpenIndex(newIndex);
    setLastAddedIndex(newIndex);
  };

  const addEssay = () => {
    const newIndex = questions.length;
    onChange([
      ...questions,
      {
        type: "essay",
        question: "",
        rubric: "",
        score: 10,
      },
    ]);
    setOpenIndex(newIndex);
    setLastAddedIndex(newIndex);
  };

  const handleDeleteQuestion = (index: number) => {
    const question = questions[index];

    if (isQuestionEmpty(question)) {
      executeDelete(index);
    } else {
      setDeleteDialog({
        isOpen: true,
        index,
      });
    }
  };

  const executeDelete = (index: number) => {
    const newQuestions = questions.filter((_, i) => i !== index);
    onChange(newQuestions);

    if (newQuestions.length === 0) {
      setOpenIndex(-1);
    } else {
      setOpenIndex(Math.max(0, index - 1));
    }

    setDeleteDialog({ isOpen: false, index: null });
  };

  const duplicateQuestion = (index: number) => {
    const question = structuredClone(questions[index]);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, question);
    onChange(newQuestions);
    setOpenIndex(index + 1);
    setLastAddedIndex(index + 1);
  };

  const updateQuestion = (index: number, value: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    onChange(newQuestions);
  };

  const collapseAll = () => {
    setOpenIndex(-1);
  };

  const expandAll = () => {
    if (questions.length > 0) {
      setOpenIndex(0);
    }
  };

  const renderAddButton = () => {
    if (type === "multiple_choice") {
      return (
        <Button type="button" onClick={addMCQ}>
          <Plus className="mr-2 h-4 w-4" />
          Add MCQ
        </Button>
      );
    }

    if (type === "essay") {
      return (
        <Button type="button" onClick={addEssay}>
          <Plus className="mr-2 h-4 w-4" />
          Add Essay
        </Button>
      );
    }

    return (
      <Select
        onValueChange={(value) => {
          if (value === "mcq") addMCQ();
          if (value === "essay") addEssay();
        }}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Add Question" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="mcq">Add MCQ</SelectItem>
          <SelectItem value="essay">Add Essay</SelectItem>
        </SelectContent>
      </Select>
    );
  };

  useEffect(() => {
    if (lastAddedIndex !== null) {
      const timer = setTimeout(() => {
        setLastAddedIndex(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [lastAddedIndex]);

  useEffect(() => {
    if (questions.length > 0 && openIndex >= questions.length) {
      setOpenIndex(questions.length - 1);
    }
  }, [questions.length, openIndex]);

  useEffect(() => {
    if (questions.length > 1 && openIndex === questions.length - 1) {
      setTimeout(() => {
        lastQuestionRef.current?.scrollIntoView({
          behavior: "smooth",
          block: "nearest",
        });
      }, 100);
    }
  }, [questions.length, openIndex]);

  return (
    <div className="space-y-6">
      <QuestionGenerator
        type={type}
        maxScore={maxScore}
        questions={questions}
        onGenerate={onChange}
      />

      <ScoringSummary type={type} maxScore={maxScore} questions={questions} />

      <ValidationSummary errors={questionErrors} />

      <div>
        {questions.length === 0 ? (
          <div className="border-2 border-dashed rounded-lg p-12 text-center space-y-4">
            <div className="space-y-2">
              <h3 className="text-lg font-semibold">No questions yet</h3>
              <p className="text-sm text-muted-foreground max-w-md mx-auto">
                Generate questions or add one manually to start building your
                challenge.
              </p>
            </div>
            <div className="flex gap-2 justify-center">{renderAddButton()}</div>
          </div>
        ) : (
          <>
            <div className="flex justify-end gap-2 mb-4">
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={collapseAll}>
                <ChevronsUp className="mr-2 h-4 w-4" />
                Collapse All
              </Button>
              <Button
                variant="outline"
                size="sm"
                type="button"
                onClick={expandAll}>
                <ChevronsDown className="mr-2 h-4 w-4" />
                Expand All
              </Button>
            </div>

            <div className="space-y-4">
              {questions.map((question, index) => (
                <div
                  key={index}
                  data-question-index={index}
                  ref={
                    index === questions.length - 1 ? lastQuestionRef : null
                  }>
                  <QuestionCard
                    question={question}
                    index={index}
                    isOpen={openIndex === index}
                    onToggle={() =>
                      setOpenIndex(openIndex === index ? -1 : index)
                    }
                    onUpdate={(value) => updateQuestion(index, value)}
                    onDuplicate={() => duplicateQuestion(index)}
                    onDelete={() => handleDeleteQuestion(index)}
                    questionErrors={questionErrors}
                    setQuestionErrors={setQuestionErrors}
                    renderAddButton={renderAddButton}
                    shouldAutoFocus={index === lastAddedIndex}
                  />
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <DeleteQuestionDialog
        isOpen={deleteDialog.isOpen}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, isOpen: open }))
        }
        onConfirm={() => {
          if (deleteDialog.index !== null) {
            executeDelete(deleteDialog.index);
          }
        }}
        questionNumber={
          deleteDialog.index !== null ? deleteDialog.index + 1 : 0
        }
      />
    </div>
  );
}
