import InputForm from "@/components/custom/input-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import type { MCQQuestion } from "./types";

type Props = {
  index: number;
  data: MCQQuestion;
  onChange: (data: MCQQuestion) => void;
};

export default function MCQForm({ data, onChange }: Props) {
  return (
    <div className="space-y-4">
      <InputForm
        text="Question"
        name="question"
        type="text"
        value={data.question}
        handleChange={(e) =>
          onChange({
            ...data,
            question: e.target.value,
          })
        }
      />

      <InputForm
        text="Option A"
        name="option_a"
        type="text"
        value={data.options[0]}
        handleChange={(e) => {
          const options = [...data.options];
          options[0] = e.target.value;

          onChange({
            ...data,
            options,
          });
        }}
      />

      <InputForm
        text="Option B"
        name="option_b"
        type="text"
        value={data.options[1]}
        handleChange={(e) => {
          const options = [...data.options];
          options[1] = e.target.value;

          onChange({
            ...data,
            options,
          });
        }}
      />

      <InputForm
        text="Option C"
        name="option_c"
        type="text"
        value={data.options[2]}
        handleChange={(e) => {
          const options = [...data.options];
          options[2] = e.target.value;

          onChange({
            ...data,
            options,
          });
        }}
      />

      <InputForm
        text="Option D"
        name="option_d"
        type="text"
        value={data.options[3]}
        handleChange={(e) => {
          const options = [...data.options];
          options[3] = e.target.value;

          onChange({
            ...data,
            options,
          });
        }}
      />

      <div className="space-y-2">
        <label className="text-sm font-medium">Correct Answer</label>

        <Select
          value={data.answer}
          onValueChange={(value) =>
            onChange({
              ...data,
              answer: value as "A" | "B" | "C" | "D",
            })
          }>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="A">Option A</SelectItem>
            <SelectItem value="B">Option B</SelectItem>
            <SelectItem value="C">Option C</SelectItem>
            <SelectItem value="D">Option D</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <InputForm
        text="Score"
        name="score"
        type="number"
        value={data.score.toString()}
        handleChange={(e) =>
          onChange({
            ...data,
            score: Number(e.target.value),
          })
        }
      />
    </div>
  );
}
