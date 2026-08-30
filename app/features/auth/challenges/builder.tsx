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
import type { Question, ChallengeFormType } from "@/types/challenge";

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
    if (question.type === "multiple_choice")
      return question.options.every((opt) => !opt.trim());
    if (question.type === "essay") return !question.rubric.trim();
  }
  return false;
}

// ── Question card ────────────────────────────────────────────────────────────

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
  const hasError = Object.keys(questionErrors).some((k) =>
    k.includes(`-${index}`),
  );

  return (
    <div
      className={`overflow-hidden rounded-2xl border transition-all duration-200 ${
        isOpen
          ? "border-[#1c81ff]/30 bg-white dark:bg-[#0b1215] shadow-md"
          : hasError
            ? "border-red-300 dark:border-red-500/30 bg-white dark:bg-[#0b1215]"
            : "border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215]"
      }`}>
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-5 py-4 hover:bg-gray-50 dark:hover:bg-white/5 transition-colors">
        <div className="flex items-center gap-3">
          {isOpen ? (
            <ChevronDown className="h-4 w-4 text-[#1c81ff]" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-400 dark:text-gray-600" />
          )}
          <span
            className="font-extrabold text-[14px] text-gray-900 dark:text-white"
            style={{ letterSpacing: "-0.01em" }}>
            Question {index + 1}
          </span>
          {hasError && (
            <span className="inline-flex items-center rounded-full bg-red-50 dark:bg-red-500/10 px-2 py-0.5 text-[11px] font-bold text-red-500">
              Error
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          {!isOpen && (
            <span className="text-[12px] font-bold text-[#1c81ff] tabular-nums">
              {question.score} pts
            </span>
          )}
          <span
            className={`inline-flex items-center rounded-lg px-2.5 py-0.5 text-[11px] font-bold ${
              question.type === "multiple_choice"
                ? "bg-[#1c81ff]/10 text-[#1c81ff]"
                : "bg-[#31c7c8]/10 text-[#31c7c8]"
            }`}>
            {question.type === "multiple_choice" ? "MCQ" : "Essay"}
          </span>
        </div>
      </button>

      {/* Body */}
      {isOpen && (
        <div className="px-5 pb-5 space-y-5 border-t border-gray-100 dark:border-white/5 pt-5">
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

          {/* Footer actions */}
          <div className="flex items-center justify-between pt-4 border-t border-gray-100 dark:border-white/5">
            <button
              type="button"
              onClick={onDelete}
              className="flex items-center gap-1.5 text-[13px] font-bold text-red-500 hover:text-red-600 transition-colors">
              <Trash2 className="h-3.5 w-3.5" />
              Delete
            </button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onDuplicate}
                className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                <Copy className="h-3.5 w-3.5" />
                Duplicate
              </button>
              {renderAddButton()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

// ── Main Builder ─────────────────────────────────────────────────────────────

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
  }>({ isOpen: false, index: null });
  const lastQuestionRef = useRef<HTMLDivElement | null>(null);
  const prevErrorsRef = useRef<Record<string, string>>({});

  useKeyboardShortcuts({
    isEnabled: isModalOpen,
    onDuplicate: () => {
      if (openIndex >= 0 && openIndex < questions.length)
        duplicateQuestion(openIndex);
    },
    onAddQuestion: () => {
      if (type === "multiple_choice") addMCQ();
      else if (type === "essay") addEssay();
    },
    onEscape: () => {
      if (deleteDialog.isOpen) setDeleteDialog({ isOpen: false, index: null });
    },
  });

  useEffect(() => {
    const prevCount = Object.keys(prevErrorsRef.current).length;
    const curCount = Object.keys(questionErrors).length;
    if (prevCount === 0 && curCount > 0) {
      const firstError = getFirstErrorQuestionIndex(questionErrors);
      if (firstError !== null && questions.length > 0) {
        setOpenIndex(firstError);
        setTimeout(() => {
          document
            .querySelector(`[data-question-index="${firstError}"]`)
            ?.scrollIntoView({ behavior: "smooth", block: "center" });
        }, 100);
      }
    }
    prevErrorsRef.current = questionErrors;
  }, [questionErrors, questions.length]);

  const addMCQ = () => {
    const i = questions.length;
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
    setOpenIndex(i);
    setLastAddedIndex(i);
  };

  const addEssay = () => {
    const i = questions.length;
    onChange([
      ...questions,
      { type: "essay", question: "", rubric: "", score: 10 },
    ]);
    setOpenIndex(i);
    setLastAddedIndex(i);
  };

  const handleDeleteQuestion = (index: number) => {
    if (isQuestionEmpty(questions[index])) executeDelete(index);
    else setDeleteDialog({ isOpen: true, index });
  };

  const executeDelete = (index: number) => {
    const newQ = questions.filter((_, i) => i !== index);
    onChange(newQ);
    setOpenIndex(newQ.length === 0 ? -1 : Math.max(0, index - 1));
    setDeleteDialog({ isOpen: false, index: null });
  };

  const duplicateQuestion = (index: number) => {
    const q = structuredClone(questions[index]);
    const newQ = [...questions];
    newQ.splice(index + 1, 0, q);
    onChange(newQ);
    setOpenIndex(index + 1);
    setLastAddedIndex(index + 1);
  };

  const updateQuestion = (index: number, value: Question) => {
    const newQ = [...questions];
    newQ[index] = value;
    onChange(newQ);
  };

  useEffect(() => {
    if (lastAddedIndex !== null) {
      const t = setTimeout(() => setLastAddedIndex(null), 500);
      return () => clearTimeout(t);
    }
  }, [lastAddedIndex]);

  useEffect(() => {
    if (questions.length > 0 && openIndex >= questions.length)
      setOpenIndex(questions.length - 1);
  }, [questions.length, openIndex]);

  useEffect(() => {
    if (questions.length > 1 && openIndex === questions.length - 1) {
      setTimeout(
        () =>
          lastQuestionRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
          }),
        100,
      );
    }
  }, [questions.length, openIndex]);

  const renderAddButton = () => {
    if (type === "multiple_choice") {
      return (
        <button
          type="button"
          onClick={addMCQ}
          className="flex items-center gap-1.5 bg-[#1c81ff] text-white font-bold rounded-xl py-1.5 px-3 text-[13px] shadow-sm shadow-blue-500/20 hover:scale-[1.02] transition-transform">
          <Plus className="h-3.5 w-3.5" /> Add MCQ
        </button>
      );
    }
    if (type === "essay") {
      return (
        <button
          type="button"
          onClick={addEssay}
          className="flex items-center gap-1.5 bg-[#1c81ff] text-white font-bold rounded-xl py-1.5 px-3 text-[13px] shadow-sm shadow-blue-500/20 hover:scale-[1.02] transition-transform">
          <Plus className="h-3.5 w-3.5" /> Add Essay
        </button>
      );
    }
    return (
      <Select
        onValueChange={(v) => {
          if (v === "mcq") addMCQ();
          if (v === "essay") addEssay();
        }}>
        <SelectTrigger className="w-40 rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold text-[13px] focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
          <SelectValue placeholder="Add Question" />
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          <SelectItem value="mcq">Add MCQ</SelectItem>
          <SelectItem value="essay">Add Essay</SelectItem>
        </SelectContent>
      </Select>
    );
  };

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
          <div className="rounded-2xl border-2 border-dashed border-gray-200 dark:border-white/10 bg-white dark:bg-[#0b1215] p-14 text-center space-y-4">
            <h3
              className="text-xl font-extrabold text-gray-900 dark:text-white"
              style={{ letterSpacing: "-0.02em" }}>
              No questions yet
            </h3>
            <p className="text-[14px] text-gray-500 dark:text-gray-400 max-w-sm mx-auto">
              Generate questions or add one manually to start building your
              challenge.
            </p>
            <div className="flex gap-2 justify-center pt-2">
              {renderAddButton()}
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-end gap-2 mb-4">
              {[
                {
                  label: "Collapse All",
                  Icon: ChevronsUp,
                  action: () => setOpenIndex(-1),
                },
                {
                  label: "Expand All",
                  Icon: ChevronsDown,
                  action: () => {
                    if (questions.length > 0) setOpenIndex(0);
                  },
                },
              ].map(({ label, Icon, action }) => (
                <button
                  key={label}
                  type="button"
                  onClick={action}
                  className="flex items-center gap-1.5 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl px-3 py-1.5 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              ))}
            </div>

            <div className="space-y-3">
              {questions.map((question, index) => (
                <div
                  key={index}
                  data-question-index={index}
                  ref={index === questions.length - 1 ? lastQuestionRef : null}>
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
          if (deleteDialog.index !== null) executeDelete(deleteDialog.index);
        }}
        questionNumber={
          deleteDialog.index !== null ? deleteDialog.index + 1 : 0
        }
      />
    </div>
  );
}
