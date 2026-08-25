import InputForm from "@/components/custom/input-form";
import { useDebounce } from "@/hooks/use-debounce";
import { toast } from "sonner";
import TextareaForm from "@/components/custom/textarea-form";
import Builder from "./builder";
import ScoringSummary from "./scoring-summary";
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useUpdateChallenge } from "@/hooks/challenges";
import type { Challenge } from "@/types/model";
import type { ChallengeFormType } from "@/types/challenge";
import { getFieldError } from "@/utils/global";
import { useState, useEffect, useRef, useMemo } from "react";
import { calculateQuestionScore } from "@/helper/calculate-score";
import { validateAllQuestions } from "@/helper/validate-question";
import { CheckCircle2, AlertCircle, X } from "lucide-react";
import { Button } from "@/components/ui/button";

type Props = {
  challenge: Challenge;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const EDIT_STORAGE_KEY = (challengeId: number) =>
  `challenge-edit-draft-${challengeId}`;

export default function ChallengeModalManage({
  challenge,
  isOpen,
  onOpenChange,
}: Props) {
  const updateChallenge = useUpdateChallenge(challenge.lesson_id ?? undefined);

  const [form, setForm] = useState<{
    title: string;
    type: ChallengeFormType;
    difficulty: "" | "easy" | "medium" | "hard";
    order: string;
    content: string;
    max_score: string;
    points: string;
    allowed_attempts: string;
  }>({
    title: challenge.title,
    type: challenge.type as ChallengeFormType,
    difficulty: challenge.difficulty || "",
    order: challenge.order ? String(challenge.order) : "1",
    content: challenge.content,
    max_score: String(challenge.max_score),
    points: challenge.points ? String(challenge.points) : "",
    allowed_attempts:
      challenge.allowed_attempts ? String(challenge.allowed_attempts) : "1",
  });

  const [isUnlimitedAttempts, setIsUnlimitedAttempts] = useState(
    challenge.allowed_attempts === null
  );

  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>(
    {},
  );
  const [formErrors, setFormErrors] = useState<{
    title?: string;
    difficulty?: string;
    order?: string;
    content?: string;
    max_score?: string;
    points?: string;
    allowed_attempts?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const [showCloseConfirm, setShowCloseConfirm] = useState(false);
  const [pendingClose, setPendingClose] = useState(false);
  const debouncedForm = useDebounce(form);
  const debouncedQuestions = useDebounce(questions);
  const [readyToSave, setReadyToSave] = useState(false);

  // Store original state for unsaved changes detection
  const [originalState, setOriginalState] = useState<{
    form: typeof form;
    questions: Question[];
  } | null>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const orderRef = useRef<HTMLDivElement>(null);
  const maxScoreRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const allowedAttemptsRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  // Detect unsaved changes
  const hasUnsavedChanges = useMemo(() => {
    if (!originalState) return false;

    const currentState = JSON.stringify({ form, questions });
    const original = JSON.stringify(originalState);

    return currentState !== original;
  }, [form, questions, originalState]);

  // Load challenge data when modal opens
  useEffect(() => {
    if (!isOpen) return;

    setReadyToSave(false);

    // Check for draft first
    const draft = localStorage.getItem(EDIT_STORAGE_KEY(challenge.id));

    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm(parsed.form);
        setQuestions(parsed.questions ?? []);
        setIsUnlimitedAttempts(parsed.isUnlimitedAttempts ?? (challenge.allowed_attempts === null));

        // Set original state from challenge, not draft
        const existingQuestions = challenge.metadata?.questions ?? [];
        setOriginalState({
          form: {
            title: challenge.title,
            type:
              challenge.type === "quiz_group" ?
                "mixed"
              : (challenge.type as ChallengeFormType),
            difficulty: challenge.difficulty || "",
            order: challenge.order ? String(challenge.order) : "1",
            content: challenge.content,
            max_score: String(challenge.max_score),
            points: challenge.points ? String(challenge.points) : "",
            allowed_attempts:
              challenge.allowed_attempts ?
                String(challenge.allowed_attempts)
              : "1",
          },
          questions: existingQuestions,
        });

        toast("Draft restored");
        setReadyToSave(true);
        return;
      } catch (error) {
        // Fall through to load from challenge
        setIsUnlimitedAttempts(challenge.allowed_attempts === null);
      }
    }

    // Load from challenge
    const existingQuestions = challenge.metadata?.questions ?? [];

    const initialForm: {
      title: string;
      type: ChallengeFormType;
      difficulty: "" | "easy" | "medium" | "hard";
      order: string;
      content: string;
      max_score: string;
      points: string;
      allowed_attempts: string;
    } = {
      title: challenge.title,
      type:
        challenge.type === "quiz_group" ?
          "mixed"
        : (challenge.type as ChallengeFormType),
      difficulty:
        (challenge.difficulty as "" | "easy" | "medium" | "hard") || "",
      order: challenge.order ? String(challenge.order) : "1",
      content: challenge.content,
      max_score: String(challenge.max_score),
      points: challenge.points ? String(challenge.points) : "",
      allowed_attempts:
        challenge.allowed_attempts ? String(challenge.allowed_attempts) : "1",
    };

    setForm(initialForm);
    setQuestions(existingQuestions);
    setIsUnlimitedAttempts(challenge.allowed_attempts === null);
    setOriginalState({
      form: initialForm,
      questions: existingQuestions,
    });
    setReadyToSave(true);
  }, [isOpen, challenge]);

  // Auto-save to localStorage
  useEffect(() => {
    if (!isOpen || !readyToSave) return;

    setSaving(true);

    const timer = setTimeout(() => {
      localStorage.setItem(
        EDIT_STORAGE_KEY(challenge.id),
        JSON.stringify({
          form: debouncedForm,
          questions: debouncedQuestions,
          isUnlimitedAttempts,
        }),
      );
      setSaving(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedForm, debouncedQuestions, isUnlimitedAttempts, challenge.id, readyToSave, isOpen]);

  // Recalculate scores when max_score or questions change
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

  const validateQuestions = () => {
    const errors = validateAllQuestions(questions, form.type);
    setQuestionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const canSubmit =
    form.title.trim() !== "" &&
    form.difficulty !== "" &&
    form.order.trim() !== "" &&
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
      order?: string;
      content?: string;
      max_score?: string;
      points?: string;
      allowed_attempts?: string;
    } = {};

    if (!form.title.trim()) {
      errors.title = "Challenge title is required.";
    }

    if (!form.difficulty) {
      errors.difficulty = "Difficulty is required.";
    }

    if (!form.order.trim()) {
      errors.order = "Order is required.";
    } else if (Number(form.order) < 1) {
      errors.order = "Order must be at least 1.";
    } else if (!Number.isInteger(Number(form.order))) {
      errors.order = "Order must be an integer.";
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
      titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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
      orderRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
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

    const submissionType = form.type === "mixed" ? "quiz_group" : form.type;

    updateChallenge.mutate(
      {
        id: challenge.id,
        module_id: challenge.module_id,
        lesson_id: challenge.lesson_id,
        title: form.title,
        slug: challenge.slug,
        type: submissionType,
        difficulty: form.difficulty || undefined,
        order: Number(form.order),
        content: form.content,
        settings: challenge.settings,
        metadata: {
          ...challenge.metadata,
          questions,
        },
        max_score: Number(form.max_score),
        points: Number(form.points),
        allowed_attempts: isUnlimitedAttempts ? null : Number(form.allowed_attempts),
      },
      {
        onSuccess: () => {
          localStorage.removeItem(EDIT_STORAGE_KEY(challenge.id));

          // Update original state to match new saved state
          setOriginalState({
            form,
            questions,
          });

          onOpenChange(false);
          toast.success("Challenge updated successfully");
        },
      },
    );
  };

  const handleCloseAttempt = (open: boolean) => {
    if (!open && hasUnsavedChanges) {
      setShowCloseConfirm(true);
      setPendingClose(true);
    } else {
      onOpenChange(open);
    }
  };

  const handleConfirmClose = () => {
    setShowCloseConfirm(false);
    setPendingClose(false);
    onOpenChange(false);
  };

  const handleCancelClose = () => {
    setShowCloseConfirm(false);
    setPendingClose(false);
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={handleCloseAttempt}>
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0"
          onEscapeKeyDown={(e) => {
            if (hasUnsavedChanges) {
              e.preventDefault();
              setShowCloseConfirm(true);
            }
          }}
          onPointerDownOutside={(e) => {
            if (hasUnsavedChanges) {
              e.preventDefault();
              setShowCloseConfirm(true);
            }
          }}>
          {/* Fixed Header */}
          <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4 bg-background">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <DialogTitle>Manage Challenge</DialogTitle>
                <DialogDescription className="mt-1">
                  Edit challenge configuration and questions
                </DialogDescription>
              </div>

              <div className="flex items-center gap-3">
                {/* Status Indicator */}
                <div className="flex items-center gap-3">
                  {updateChallenge.isPending ?
                    <>
                      <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse" />
                      <span className="text-xs text-blue-600 font-medium">
                        Saving...
                      </span>
                    </>
                  : hasUnsavedChanges ?
                    <>
                      <AlertCircle className="h-3.5 w-3.5 text-orange-600" />
                      <span className="text-xs text-orange-600 font-medium">
                        Unsaved changes
                      </span>
                    </>
                  : saving ?
                    <>
                      <div className="h-2 w-2 rounded-full bg-gray-400 animate-pulse" />
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

                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleCloseAttempt(false)}
                  className="h-8 w-8">
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Question Count and Slug */}
            <div className="mt-3 flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Questions:</span>
                <span className="font-semibold">{questions.length}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">Slug:</span>
                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {challenge.slug}
                </code>
              </div>
            </div>
          </DialogHeader>

          {/* Scrollable Content */}
          <div className="overflow-y-auto flex-1 px-6 pb-6">
            <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
              {updateChallenge.error &&
                updateChallenge.error.message !== "Validation errors" && (
                  <Alert variant="destructive">
                    <AlertDescription>
                      {updateChallenge.error.message}
                    </AlertDescription>
                  </Alert>
                )}

              {/* Challenge Information Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Challenge Information
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Basic details about the challenge
                  </p>
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
                      getFieldError(updateChallenge.error?.errors, "title")
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
                      updateChallenge.error?.errors,
                      "difficulty",
                    ) && (
                      <p className="text-sm text-red-500">
                        {getFieldError(
                          updateChallenge.error?.errors,
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

                  <div ref={orderRef}>
                    <InputForm
                      name="order"
                      text="Order"
                      type="number"
                      value={form.order}
                      handleChange={handleChange}
                      error={
                        formErrors.order ??
                        getFieldError(updateChallenge.error?.errors, "order")
                      }
                    />
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
                      getFieldError(updateChallenge.error?.errors, "content")
                    }
                  />
                </div>
              </div>

              <Separator />

              {/* Scoring Configuration Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">
                    Scoring Configuration
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Set the total weight and reward points for this challenge
                  </p>
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
                        getFieldError(
                          updateChallenge.error?.errors,
                          "max_score",
                        )
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Total weight of the challenge (distributed across
                      questions)
                    </p>
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
                        getFieldError(updateChallenge.error?.errors, "points")
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Reward points (EXP) earned upon completion
                    </p>
                  </div>
                </div>
              </div>

              <Separator />

              {/* Attempt Settings Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Attempt Settings</h3>
                  <p className="text-sm text-muted-foreground">
                    Configure how many times students can attempt this challenge
                  </p>
                </div>

                <div ref={allowedAttemptsRef} className="max-w-md space-y-3">
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
                  <div>
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
                          updateChallenge.error?.errors,
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

              {/* Scoring Summary */}
              {questions.length > 0 && (
                <>
                  <Separator />
                  <ScoringSummary
                    type={form.type}
                    maxScore={Number(form.max_score)}
                    questions={questions}
                  />
                </>
              )}

              <Separator />

              {/* Question Builder Section */}
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-semibold">Question Builder</h3>
                  <p className="text-sm text-muted-foreground">
                    Add and configure questions for this challenge
                  </p>
                </div>

                <Builder
                  type={form.type}
                  maxScore={Number(form.max_score)}
                  questions={questions}
                  onChange={setQuestions}
                  questionErrors={questionErrors}
                  setQuestionErrors={setQuestionErrors}
                  isModalOpen={isOpen}
                />
              </div>

              <div className="sticky bottom-0 bg-background pt-4 pb-2 border-t -mx-6 px-6">
                <LoadingButton
                  text="Update Challenge"
                  loading={updateChallenge.isPending}
                  disabled={!canSubmit}
                />
              </div>
            </form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Close Confirmation Dialog */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
            <AlertDialogDescription>
              You have unsaved changes. Are you sure you want to close? Your
              changes will be saved as a draft.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCancelClose}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmClose}>
              Close
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
