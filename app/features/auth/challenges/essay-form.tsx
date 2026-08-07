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
          onChange({
            ...data,
            question: e.target.value,
          });

          if (questionErrors[`question-${index}`]) {
            setQuestionErrors((prev) => {
              const updated = { ...prev };
              delete updated[`question-${index}`];
              return updated;
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
          onChange({
            ...data,
            rubric: e.target.value,
          });

          if (questionErrors[`rubric-${index}`]) {
            setQuestionErrors((prev) => {
              const updated = { ...prev };
              delete updated[`rubric-${index}`];
              return updated;
            });
          }
        }}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Score (Auto-calculated)</label>
        <div className="flex items-center h-10 w-full rounded-md border border-input bg-muted px-3 py-2">
          <span className="text-sm font-semibold">{data.score} pts</span>
        </div>
      </div>
    </div>
  );
}
