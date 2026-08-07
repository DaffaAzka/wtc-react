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
import { calculateQuestionScore } from "@/helper/calculate-score";
import { validateAllQuestions } from "@/helper/validate-question";
import { CheckCircle2 } from "lucide-react";

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
    type: "multiple_choice" as "multiple_choice" | "essay" | "mixed",
    difficulty: "" as "" | "easy" | "medium" | "hard",
    max_score: "100",
    points: "",
    content: "",
  });

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    difficulty?: string;
    max_score?: string;
    points?: string;
    content?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const debouncedForm = useDebounce(form);
  const debouncedQuestions = useDebounce(questions);
  const [readyToSave, setReadyToSave] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);
  const maxScoreRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    setReadyToSave(false);

    const draft = localStorage.getItem(STORAGE_KEY(lesson.id));

    if (!draft) {
      setForm({
        title: "",
        type: "multiple_choice",
        difficulty: "",
        max_score: "100",
        points: "",
        content: "",
      });

      setQuestions([]);

      setReadyToSave(true);

      return;
    }

    try {
      const parsed = JSON.parse(draft);

      setForm({
        title: parsed.form.title || "",
        type: parsed.form.type || "multiple_choice",
        difficulty: parsed.form.difficulty || "",
        max_score: parsed.form.max_score || "100",
        points: parsed.form.points || "",
        content: parsed.form.content || "",
      });
      setQuestions(parsed.questions ?? []);

      toast("Draft restored");
    } catch (error) {
      setForm({
        title: "",
        type: "multiple_choice",
        difficulty: "",
        order: "",
        max_score: "100",
        points: "",
        content: "",
      });
      setQuestions([]);
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

  useEffect(() => {
    if (!readyToSave) return;
    if (!form.max_score || questions.length === 0) return;

    const maxScore = Number(form.max_score);
    if (maxScore <= 0 || isNaN(maxScore)) return;

    const mcqCount = questions.filter(
      (q) => q.type === "multiple_choice",
    ).length;
    const essayCount = questions.filter((q) => q.type === "essay").length;

    const firstQuestion = questions[0];
    const expectedScore = calculateQuestionScore(
      firstQuestion.type,
      maxScore,
      mcqCount,
      essayCount,
      form.type,
    );

    if (Math.abs(firstQuestion.score - expectedScore) < 0.001) {
      return;
    }

    const updatedQuestions = questions.map((question) => ({
      ...question,
      score: calculateQuestionScore(
        question.type,
        maxScore,
        mcqCount,
        essayCount,
        form.type,
      ),
    }));

    setQuestions(updatedQuestions);
  }, [form.max_score, questions.length, form.type, readyToSave]);

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
    const errors = validateAllQuestions(questions, form.type);
    setQuestionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canSubmit =
    form.title.trim() !== "" &&
    form.difficulty !== "" &&
    form.max_score.trim() !== "" &&
    form.points.trim() !== "" &&
    form.content.trim() !== "" &&
    questions.length > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: {
      title?: string;
      difficulty?: string;
      order?: string;
      max_score?: string;
      points?: string;
      content?: string;
    } = {};

    if (!form.title.trim()) {
      errors.title = "Challenge title is required.";
    }

    if (!form.difficulty) {
      errors.difficulty = "Difficulty is required.";
    }

    if (!form.max_score.trim()) {
      errors.max_score = "Max Score is required.";
    } else if (Number(form.max_score) < 1) {
      errors.max_score = "Max Score must be at least 1.";
    }

    if (!form.points.trim()) {
      errors.points = "Points is required.";
    } else if (Number(form.points) < 0) {
      errors.points = "Points must be at least 0.";
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

    if (errors.difficulty) {
      difficultyRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (errors.order) {
      orderRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (errors.max_score) {
      maxScoreRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (errors.points) {
      pointsRef.current?.scrollIntoView({
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
      toast.error("Please fix all validation errors before submitting.");
      return;
    }

    const submissionType =
      form.type === "mixed" ? "multiple_choice" : form.type;

    storeChallenge.mutate(
      {
        module_id: null,
        lesson_id: lesson.id,
        title: form.title,
        slug: generateSlug(form.title),
        type: submissionType,
        difficulty: form.difficulty,
        max_score: Number(form.max_score),
        points: Number(form.points),
        content: form.content,
        metadata: {
          questions,
        },
      },
      {
        onSuccess: () => {
          localStorage.removeItem(STORAGE_KEY(lesson.id));

          setForm({
            title: "",
            type: "multiple_choice",
            difficulty: "",
            order: "",
            max_score: "100",
            points: "",
            content: "",
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
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        {/* Fixed Header - Outside scroll container */}
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4 bg-background">
          <div className="flex items-center justify-between">
            <DialogTitle>Add Challenge</DialogTitle>

            <div className="flex items-center gap-1.5">
              {saving ? (
                <>
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    Saving...
                  </span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Saved
                  </span>
                </>
              )}
            </div>
          </div>

          <DialogDescription>
            Lesson: <strong>{lesson.title}</strong>
          </DialogDescription>
        </DialogHeader>

        {/* Scrollable Content */}
        <div className="overflow-y-auto flex-1 px-6 pb-6">
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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={difficultyRef} className="space-y-2">
                <Label>
                  Difficulty <span className="text-red-500">*</span>
                </Label>

                <Select
                  value={form.difficulty || undefined}
                  onValueChange={(value) => {
                    setForm((prev) => ({
                      ...prev,
                      difficulty: value as "easy" | "medium" | "hard",
                    }));
                    setFormErrors((prev) => ({
                      ...prev,
                      difficulty: undefined,
                    }));
                  }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="easy">Easy</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="hard">Hard</SelectItem>
                  </SelectContent>
                </Select>

                {formErrors.difficulty && (
                  <p className="text-sm text-red-500">
                    {formErrors.difficulty}
                  </p>
                )}
                {getFieldError(storeChallenge.error?.errors, "difficulty") && (
                  <p className="text-sm text-red-500">
                    {getFieldError(storeChallenge.error?.errors, "difficulty")}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label>
                  Challenge Type <span className="text-red-500">*</span>
                </Label>

                <Select
                  value={form.type}
                  onValueChange={(value) =>
                    setForm((prev) => ({
                      ...prev,
                      type: value as "multiple_choice" | "essay" | "mixed",
                    }))
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>

                  <SelectContent>
                    <SelectItem value="multiple_choice">
                      Multiple Choice
                    </SelectItem>

                    <SelectItem value="essay">Essay</SelectItem>

                    <SelectItem value="mixed">Mixed Quiz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div ref={maxScoreRef}>
                <InputForm
                  name="max_score"
                  text="Max Score"
                  type="number"
                  value={form.max_score}
                  handleChange={handleChange}
                  error={
                    formErrors.max_score ??
                    getFieldError(storeChallenge.error?.errors, "max_score")
                  }
                />
              </div>
            </div>

            <div ref={pointsRef}>
              <InputForm
                name="points"
                text="Points"
                type="number"
                value={form.points}
                handleChange={handleChange}
                error={
                  formErrors.points ??
                  getFieldError(storeChallenge.error?.errors, "points")
                }
              />
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

            <Builder
              type={form.type as "multiple_choice" | "essay" | "mixed"}
              maxScore={Number(form.max_score)}
              questions={questions}
              onChange={setQuestions}
              questionErrors={questionErrors}
              setQuestionErrors={setQuestionErrors}
              isModalOpen={isOpen}
            />

            <LoadingButton
              text="Create Challenge"
              loading={storeChallenge.isPending}
              disabled={!canSubmit}
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
