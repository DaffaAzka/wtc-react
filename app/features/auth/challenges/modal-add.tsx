import InputForm from "@/components/custom/input-form";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import TextareaForm from "@/components/custom/textarea-form";
import Builder from "./builder";
import type { Question } from "@/types/challenge";
import LoadingButton from "@/components/custom/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useStoreChallenge } from "@/hooks/challenges";
import type { Lesson } from "@/types/model";
import { generateSlug, getFieldError } from "@/utils/global";
import { useState, useEffect, useRef } from "react";

type Props = {
  lesson: Lesson;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};
const STORAGE_KEY = (lessonId: number) => `challenge-draft-${lessonId}`;

export default function ChallengeModalAdd({
  lesson,
  isOpen,
  onOpenChange,
}: Props) {
  const storeChallenge = useStoreChallenge();

  const [form, setForm] = useState({
    title: "",
    slug: "",
    type: "multiple_choice" as "multiple_choice" | "essay" | "mixed",
    content: "",
    max_score: "100",
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    content?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const debouncedForm = useDebounce(form);
  const debouncedQuestions = useDebounce(questions);
  const [readyToSave, setReadyToSave] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setReadyToSave(false);

    const draft = localStorage.getItem(STORAGE_KEY(lesson.id));

    if (!draft) {
      setForm({
        title: "",
        slug: "",
        type: "multiple_choice",
        content: "",
        max_score: "100",
      });

      setQuestions([]);

      setReadyToSave(true);

      return;
    }

    try {
      const parsed = JSON.parse(draft);

      setForm(parsed.form);
      setQuestions(parsed.questions ?? []);

      toast("Draft restored");
    } finally {
      setReadyToSave(true);
    }
  }, [lesson.id, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (!readyToSave) return;

    setSaving(true);

    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY(lesson.id),
        JSON.stringify({
          form: debouncedForm,
          questions: debouncedQuestions,
        }),
      );

      setSaving(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedForm, debouncedQuestions, lesson.id, readyToSave, isOpen]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

    setFormErrors((prev) => ({
      ...prev,
      [e.target.name]: undefined,
    }));
  };

  const validateQuestions = () => {
    const errors: Record<string, string> = {};

    for (let i = 0; i < questions.length; i++) {
      const question = questions[i];

      if (!question.question.trim()) {
        questionErrors[`question-${i}`] = "Question is required.";
      }

      if (question.score <= 0) {
        questionErrors[`score-${i}`] = "Score must be greater than 0.";
      }

      if (question.type === "multiple_choice") {
        question.options.forEach((option, optionIndex) => {
          if (!option.trim()) {
            questionErrors[`option-${i}-${optionIndex}`] =
              `Option ${String.fromCharCode(65 + optionIndex)} is required.`;
          }
        });

        if (!question.answer) {
          questionErrors[`answer-${i}`] = "Please select the correct answer.";
        }
      }

      if (question.type === "essay") {
        if (!question.rubric.trim()) {
          questionErrors[`rubric-${i}`] = "Rubric is required.";
        }
      }
    }

    setQuestionErrors(errors);

    return Object.keys(errors).length === 0;
  };

  const canSubmit =
    form.title.trim() !== "" &&
    form.content.trim() !== "" &&
    questions.length > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: {
      title?: string;
      content?: string;
    } = {};

    if (!form.title.trim()) {
      errors.title = "Challenge title is required.";
    }

    if (!form.content.trim()) {
      errors.content = "Description is required.";
    }

    setFormErrors(errors);

    if (errors.title) {
      titleRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    if (errors.content) {
      descriptionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      return;
    }

    if (questions.length === 0) {
      toast.error("Please add at least one question.");
      return;
    }

    if (!validateQuestions()) {
      return;
    }
    storeChallenge.mutate(
      {
        module_id: null,
        lesson_id: lesson.id,
        title: form.title,
        slug: generateSlug(form.title),
        type: form.type,
        content: form.content,
        metadata: {
          questions,
        },
        max_score: Number(form.max_score),
      },
      {
        onSuccess: () => {
          localStorage.removeItem(STORAGE_KEY(lesson.id));

          setForm({
            title: "",
            slug: "",
            type: "multiple_choice",
            content: "",
            max_score: "100",
          });

          setQuestions([]);

          onOpenChange(false);

          toast.success("Challenge created successfully");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="sm:max-w-4xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Add Challenge</DialogTitle>

            <span className="text-xs text-muted-foreground">
              {saving ? "Saving..." : "Saved"}
            </span>
          </div>

          <DialogDescription>
            Lesson: <strong>{lesson.title}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
          {storeChallenge.error &&
            storeChallenge.error.message !== "Validation errors" && (
              <Alert variant="destructive">
                <AlertDescription>
                  {storeChallenge.error.message}
                </AlertDescription>
              </Alert>
            )}
          <div ref={titleRef}>
            <InputForm
              name="title"
              text="Challenge Title"
              type="text"
              value={form.title}
              handleChange={handleChange}
              error={
                formErrors.title ??
                getFieldError(storeChallenge.error?.errors, "title")
              }
            />
          </div>

          <div className="space-y-2">
            <Label>Challenge Type</Label>

            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  type: value,
                }))
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>

                <SelectItem value="essay">Essay</SelectItem>

                <SelectItem value="mixed">Mixed Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div ref={descriptionRef}>
            <TextareaForm
              name="content"
              text="Description"
              value={form.content}
              handleChange={handleChange}
              error={
                formErrors.content ??
                getFieldError(storeChallenge.error?.errors, "content")
              }
            />
          </div>

          <InputForm
            name="max_score"
            text="Max Score"
            type="number"
            value={form.max_score}
            handleChange={handleChange}
            error={getFieldError(storeChallenge.error?.errors, "max_score")}
          />

          <Builder
            type={form.type as "multiple_choice" | "essay" | "mixed"}
            questions={questions}
            onChange={setQuestions}
            errors={questionErrors}
            setQuestionErrors={setQuestionErrors}
          />
          <LoadingButton
            text="Create Challenge"
            loading={storeChallenge.isPending}
            disabled={!canSubmit}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
