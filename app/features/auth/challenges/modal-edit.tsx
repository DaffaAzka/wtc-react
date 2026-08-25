import InputForm from "@/components/custom/input-form";
import InputNumberForm from "@/components/custom/input-number-form";
import TextareaForm from "@/components/custom/textarea-form";
import LoadingButton from "@/components/custom/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { useUpdateChallenge } from "@/hooks/challenges";
import type { Challenge } from "@/types/model";
import type { ChallengeFormType } from "@/types/challenge";
import type { ChallengeContext } from "./challenge-manager";
import { getFieldError } from "@/utils/global";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type Props = {
  challenge: Challenge;
  context: ChallengeContext;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ChallengeModalEdit({
  challenge,
  context,
  isOpen,
  onOpenChange,
}: Props) {
  const updateChallenge = useUpdateChallenge(
    context.type === "lesson" ? context.id : undefined,
    context.type === "module" ? context.slug : undefined,
  );

  const [form, setForm] = useState({
    title: challenge.title,
    type: (challenge.type === "quiz_group" ?
      "mixed"
    : challenge.type) as ChallengeFormType,
    difficulty: challenge.difficulty || ("" as "" | "easy" | "medium" | "hard"),
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

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    difficulty?: string;
    order?: string;
    content?: string;
    max_score?: string;
    points?: string;
    allowed_attempts?: string;
  }>({});

  useEffect(() => {
    if (isOpen) {
      setForm({
        title: challenge.title,
        type: (challenge.type === "quiz_group" ?
          "mixed"
        : challenge.type) as ChallengeFormType,
        difficulty: challenge.difficulty || "",
        order: challenge.order ? String(challenge.order) : "1",
        content: challenge.content,
        max_score: String(challenge.max_score),
        points: challenge.points ? String(challenge.points) : "",
        allowed_attempts:
          challenge.allowed_attempts ? String(challenge.allowed_attempts) : "1",
      });
      setFormErrors({});
      setIsUnlimitedAttempts(challenge.allowed_attempts === null);
    }
  }, [isOpen, challenge]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: typeof formErrors = {};

    if (!form.title.trim()) {
      errors.title = "Title is required.";
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
      errors.content = "Content is required.";
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const submissionType = (
      form.type === "mixed" ?
        "quiz_group"
      : form.type) as Challenge["type"];

    const payload = {
      id: challenge.id,
      module_id: challenge.module_id,
      lesson_id: challenge.lesson_id,
      title: form.title,
      slug: challenge.slug,
      type: submissionType,
      difficulty: (form.difficulty || undefined) as
        "easy" | "medium" | "hard" | undefined,
      order: Number(form.order),
      content: form.content,
      settings: challenge.settings,
      metadata: challenge.metadata,
      max_score: Number(form.max_score),
      points: Number(form.points),
      allowed_attempts: isUnlimitedAttempts ? null : Number(form.allowed_attempts),
    };

    try {
      await updateChallenge.mutateAsync(payload);
      toast.success("Challenge updated successfully");
      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update challenge");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4 bg-background">
          <DialogTitle>Edit Challenge</DialogTitle>
          <DialogDescription>
            Update challenge configuration. To edit questions, use the Manage
            action.
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">
            {/* Challenge Information Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">
                  Challenge Information
                </h3>
                <p className="text-sm text-muted-foreground">
                  Basic details about the challenge
                </p>
              </div>

              <div>
                <InputForm
                  name="title"
                  text="Title"
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
                <div className="space-y-4">
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

                <div>
                  <InputNumberForm
                    name="order"
                    text="Order"
                    value={form.order}
                    handleChange={handleChange}
                    error={
                      formErrors.order ??
                      getFieldError(updateChallenge.error?.errors, "order")
                    }
                  />
                </div>
              </div>

              <div>
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
                <h3 className="text-base font-semibold">
                  Scoring Configuration
                </h3>
                <p className="text-sm text-muted-foreground">
                  Set the total weight and reward points
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputNumberForm
                    name="max_score"
                    text="Max Score"
                    value={form.max_score}
                    handleChange={handleChange}
                    error={
                      formErrors.max_score ??
                      getFieldError(updateChallenge.error?.errors, "max_score")
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Total weight (distributed across questions)
                  </p>
                </div>

                <div>
                  <InputNumberForm
                    name="points"
                    text="Points"
                    value={form.points}
                    handleChange={handleChange}
                    error={
                      formErrors.points ??
                      getFieldError(updateChallenge.error?.errors, "points")
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Reward points (EXP) upon completion
                  </p>
                </div>
              </div>
            </div>

            <Separator />

            {/* Attempt Settings Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-base font-semibold">Attempt Settings</h3>
                <p className="text-sm text-muted-foreground">
                  Configure attempt limits
                </p>
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
                <div>
                  <InputNumberForm
                    name="allowed_attempts"
                    text="Allowed Attempts"
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

            <div className="flex justify-end gap-2 pt-4">
              <LoadingButton
                text="Update Challenge"
                loading={updateChallenge.isPending}
              />
            </div>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
