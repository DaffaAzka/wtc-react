import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";
import LoadingButton from "@/components/custom/loading-button";
import { useDebounce } from "@/hooks/use-debounce";
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
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useStoreChallenge } from "@/hooks/challenges";
import { ChallengeService } from "@/services/challenge";
import type { ChallengeContext } from "./challenge-manager";
import { generateSlug, getFieldError } from "@/utils/global";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Upload, X, FileIcon, AlertCircle, CheckCircle2, Info, Target, RotateCw, Code2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

type Props = {
  context: ChallengeContext;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const STORAGE_KEY = (contextId: number, contextType: 'lesson' | 'module') =>
  `coding-assignment-draft-${contextType}-${contextId}`;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export default function CodingAssignmentModalAdd({
  context,
  isOpen,
  onOpenChange,
}: Props) {
  const contextId = context.id;
  const contextType = context.type;

  const storeChallenge = useStoreChallenge(
    context.type === 'lesson' ? context.id : undefined,
    context.type === 'module' ? context.slug : undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: "",
    difficulty: "" as "" | "easy" | "medium" | "hard",
    content: "",
    max_score: "100",
    minimum_score: "0",
    points: "",
    allowed_attempts: "3",
  });

  const [isUnlimitedAttempts, setIsUnlimitedAttempts] = useState(false);

  const [formErrors, setFormErrors] = useState<{
    title?: string;
    difficulty?: string;
    content?: string;
    max_score?: string;
    minimum_score?: string;
    points?: string;
    allowed_attempts?: string;
  }>({});

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readyToSave, setReadyToSave] = useState(false);
  
  const debouncedForm = useDebounce(form);

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

  // Load draft on modal open
  useEffect(() => {
    if (!isOpen) return;

    setReadyToSave(false);

    const draft = localStorage.getItem(STORAGE_KEY(contextId, contextType));

    if (!draft) {
      setForm({
        title: "",
        difficulty: "",
        content: "",
        max_score: "100",
        points: "",
        allowed_attempts: "3",
      });
      setIsUnlimitedAttempts(false);
      setSelectedFile(null);
      setFileError(null);
      setFormErrors({});
      setReadyToSave(true);
      return;
    }

    try {
      const parsed = JSON.parse(draft);

      setForm({
        title: parsed.form.title || "",
        difficulty: parsed.form.difficulty || "",
        content: parsed.form.content || "",
        max_score: parsed.form.max_score || "100",
        points: parsed.form.points || "",
        allowed_attempts: parsed.form.allowed_attempts || "3",
      });

      setIsUnlimitedAttempts(parsed.isUnlimitedAttempts ?? false);
      setFormErrors({});
      setSelectedFile(null);
      setFileError(null);

      toast("Draft restored");
    } catch (error) {
      setForm({
        title: "",
        difficulty: "",
        content: "",
        max_score: "100",
        points: "",
        allowed_attempts: "3",
      });
      setIsUnlimitedAttempts(false);
      setFormErrors({});
      setSelectedFile(null);
      setFileError(null);
    } finally {
      setReadyToSave(true);
    }
  }, [contextId, isOpen]);

  // Auto-save draft
  useEffect(() => {
    if (!isOpen) return;
    if (!readyToSave) return;

    setSaving(true);

    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY(contextId, contextType),
        JSON.stringify({
          form: debouncedForm,
          isUnlimitedAttempts,
        }),
      );

      setSaving(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedForm, contextId, readyToSave, isOpen, isUnlimitedAttempts]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));

    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const maxSize = 50 * 1024 * 1024;
    if (file.size > maxSize) {
      setFileError("File size must not exceed 50 MB.");
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }

    setSelectedFile(file);
    setFileError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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

    if (!form.content.trim()) {
      errors.content = "Description is required.";
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

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      module_id: context.type === 'module' ? context.id : null,
      lesson_id: context.type === 'lesson' ? context.id : null,
      title: form.title,
      slug: generateSlug(form.title),
      type: "file_upload" as const,
      difficulty: form.difficulty as "easy" | "medium" | "hard",
      content: form.content,
      settings: [] as any,
      metadata: [] as any,
      max_score: Number(form.max_score),
      points: Number(form.points),
      allowed_attempts: isUnlimitedAttempts ? null : Number(form.allowed_attempts),
    };

    try {
      const createdChallenge = await storeChallenge.mutateAsync(payload);

      if (selectedFile) {
        setIsUploading(true);
        try {
          await ChallengeService.addAttachment(createdChallenge.id, selectedFile, selectedFile.name, "starter_file");
          toast.success("Coding Assignment created with attachment successfully");
        } catch (uploadError) {
          toast.warning(
            "Coding Assignment created, but attachment upload failed. You can add it later via Edit.",
          );
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.success("Coding Assignment created successfully");
      }

      localStorage.removeItem(STORAGE_KEY(contextId, contextType));

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to create Coding Assignment");
    }
  };

  const isProcessing = storeChallenge.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4 bg-background">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <DialogTitle>Add Coding Assignment</DialogTitle>
              <Badge variant="outline" className="text-xs">
                {context.type === "lesson" ? "Lesson" : "Module"}: {context.title}
              </Badge>
            </div>

            <div className="flex items-center gap-3">
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
            Create a new coding assignment for students. Students will be able
            to submit their work for this assignment.
          </DialogDescription>
        </DialogHeader>

        {/* Form wraps both scrollable content and button footer */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-6">
            <div className="flex flex-col gap-6 py-6">            {storeChallenge.error &&
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
                    Basic details about the coding assignment
                  </p>
                </div>
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
                    getFieldError(storeChallenge.error?.errors, "title")
                  }
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <Label>
                    Difficulty <span className="text-red-500">*</span>
                  </Label>

                  <Select
                    value={form.difficulty}
                    onValueChange={(value) =>
                      setForm((prev) => ({
                        ...prev,
                        difficulty: value as "" | "easy" | "medium" | "hard",
                      }))
                    }>
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
              </div>

              <div>
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
                    Set the total weight and reward points for this assignment
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
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
                    Total weight of the assignment
                  </p>
                </div>

                <div>
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
                    Minimum score required to pass this assignment
                  </p>
                </div>

                <div>
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
                    Configure how many times students can submit this assignment
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

            {/* Example / Starter File Section */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-md bg-indigo-500/10">
                  <Code2 className="h-4 w-4 text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold">
                    Example / Starter File{" "}
                    <span className="text-sm font-normal text-muted-foreground">
                      (Optional)
                    </span>
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Upload a starter file or example for students (Max: 50 MB)
                  </p>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                className="hidden"
                accept="*"
                disabled={isProcessing}
              />

              {!selectedFile ? (
                <div>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full md:w-auto">
                    <Upload className="h-4 w-4 mr-2" />
                    Choose File
                  </Button>
                  <p className="text-xs text-muted-foreground mt-2">
                    No starter file attached.
                  </p>
                </div>
              ) : (
                <div className="border rounded-lg p-4 bg-muted/50">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <FileIcon className="h-10 w-10 text-muted-foreground shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{selectedFile.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {formatFileSize(selectedFile.size)}
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={handleRemoveFile}
                      disabled={isProcessing}
                      className="shrink-0">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}

              {fileError && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{fileError}</AlertDescription>
                </Alert>
              )}

              {isUploading && (
                <Alert>
                  <AlertDescription>
                    Uploading attachment, please wait...
                  </AlertDescription>
                </Alert>
              )}
            </div>
            </div>
          </div>

          {/* Fixed Button Footer - outside scrollable area but inside form */}
          <div className="shrink-0 border-t px-6 py-4 bg-background">
            <LoadingButton
              text={
                isUploading
                  ? "Uploading attachment..."
                  : storeChallenge.isPending
                    ? "Creating..."
                    : "Create Coding Assignment"
              }
              loading={isProcessing}
              disabled={isProcessing}
            />
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
