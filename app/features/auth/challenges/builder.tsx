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
import { ChevronDown, ChevronRight, Copy, Plus, Trash2 } from "lucide-react";
import { useEffect, useState, useRef } from "react";
import MCQForm from "./mcq-form";
import EssayForm from "./essay-form";
import type { Question } from "./types";

type Props = {
  type: "multiple_choice" | "essay" | "mixed";
  questions: Question[];
  onChange: (questions: Question[]) => void;
};

export default function Builder({ type, questions, onChange }: Props) {
  const [openIndex, setOpenIndex] = useState(0);
  const lastQuestionRef = useRef<HTMLDivElement | null>(null);

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

  const duplicateQuestion = (index: number) => {
    const question = structuredClone(questions[index]);

    const newQuestions = [...questions];

    newQuestions.splice(index + 1, 0, question);

    onChange(newQuestions);

    setOpenIndex(index + 1);
  };

  const updateQuestion = (index: number, value: Question) => {
    onChange(questions.map((item, i) => (i === index ? value : item)));
  };
  
  useEffect(() => {
    if (questions.length === 0) return;

    setOpenIndex(questions.length - 1);

    requestAnimationFrame(() => {
      lastQuestionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    });
  }, [questions.length]);
  
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
          <CardContent className="flex flex-col items-center gap-4 py-10">
            <p className="text-muted-foreground">No questions yet.</p>

            {renderAddButton()}
          </CardContent>
        </Card>
      )}

      {questions.map((question, index) => (
        <div
          key={index}
          ref={index === questions.length - 1 ? lastQuestionRef : null}>
          <Card>
            <CardHeader
              className="cursor-pointer"
              onClick={() => setOpenIndex(openIndex === index ? -1 : index)}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {openIndex === index ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}

                  <CardTitle>Question {index + 1}</CardTitle>
                </div>

                <Badge variant="secondary">
                  {question.type === "multiple_choice"
                    ? "Multiple Choice"
                    : "Essay"}
                </Badge>
              </div>
            </CardHeader>

            {openIndex === index && (
              <CardContent className="space-y-6">
                {question.type === "multiple_choice" ? (
                  <MCQForm
                    index={index}
                    autoFocus={index === openIndex}
                    data={question}
                    onChange={(value) => updateQuestion(index, value)}
                  />
                ) : (
                  <EssayForm
                    index={index}
                    autoFocus={index === openIndex}
                    data={question}
                    onChange={(value) => updateQuestion(index, value)}
                  />
                )}

                <div className="flex justify-between border-t pt-5">
                  <div className="flex gap-2">
                    <Card className="transition-all duration-200"></Card>
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => duplicateQuestion(index)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </Button>

                    <Button
                      variant="destructive"
                      type="button"
                      disabled={questions.length === 1}
                      onClick={() => removeQuestion(index)}>
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </div>
              </CardContent>
            )}
          </Card>
        </div>
      ))}
    </div>
  );
}
