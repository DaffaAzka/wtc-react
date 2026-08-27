import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { useGetChallenge, useUpdateChallenge } from "@/hooks/challenges";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import ErrorState from "@/components/custom/error-state";
import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Info } from "lucide-react";

export default function EditChallengePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const challengeId = parseInt(id || "0", 10);

  const { challenge, loading, error } = useGetChallenge(challengeId);
  const updateChallenge = useUpdateChallenge();

  const [form, setForm] = useState({
    title: "",
    difficulty: "" as "" | "easy" | "medium" | "hard",
    content: "",
    max_score: "",
    minimum_score: "",
    points: "",
    allowed_attempts: "",
  });

  const [isUnlimitedAttempts, setIsUnlimitedAttempts] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (challenge) {
      setForm({
        title: challenge.title || "",
        difficulty: (challenge.difficulty as "" | "easy" | "medium" | "hard") || "",
        content: challenge.content || "",
        max_score: challenge.max_score?.toString() || "100",
        minimum_score: "0",
        points: challenge.points?.toString() || "",
        allowed_attempts: challenge.allowed_attempts?.toString() || "1",
      });
      setIsUnlimitedAttempts(challenge.allowed_attempts === null || challenge.allowed_attempts === -1);
    }
  }, [challenge]);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errors: Record<string, string> = {};

    if (!form.title.trim()) {
      errors.title = "Title is required.";
    }

    if (!form.difficulty) {
      errors.difficulty = "Difficulty is required.";
    }

    if (!form.content.trim()) {
      errors.content = "Description is required.";
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
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      toast.error("Please fix the errors before saving.");
      return;
    }

    if (!challenge) return;

    updateChallenge.mutate(
      {
        id: challenge.id,
        title: form.title,
        slug: challenge.slug,
        type: challenge.type,
        difficulty: form.difficulty as "easy" | "medium" | "hard",
        content: form.content,
        settings: challenge.settings,
        metadata: challenge.metadata,
        max_score: Number(form.max_score),
        points: Number(form.points),
        allowed_attempts: isUnlimitedAttempts ? null : Number(form.allowed_attempts),
        lesson_id: challenge.lesson_id,
        module_id: challenge.module_id,
      },
      {
        onSuccess: () => {
          toast.success("Challenge updated successfully!");
          navigate(`/admin/challenges/${challenge.id}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update challenge");
        },
      }
    );
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeaderSkeleton />
        <div className="h-96 animate-pulse rounded-lg bg-muted" />
      </div>
    );
  }

  if (error || !challenge) {
    return (
      <ErrorState
        title="Unable to load challenge"
        message={error?.message || "Challenge not found"}
        actionLabel="Back to Challenges"
        onAction={() => navigate("/admin/all-challenges")}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <Button variant="ghost" size="sm" asChild>
              <Link to={`/admin/challenges/${challenge.id}`}>
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                Back
              </Link>
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Edit Challenge</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {challenge.title}
          </p>
        </div>
      </div>

      {/* Info Alert */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          This form edits basic challenge properties. To edit questions, attachments, or advanced settings,
          visit the challenge from its lesson or module page.
        </AlertDescription>
      </Alert>

      {/* Edit Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <InputForm
              name="title"
              text="Title"
              type="text"
              value={form.title}
              handleChange={handleChange}
              error={formErrors.title}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>
                  Difficulty <span className="text-red-500">*</span>
                </Label>
                <Select
                  value={form.difficulty}
                  onValueChange={(value) => {
                    setForm((prev) => ({
                      ...prev,
                      difficulty: value as "easy" | "medium" | "hard",
                    }));
                    setFormErrors((prev) => ({ ...prev, difficulty: undefined }));
                  }}
                >
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
                  <p className="text-sm text-red-500">{formErrors.difficulty}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Type (Read-only)</Label>
                <input
                  type="text"
                  value={challenge.type}
                  disabled
                  className="w-full rounded-md border border-border bg-muted px-3 py-2 text-sm"
                />
              </div>
            </div>

            <TextareaForm
              name="content"
              text="Description"
              value={form.content}
              handleChange={handleChange}
              error={formErrors.content}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Scoring Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <InputForm
                name="max_score"
                text="Max Score"
                type="number"
                value={form.max_score}
                handleChange={handleChange}
                error={formErrors.max_score}
              />

              <InputForm
                name="points"
                text="Points (EXP)"
                type="number"
                value={form.points}
                handleChange={handleChange}
                isDisabled={true}
                error={formErrors.points}
              />
            </div>
            <p className="text-xs text-muted-foreground">
              Points are auto-calculated based on difficulty (Easy: 10, Medium: 20, Hard: 30)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempt Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <InputForm
              name="allowed_attempts"
              text="Allowed Attempts"
              type="number"
              value={isUnlimitedAttempts ? "" : form.allowed_attempts}
              handleChange={handleChange}
              isDisabled={isUnlimitedAttempts}
              placeholder={isUnlimitedAttempts ? "Unlimited" : ""}
              error={formErrors.allowed_attempts}
            />
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => navigate(`/admin/challenges/${challenge.id}`)}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={updateChallenge.isPending}>
            <Save className="h-4 w-4 mr-1.5" />
            {updateChallenge.isPending ? "Saving..." : "Save Changes"}
          </Button>
        </div>
      </form>
    </div>
  );
}
