import InputForm from "@/components/custom/input-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { MCQQuestion } from "@/types/challenge";

type Props = {
  index: number;
  data: MCQQuestion;
  onChange: (data: MCQQuestion) => void;
  autoFocus?: boolean;
  questionErrors: Record<string, string>;
  setQuestionErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
};

export default function MCQForm({
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

      <InputForm
        text="Option A"
        name="option_a"
        type="text"
        value={data.options[0]}
        autoFocus={autoFocus}
        error={questionErrors[`option-${index}-0`]}
        handleChange={(e) => {
          const options = [...data.options];
          options[0] = e.target.value;
          onChange({
            ...data,
            options,
          });

          if (questionErrors[`option-${index}-0`]) {
            setQuestionErrors((prev) => {
              const updated = { ...prev };
              delete updated[`option-${index}-0`];
              return updated;
            });
          }
        }}
      />

      <InputForm
        text="Option B"
        name="option_b"
        type="text"
        value={data.options[1]}
        autoFocus={autoFocus}
        error={questionErrors[`option-${index}-1`]}
        handleChange={(e) => {
          const options = [...data.options];
          options[1] = e.target.value;
          onChange({
            ...data,
            options,
          });

          if (questionErrors[`option-${index}-1`]) {
            setQuestionErrors((prev) => {
              const updated = { ...prev };
              delete updated[`option-${index}-1`];
              return updated;
            });
          }
        }}
      />

      <InputForm
        text="Option C"
        name="option_c"
        type="text"
        value={data.options[2]}
        autoFocus={autoFocus}
        error={questionErrors[`option-${index}-2`]}
        handleChange={(e) => {
          const options = [...data.options];
          options[2] = e.target.value;
          onChange({
            ...data,
            options,
          });

          if (questionErrors[`option-${index}-2`]) {
            setQuestionErrors((prev) => {
              const updated = { ...prev };
              delete updated[`option-${index}-2`];
              return updated;
            });
          }
        }}
      />

      <InputForm
        text="Option D"
        name="option_d"
        type="text"
        value={data.options[3]}
        autoFocus={autoFocus}
        error={questionErrors[`option-${index}-3`]}
        handleChange={(e) => {
          const options = [...data.options];
          options[3] = e.target.value;
          onChange({
            ...data,
            options,
          });

          if (questionErrors[`option-${index}-3`]) {
            setQuestionErrors((prev) => {
              const updated = { ...prev };
              delete updated[`option-${index}-3`];
              return updated;
            });
          }
        }}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Correct Answer</label>
        <Select
          value={data.answer}
          onValueChange={(value) => {
            onChange({
              ...data,
              answer: value as "A" | "B" | "C" | "D",
            });

            if (questionErrors[`answer-${index}`]) {
              setQuestionErrors((prev) => {
                const updated = { ...prev };
                delete updated[`answer-${index}`];
                return updated;
              });
            }
          }}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="A">A</SelectItem>
            <SelectItem value="B">B</SelectItem>
            <SelectItem value="C">C</SelectItem>
            <SelectItem value="D">D</SelectItem>
          </SelectContent>
        </Select>
        {questionErrors[`answer-${index}`] && (
          <p className="text-sm text-destructive">
            {questionErrors[`answer-${index}`]}
          </p>
        )}
      </div>

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
