import InputForm from "@/components/custom/input-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { AlertCircle } from "lucide-react";
import type { MCQQuestion } from "@/types/challenge";

type Props = {
  index: number;
  data: MCQQuestion;
  onChange: (data: MCQQuestion) => void;
  shouldAutoFocus?: boolean;
  questionErrors: Record<string, string>;
  setQuestionErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
};

const OPTIONS = ["A", "B", "C", "D"] as const;

export default function MCQForm({
  data,
  onChange,
  shouldAutoFocus,
  index,
  questionErrors,
  setQuestionErrors,
}: Props) {
  const clearError = (key: string) => {
    if (questionErrors[key]) {
      setQuestionErrors((prev) => {
        const u = { ...prev };
        delete u[key];
        return u;
      });
    }
  };

  const clearDuplicate = () => clearError(`duplicate-${index}`);

  return (
    <div className="space-y-4">
      <InputForm
        text="Question"
        name="question"
        type="text"
        value={data.question}
        autoFocus={shouldAutoFocus}
        error={questionErrors[`question-${index}`]}
        handleChange={(e) => {
          onChange({ ...data, question: e.target.value });
          clearError(`question-${index}`);
        }}
      />

      {OPTIONS.map((letter, i) => (
        <InputForm
          key={letter}
          text={`Option ${letter}`}
          name={`option_${letter.toLowerCase()}`}
          type="text"
          value={data.options[i]}
          error={questionErrors[`option-${index}-${i}`]}
          handleChange={(e) => {
            const options = [...data.options];
            options[i] = e.target.value;
            onChange({ ...data, options });
            clearError(`option-${index}-${i}`);
            clearDuplicate();
          }}
        />
      ))}

      {questionErrors[`duplicate-${index}`] && (
        <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
          <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <p className="text-[13px] text-red-600 dark:text-red-400">
            {questionErrors[`duplicate-${index}`]}
          </p>
        </div>
      )}

      {/* Correct answer */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
          Correct Answer
        </label>
        <Select
          value={data.answer}
          onValueChange={(value) => {
            onChange({ ...data, answer: value as "A" | "B" | "C" | "D" });
            clearError(`answer-${index}`);
          }}>
          <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="rounded-xl">
            {OPTIONS.map((letter) => (
              <SelectItem key={letter} value={letter}>
                {letter}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {questionErrors[`answer-${index}`] && (
          <p className="text-[12px] text-red-500">
            {questionErrors[`answer-${index}`]}
          </p>
        )}
      </div>

      {/* Score (read-only) */}
      <div className="space-y-1.5">
        <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
          Score{" "}
          <span className="font-normal text-gray-400 dark:text-gray-600">
            (Auto-calculated)
          </span>
        </label>
        <div className="flex items-center h-11 w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4">
          <span className="text-[14px] font-extrabold text-[#1c81ff]">
            {data.score}
          </span>
          <span className="text-[13px] text-gray-400 dark:text-gray-600 ml-1">
            pts
          </span>
        </div>
      </div>
    </div>
  );
}
