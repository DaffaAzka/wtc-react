import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";

import type { EssayQuestion } from "@/types/challenge";

type Props = {
  index: number;
  data: EssayQuestion;
  onChange: (data: EssayQuestion) => void;
  autoFocus?: boolean;
  questionErrors: Record<string, string>;
  setQuestionErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
};

export default function EssayForm({
  data,
  onChange,
  autoFocus,
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

      <InputForm
        text="Score"
        name="score"
        type="number"
        value={data.score.toString()}
        error={questionErrors[`score-${index}`]}
        handleChange={(e) => {
          onChange({
            ...data,
            score: Number(e.target.value),
          });

          if (questionErrors[`score-${index}`]) {
            setQuestionErrors((prev) => {
              const updated = { ...prev };
              delete updated[`score-${index}`];
              return updated;
            });
          }
        }}
      />
    </div>
  );
}
