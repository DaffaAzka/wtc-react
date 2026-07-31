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
import type { Question } from "@/types/challenge";

type Props = {
  type: "multiple_choice" | "essay" | "mixed";
  questions: Question[];
  onChange: (questions: Question[]) => void;
  questionErrors: Record<string, string>;
  setQuestionErrors: React.Dispatch<
    React.SetStateAction<Record<string, string>>
  >;
};

export default function Builder({
  type,
  questions,
  onChange,
  questionErrors,
  setQuestionErrors,
}: Props) {
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
    const newQuestions = questions.filter((_, i) => i !== index);
    onChange(newQuestions);

    if (newQuestions.length === 0) {
      setOpenIndex(-1);
      return;
    }

    setOpenIndex(Math.max(0, index - 1));
  };

  const duplicateQuestion = (index: number) => {
    const question = structuredClone(questions[index]);
    const newQuestions = [...questions];
    newQuestions.splice(index + 1, 0, question);
    onChange(newQuestions);
    setOpenIndex(index + 1);
  };

  const updateQuestion = (index: number, value: Question) => {
    const newQuestions = [...questions];
    newQuestions[index] = value;
    onChange(newQuestions);
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

  if (questions.length === 0) {
    return (
      <div className="border-2 border-dashed rounded-lg p-8 text-center space-y-4">
        <p className="text-muted-foreground">No questions yet</p>
        {renderAddButton()}
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
                    data={question}
                    onChange={(value) => updateQuestion(index, value)}
                    questionErrors={questionErrors}
                    setQuestionErrors={setQuestionErrors}
                  />
                ) : (
                  <EssayForm
                    index={index}
                    autoFocus={index === openIndex}
                    data={question}
                    onChange={(value) => updateQuestion(index, value)}
                    questionErrors={questionErrors}
                    setQuestionErrors={setQuestionErrors}
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

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      type="button"
                      onClick={() => duplicateQuestion(index)}>
                      <Copy className="mr-2 h-4 w-4" />
                      Duplicate
                    </Button>

                    {renderAddButton()}
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
