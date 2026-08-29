import InputForm from "@/components/custom/input-form";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import TextareaForm from "@/components/custom/textarea-form";
import Builder from "./builder";
import type { Question, ChallengeFormType } from "@/types/challenge";
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
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useStoreChallenge } from "@/hooks/challenges";
import type { ChallengeContext } from "./challenge-manager";
import type { GeneratedChallenge } from "@/services/ai";
import { generateSlug, getFieldError } from "@/utils/global";
import { useState, useEffect, useRef } from "react";
import { calculateQuestionScore } from "@/helper/calculate-score";
import { validateAllQuestions } from "@/helper/validate-question";
import {
  CheckCircle2,
  Info,
  Target,
  RotateCw,
  HelpCircle,
} from "lucide-react";

type Props = {
  context: ChallengeContext;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: GeneratedChallenge;
};

const STORAGE_KEY = (contextId: number, contextType: "lesson" | "module") =>
  `challenge-draft-${contextType}-${contextId}`;

export default function ChallengeModalAdd({
  context,
  isOpen,
  onOpenChange,
  prefill,
}: Props) {
  const contextId = context.id;
  const contextType = context.type;

  const storeChallenge = useStoreChallenge(
    context.type === "lesson" ? context.id : undefined,
    context.type === "module" ? context.slug : undefined,
  );

  const [form, setForm] = useState<{
    title: string;
    type: ChallengeFormType;
    difficulty: "" | "easy" | "medium" | "hard";
    content: string;
    max_score: string;
    minimum_score: string;
    points: string;
    allowed_attempts: string;
  }>({
    title: "",
    type: "multiple_choice",
    difficulty: "",
    content: "",
    max_score: "100",
    minimum_score: "0",
    points: "",
    allowed_attempts: "1",
  });

  const [isUnlimitedAttempts, setIsUnlimitedAttempts] = useState(false);

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    difficulty?: string;
    content?: string;
    max_score?: string;
    minimum_score?: string;
    points?: string;
    allowed_attempts?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const debouncedForm = useDebounce(form);
  const debouncedQuestions = useDebounce(questions);
  const [readyToSave, setReadyToSave] = useState(false);
  const titleRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const maxScoreRef = useRef<HTMLDivElement>(null);
  const minimumScoreRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const allowedAttemptsRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Apply prefill from AI generation
  useEffect(() => {
    if (!prefill || !isOpen) return;

    const prefillType: ChallengeFormType =
      prefill.questions.some((q) => q.type === "multiple_choice") &&
      prefill.questions.some((q) => q.type === "essay")
        ? "mixed"
        : prefill.questions[0]?.type === "essay"
          ? "essay"
          : "multiple_choice";

    setForm((prev) => ({
      ...prev,
      title: prefill.title,
      content: prefill.content,
      type: prefillType,
      ...(prefill.difficulty ? { difficulty: prefill.difficulty } : {}),
    }));

    setQuestions(prefill.questions);

    // Clear any existing draft so prefill takes over
    localStorage.removeItem(STORAGE_KEY(contextId, contextType));
  }, [prefill, isOpen]);

  // Auto-calculate points based on difficulty
  useEffect(() => {
    if (!form.difficulty) return;

    const pointsMap: Record<"easy" | "medium" | "hard", string> = {
      easy: "10",
      medium: "20",
      hard: "30",
    };

    setForm((prev) => ({
      ...prev,
      points: pointsMap[form.difficulty as "easy" | "medium" | "hard"],
    }));
  }, [form.difficulty]);

  useEffect(() => {
    if (!isOpen) return;

    setReadyToSave(false);

    // If prefill is provided, skip draft restoration — prefill effect handles population
    if (prefill) {
      setReadyToSave(true);
      return;
    }

    const draft = localStorage.getItem(STORAGE_KEY(contextId, contextType));

    if (!draft) {
      setForm({
        title: "",
        type: "multiple_choice",
        difficulty: "",
        content: "",
        max_score: "100",
        minimum_score: "0",
        points: "",
        allowed_attempts: "1",
      });

      setIsUnlimitedAttempts(false);
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
        content: parsed.form.content || "",
        max_score: parsed.form.max_score || "100",
        minimum_score: parsed.form.minimum_score ?? "0",
        points: parsed.form.points || "",
        allowed_attempts: parsed.form.allowed_attempts || "1",
      });
      setIsUnlimitedAttempts(parsed.isUnlimitedAttempts ?? false);
      setQuestions(parsed.questions ?? []);

      toast("Draft restored");
    } catch (error) {
      setForm({
        title: "",
        type: "multiple_choice",
        difficulty: "",
        content: "",
        max_score: "100",
        minimum_score: "0",
        points: "",
        allowed_attempts: "1",
      });
      setIsUnlimitedAttempts(false);
      setQuestions([]);
    } finally {
      setReadyToSave(true);
    }
  }, [contextId, isOpen]);

  useEffect(() => {
    if (!isOpen) return;

    if (!readyToSave) return;

    setSaving(true);

    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY(contextId, contextType),
        JSON.stringify({
          form: debouncedForm,
          questions: debouncedQuestions,
          isUnlimitedAttempts,
        }),
      );

      setSaving(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedForm, debouncedQuestions, contextId, readyToSave, isOpen, isUnlimitedAttempts]);

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
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const clearFormError = (
    e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
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
    form.allowed_attempts.trim() !== "" &&
    form.content.trim() !== "" &&
    questions.length > 0;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const errors: {
      title?: string;
      difficulty?: string;
      content?: string;
      max_score?: string;
      minimum_score?: string;
      points?: string;
      allowed_attempts?: string;
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

    if (!form.minimum_score.trim()) {
      errors.minimum_score = "Minimum Score is required.";
    } else if (Number(form.minimum_score) < 0) {
      errors.minimum_score = "Minimum Score cannot be negative.";
    } else if (Number(form.minimum_score) > Number(form.max_score)) {
      errors.minimum_score = "Minimum Score cannot exceed Max Score.";
    }

    if (!form.points.trim()) {
      errors.points = "Points is required.";
    } else if (Number(form.points) < 0) {
      errors.points = "Points must be at least 0.";
    }

    if (!isUnlimitedAttempts) {
      if (!form.allowed_attempts.trim()) {
        errors.allowed_attempts = "Allowed Attempts is required.";
      } else if (Number(form.allowed_attempts) < 1) {
        errors.allowed_attempts = "Allowed Attempts must be at least 1.";
      } else if (!Number.isInteger(Number(form.allowed_attempts))) {
        errors.allowed_attempts = "Allowed Attempts must be an integer.";
      }
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

    if (errors.max_score) {
      maxScoreRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
      return;
    }

    if (errors.minimum_score) {
      minimumScoreRef.current?.scrollIntoView({
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

    if (errors.allowed_attempts) {
      allowedAttemptsRef.current?.scrollIntoView({
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
      form.type === "mixed" ? "quiz_group"
      : form.type === "essay" ? "fill_blank"
      : form.type;

    storeChallenge.mutate(
      {
        module_id: context.type === "module" ? context.id : null,
        lesson_id: context.type === "lesson" ? context.id : null,
        title: form.title,
        slug: generateSlug(form.title),
        type: submissionType,
        difficulty: form.difficulty || undefined,
        content: form.content,
        settings: {
          minimum_score: Number(form.minimum_score),
        },
        metadata: {
          questions,
        },
        max_score: Number(form.max_score),
        points: Number(form.points),
        allowed_attempts: isUnlimitedAttempts ? null : Number(form.allowed_attempts),
      },
      {
        onSuccess: () => {
          localStorage.removeItem(STORAGE_KEY(contextId, contextType));

          setForm({
            title: "",
            type: "multiple_choice",
            difficulty: "",
            content: "",
            max_score: "100",
            minimum_score: "0",
            points: "",
            allowed_attempts: "1",
          });

          setIsUnlimitedAttempts(false);
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
        {/* Fixed Header - Improved Design */}
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4 bg-background">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle>Add Challenge</DialogTitle>
              <Badge variant="outline" className="text-xs">
                {context.type === "lesson" ? "Lesson" : "Module"}: {context.title}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
              {saving ?
                <>
                  <div className="h-2 w-2 rounded-full bg-orange-500 animate-pulse" />
                  <span className="text-xs text-muted-foreground">
                    Saving draft...
                  </span>
                </>
              : <>
                  <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">
                    Saved
                  </span>
                </>
              }
            </div>
          </div>
        </DialogHeader>

        {/* Form wraps both scrollable content and button footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="flex flex-col gap-6 py-6">
            {storeChallenge.error &&
              storeChallenge.error.message !== "Validation errors" && (
                <Alert variant="destructive">
                  <AlertDescription>
                    {storeChallenge.error.message}
                  </AlertDescription>
                </Alert>
              )}

            {/* Challenge Information Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-blue-500/10">
                  <Info className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Challenge Information</h3>
                  <p className="text-sm text-muted-foreground">
                    Basic details about the challenge
                  </p>
                </div>
              </div>

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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div ref={difficultyRef} className="space-y-4">
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
                  {getFieldError(
                    storeChallenge.error?.errors,
                    "difficulty",
                  ) && (
                    <p className="text-sm text-red-500">
                      {getFieldError(
                        storeChallenge.error?.errors,
                        "difficulty",
                      )}
                    </p>
                  )}
                </div>

                <div className="space-y-4">
                  <Label>
                    Challenge Type <span className="text-red-500">*</span>
                  </Label>

                  <Select
                    value={form.type}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        type: value as ChallengeFormType,
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
            </div>

            <Separator />

            {/* Scoring Configuration Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-amber-500/10">
                  <Target className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Scoring Configuration</h3>
                  <p className="text-sm text-muted-foreground">
                    Set the total weight and reward points for this challenge
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <p className="text-xs text-muted-foreground mt-1">
                    Total weight of the challenge (distributed across questions)
                  </p>
                </div>

                <div ref={minimumScoreRef}>
                  <InputForm
                    name="minimum_score"
                    text="Minimum Score"
                    type="number"
                    value={form.minimum_score}
                    handleChange={handleChange}
                    error={
                      formErrors.minimum_score ??
                      getFieldError(storeChallenge.error?.errors, "minimum_score")
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Minimum score required to pass this challenge
                  </p>
                </div>

                <div ref={pointsRef}>
                  <InputForm
                    name="points"
                    text="Points"
                    type="number"
                    value={form.points}
                    handleChange={handleChange}
                    isDisabled={true}
                    error={
                      formErrors.points ??
                      getFieldError(storeChallenge.error?.errors, "points")
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Reward points (EXP) earned upon completion (auto-calculated based on difficulty)
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Attempt Settings Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-cyan-500/10">
                  <RotateCw className="h-4 w-4 text-cyan-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Attempt Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how many times students can attempt this challenge
                  </p>
                </div>
              </div>

              <div className="max-w-md space-y-3">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="unlimited-attempts"
                    checked={isUnlimitedAttempts}
                    onCheckedChange={(checked) => setIsUnlimitedAttempts(checked === true)}
                  />
                  <label
                    htmlFor="unlimited-attempts"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Unlimited attempts
                  </label>
                </div>
                <div ref={allowedAttemptsRef}>
                  <InputForm
                    name="allowed_attempts"
                    text="Allowed Attempts"
                    type="number"
                    value={isUnlimitedAttempts ? "" : form.allowed_attempts}
                    handleChange={handleChange}
                    isDisabled={isUnlimitedAttempts}
                    placeholder={isUnlimitedAttempts ? "Unlimited" : ""}
                    error={
                      formErrors.allowed_attempts ??
                      getFieldError(
                        storeChallenge.error?.errors,
                        "allowed_attempts",
                      )
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Number of attempts students can make (minimum: 1)
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Question Builder Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-indigo-500/10">
                  <HelpCircle className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Question Builder</h3>
                  <p className="text-sm text-muted-foreground">
                    Add and configure questions for this challenge
                  </p>
                </div>
              </div>

              <Builder
                type={form.type as ChallengeFormType}
                maxScore={Number(form.max_score)}
                questions={questions}
                onChange={setQuestions}
                questionErrors={questionErrors}
                setQuestionErrors={setQuestionErrors}
                isModalOpen={isOpen}
              />
            </div>
            </div>
          </div>

          {/* Fixed Button Footer - outside scrollable area but inside form */}
          <div className="shrink-0 border-t px-6 py-4 bg-background">
            <LoadingButton
              text="Create Challenge"
              loading={storeChallenge.isPending}
              disabled={storeChallenge.isPending}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
