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
import { Plus, Trash2 } from "lucide-react";

import MCQForm from "./mcq-form";
import EssayForm from "./essay-form";
import type { Question } from "./types";

type Props = {
  type: "multiple_choice" | "essay" | "mixed";
  questions: Question[];
  onChange: (questions: Question[]) => void;
};

export default function Builder({ type, questions, onChange }: Props) {
  const addMCQ = () => {
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
  };

  const addEssay = () => {
    onChange([
      ...questions,
      {
        type: "essay",
        question: "",
        rubric: "",
        score: 10,
      },
    ]);
  };

  const removeQuestion = (index: number) => {
    onChange(questions.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, value: Question) => {
    onChange(questions.map((item, i) => (i === index ? value : item)));
  };

  const renderAddButton = () => {
    if (type === "mixed") {
      return (
        <Select
          onValueChange={(value) => {
            if (value === "multiple_choice") {
              addMCQ();
            }

            if (value === "essay") {
              addEssay();
            }
          }}>
          <SelectTrigger className="w-44">
            <SelectValue placeholder="Add" />
          </SelectTrigger>

          <SelectContent>
            <SelectItem value="multiple_choice">Multiple Choice</SelectItem>

            <SelectItem value="essay">Essay</SelectItem>
          </SelectContent>
        </Select>
      );
    }

    return (
      <Button
        type="button"
        onClick={() => {
          if (type === "multiple_choice") {
            addMCQ();
          } else {
            addEssay();
          }
        }}>
        <Plus className="mr-2 h-4 w-4" />
        Add Question
      </Button>
    );
  };

  return (
    <div className="space-y-5">
      <h3 className="text-lg font-semibold">Questions</h3>

      {questions.length === 0 && (
        <Card>
          <CardContent className="py-10 flex flex-col items-center gap-4">
            <p className="text-muted-foreground">No questions yet.</p>

            {renderAddButton()}
          </CardContent>
        </Card>
      )}

      {questions.map((question, index) => (
        <Card key={index}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Question {index + 1}</CardTitle>

              <Badge variant="secondary">
                {question.type === "multiple_choice"
                  ? "Multiple Choice"
                  : "Essay"}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            {question.type === "multiple_choice" ? (
              <MCQForm
                index={index}
                data={question}
                onChange={(value) => updateQuestion(index, value)}
              />
            ) : (
              <EssayForm
                index={index}
                data={question}
                onChange={(value) => updateQuestion(index, value)}
              />
            )}

            <div className="flex justify-between border-t pt-5">
              <Button
                variant="destructive"
                type="button"
                onClick={() => removeQuestion(index)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>

              {renderAddButton()}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
