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
import { useUpdateChallenge } from "@/hooks/challenges";
import { ChallengeService } from "@/services/challenge";
import type { Challenge } from "@/types/model";
import type { ChallengeContext } from "./challenge-manager";
import { getFieldError } from "@/utils/global";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { Upload, X, FileIcon, AlertCircle, CheckCircle2, Download, Trash2 } from "lucide-react";

type Props = {
  challenge: Challenge;
  context: ChallengeContext;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const STORAGE_KEY = (challengeId: number) => `coding-assignment-edit-draft-${challengeId}`;

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

export default function CodingAssignmentModalEdit({
  challenge,
  context,
  isOpen,
  onOpenChange,
}: Props) {
  const updateChallenge = useUpdateChallenge(
    context.type === 'lesson' ? context.id : undefined,
    context.type === 'module' ? context.slug : undefined
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [form, setForm] = useState({
    title: challenge.title,
    difficulty: challenge.difficulty || ("" as "" | "easy" | "medium" | "hard"),
    order: challenge.order ? String(challenge.order) : "1",
    content: challenge.content,
    max_score: String(challenge.max_score),
    points: challenge.points ? String(challenge.points) : "",
    allowed_attempts: challenge.allowed_attempts ? String(challenge.allowed_attempts) : "3",
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

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [removeAttachment, setRemoveAttachment] = useState(false);
  const [saving, setSaving] = useState(false);
  const [readyToSave, setReadyToSave] = useState(false);
  
  const debouncedForm = useDebounce(form);

  // Current attachment from challenge
  const currentAttachment = challenge.attachments?.[0];

  // Load challenge data and draft on modal open
  useEffect(() => {
    if (!isOpen) return;

    setReadyToSave(false);

    const draft = localStorage.getItem(STORAGE_KEY(challenge.id));

    if (!draft) {
      setForm({
        title: challenge.title,
        difficulty: challenge.difficulty || "",
        order: challenge.order ? String(challenge.order) : "1",
        content: challenge.content,
        max_score: String(challenge.max_score),
        points: challenge.points ? String(challenge.points) : "",
        allowed_attempts: challenge.allowed_attempts ? String(challenge.allowed_attempts) : "3",
      });
      setIsUnlimitedAttempts(challenge.allowed_attempts === null);
      setSelectedFile(null);
      setFileError(null);
      setFormErrors({});
      setRemoveAttachment(false);
      setReadyToSave(true);
      return;
    }

    try {
      const parsed = JSON.parse(draft);

      setForm({
        title: parsed.form.title || challenge.title,
        difficulty: parsed.form.difficulty || challenge.difficulty || "",
        order: parsed.form.order || (challenge.order ? String(challenge.order) : "1"),
        content: parsed.form.content || challenge.content,
        max_score: parsed.form.max_score || String(challenge.max_score),
        points: parsed.form.points || (challenge.points ? String(challenge.points) : ""),
        allowed_attempts: parsed.form.allowed_attempts || (challenge.allowed_attempts ? String(challenge.allowed_attempts) : "3"),
      });

      setIsUnlimitedAttempts(parsed.isUnlimitedAttempts ?? (challenge.allowed_attempts === null));
      setFormErrors({});
      setSelectedFile(null);
      setFileError(null);
      setRemoveAttachment(false);

      toast("Draft restored");
    } catch (error) {
      setForm({
        title: challenge.title,
        difficulty: challenge.difficulty || "",
        order: challenge.order ? String(challenge.order) : "1",
        content: challenge.content,
        max_score: String(challenge.max_score),
        points: challenge.points ? String(challenge.points) : "",
        allowed_attempts: challenge.allowed_attempts ? String(challenge.allowed_attempts) : "3",
      });
      setIsUnlimitedAttempts(challenge.allowed_attempts === null);
      setFormErrors({});
      setSelectedFile(null);
      setFileError(null);
      setRemoveAttachment(false);
    } finally {
      setReadyToSave(true);
    }
  }, [challenge, isOpen]);

  // Auto-save draft
  useEffect(() => {
    if (!isOpen) return;
    if (!readyToSave) return;

    setSaving(true);

    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY(challenge.id),
        JSON.stringify({
          form: debouncedForm,
          isUnlimitedAttempts,
        }),
      );

      setSaving(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [debouncedForm, challenge.id, readyToSave, isOpen, isUnlimitedAttempts]);

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
    setRemoveAttachment(false);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveCurrentAttachment = () => {
    setRemoveAttachment(true);
    toast("Attachment will be removed on save");
  };

  const handleDownloadAttachment = () => {
    if (currentAttachment) {
      // Construct download URL - adjust based on your backend API
      const downloadUrl = `/api/challenges/${challenge.id}/attachments/${currentAttachment.id}`;
      window.open(downloadUrl, '_blank');
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

    if (!form.order.trim()) {
      errors.order = "Order is required.";
    } else if (Number(form.order) < 1) {
      errors.order = "Order must be at least 1.";
    } else if (!Number.isInteger(Number(form.order))) {
      errors.order = "Order must be an integer.";
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
      } else if (!Number.isInteger(Number(form.allowed_attempts))) {
        errors.allowed_attempts = "Allowed Attempts must be an integer.";
      }
    }

    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    const payload = {
      id: challenge.id,      module_id: null,
      lesson_id: challenge.lesson_id,
      title: form.title,
      slug: challenge.slug,
      type: challenge.type,
      difficulty: form.difficulty as "easy" | "medium" | "hard",
      order: Number(form.order),
      content: form.content,
      settings: challenge.settings || [] as any,
      metadata: (challenge.metadata || []) as any,
      max_score: Number(form.max_score),
      points: Number(form.points),
      allowed_attempts: isUnlimitedAttempts ? null : Number(form.allowed_attempts),
    };

    try {
      // If there's a new file to upload
      if (selectedFile) {
        setIsUploading(true);
        try {
          // Delete old attachment if exists
          if (currentAttachment) {
            await ChallengeService.deleteAttachment(challenge.id, currentAttachment.id);
          }

          // Upload new attachment
          await ChallengeService.addAttachment(
            challenge.id,
            selectedFile,
            selectedFile.name,
            "starter_file",
          );

          // Update challenge data
          await updateChallenge.mutateAsync(payload);
          toast.success("Coding Assignment updated with new attachment successfully");
        } catch (uploadError) {
          toast.error("Failed to update attachment");
          return;
        } finally {
          setIsUploading(false);
        }      } else if (removeAttachment && currentAttachment) {
        // User wants to remove attachment without adding new one
        setIsUploading(true);
        try {
          await ChallengeService.deleteAttachment(challenge.id, currentAttachment.id);
          await updateChallenge.mutateAsync(payload);
          toast.success("Attachment removed and challenge updated successfully");
        } catch (error) {
          toast.error("Failed to remove attachment");
          return;
        } finally {
          setIsUploading(false);
        }
      } else {
        // Regular update without file changes
        await updateChallenge.mutateAsync(payload);
        toast.success("Coding Assignment updated successfully");
      }

      // Clear draft on success
      localStorage.removeItem(STORAGE_KEY(challenge.id));

      onOpenChange(false);
    } catch (error) {
      toast.error("Failed to update Coding Assignment");
    }
  };

  const isProcessing = updateChallenge.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0">
        <DialogHeader className="shrink-0 border-b px-6 pt-6 pb-4 bg-background">
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Coding Assignment</DialogTitle>

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
            Update coding assignment details and attachment
          </DialogDescription>
        </DialogHeader>

        <div className="overflow-y-auto flex-1 px-6 pb-6">
          <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-4">            {updateChallenge.error &&
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
                <h3 className="text-lg font-semibold">Challenge Information</h3>
                <p className="text-sm text-muted-foreground">
                  Basic details about the coding assignment
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
                  {getFieldError(updateChallenge.error?.errors, "difficulty") && (
                    <p className="text-sm text-red-500">
                      {getFieldError(updateChallenge.error?.errors, "difficulty")}
                    </p>
                  )}
                </div>

                <div>
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
                <h3 className="text-lg font-semibold">Scoring Configuration</h3>
                <p className="text-sm text-muted-foreground">
                  Set the total weight and reward points for this assignment
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <InputForm
                    name="max_score"
                    text="Max Score"
                    type="number"
                    value={form.max_score}
                    handleChange={handleChange}
                    error={
                      formErrors.max_score ??
                      getFieldError(updateChallenge.error?.errors, "max_score")
                    }
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Total weight of the assignment
                  </p>
                </div>

                <div>
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
                  Configure how many times students can submit this assignment
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

            <Separator />

            {/* Current Attachment Section */}
            {currentAttachment && !removeAttachment && (
              <>
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">Current Attachment</h3>
                    <p className="text-sm text-muted-foreground">
                      Existing file attached to this assignment
                    </p>
                  </div>

                  <div className="border rounded-lg p-4 bg-muted/30">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start gap-3 flex-1 min-w-0">
                        <FileIcon className="h-10 w-10 text-blue-500 shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{currentAttachment.file_name}</p>
                          {currentAttachment.size && (
                            <p className="text-sm text-muted-foreground">
                              {formatFileSize(Number(currentAttachment.size) || 0)}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleDownloadAttachment}
                          disabled={isProcessing}
                          title="Download">
                          <Download className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={handleRemoveCurrentAttachment}
                          disabled={isProcessing}
                          title="Remove">
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                <Separator />
              </>
            )}

            {/* Upload New Attachment Section */}
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold">
                  {currentAttachment && !removeAttachment ? "Replace" : "Upload"} Attachment{" "}
                  <span className="text-sm font-normal text-muted-foreground">
                    (Optional)
                  </span>
                </h3>
                <p className="text-sm text-muted-foreground">
                  {currentAttachment && !removeAttachment 
                    ? "Upload a new file to replace the current attachment"
                    : "Upload a starter file or example for students"
                  } (Max: 50 MB)
                </p>
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
                    No new file selected.
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

            <LoadingButton
              text={
                isUploading
                  ? "Uploading attachment..."
                  : updateChallenge.isPending
                    ? "Updating..."
                    : "Update Coding Assignment"
              }
              loading={isProcessing}
              disabled={isProcessing}
            />
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
