import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";
import type { EssayQuestion } from "@/types/challenge";

type Props = {
  index: number;
  data: EssayQuestion;
  onChange: (data: EssayQuestion) => void;
  shouldAutoFocus?: boolean;
  questionErrors: Record<string, string>;
  setQuestionErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
};

export default function EssayForm({
  data,
  onChange,
  shouldAutoFocus,
  index,
  questionErrors,
  setQuestionErrors,
}: Props) {
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
          if (questionErrors[`question-${index}`]) {
            setQuestionErrors((prev) => {
              const u = { ...prev };
              delete u[`question-${index}`];
              return u;
            });
          }
        }}
      />

      <TextareaForm
        text="Rubric / Expected Answer"
        name="rubric"
        value={data.rubric}
        error={questionErrors[`rubric-${index}`]}
        handleChange={(e) => {
          onChange({ ...data, rubric: e.target.value });
          if (questionErrors[`rubric-${index}`]) {
            setQuestionErrors((prev) => {
              const u = { ...prev };
              delete u[`rubric-${index}`];
              return u;
            });
          }
        }}
      />

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
