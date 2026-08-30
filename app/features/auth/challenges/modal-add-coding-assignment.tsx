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
import { Checkbox } from "@/components/ui/checkbox";
import { useStoreChallenge } from "@/hooks/challenges";
import { ChallengeService } from "@/services/challenge";
import type { ChallengeContext } from "./challenge-manager";
import { generateSlug, getFieldError } from "@/utils/global";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import {
  Upload,
  X,
  FileText,
  AlertCircle,
  CheckCircle2,
  Info,
  Target,
  RotateCw,
  Code2,
  Loader2,
} from "lucide-react";

type Props = {
  context: ChallengeContext;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const STORAGE_KEY = (contextId: number, contextType: "lesson" | "module") =>
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
    context.type === "lesson" ? context.id : undefined,
    context.type === "module" ? context.slug : undefined,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const maxScoreRef = useRef<HTMLDivElement>(null);
  const minimumScoreRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const allowedAttemptsRef = useRef<HTMLDivElement>(null);

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

  // Auto-calculate points
  useEffect(() => {
    if (!form.difficulty) return;
    const map: Record<"easy" | "medium" | "hard", string> = {
      easy: "10",
      medium: "20",
      hard: "30",
    };
    setForm((prev) => ({
      ...prev,
      points: map[form.difficulty as "easy" | "medium" | "hard"],
    }));
  }, [form.difficulty]);

  // Load draft
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
        minimum_score: "0",
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
        minimum_score: parsed.form.minimum_score ?? "0",
        points: parsed.form.points || "",
        allowed_attempts: parsed.form.allowed_attempts || "3",
      });
      setIsUnlimitedAttempts(parsed.isUnlimitedAttempts ?? false);
      setFormErrors({});
      setSelectedFile(null);
      setFileError(null);
      toast("Draft restored");
    } catch {
      setForm({
        title: "",
        difficulty: "",
        content: "",
        max_score: "100",
        minimum_score: "0",
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

  // Auto-save
  useEffect(() => {
    if (!isOpen || !readyToSave) return;
    setSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY(contextId, contextType),
        JSON.stringify({ form: debouncedForm, isUnlimitedAttempts }),
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
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) {
      setFileError("File size must not exceed 50MB.");
      setSelectedFile(null);
      if (fileInputRef.current) fileInputRef.current.value = "";
      return;
    }
    setSelectedFile(file);
    setFileError(null);
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.difficulty) errors.difficulty = "Difficulty is required.";
    if (!form.content.trim()) errors.content = "Description is required.";
    if (!form.max_score.trim()) errors.max_score = "Max Score is required.";
    else if (Number(form.max_score) < 1)
      errors.max_score = "Max Score must be at least 1.";
    if (!form.minimum_score.trim())
      errors.minimum_score = "Minimum Score is required.";
    else if (Number(form.minimum_score) < 0)
      errors.minimum_score = "Minimum Score cannot be negative.";
    else if (Number(form.minimum_score) > Number(form.max_score))
      errors.minimum_score = "Minimum Score cannot exceed Max Score.";
    if (!form.points.trim()) errors.points = "Points is required.";
    else if (Number(form.points) < 0)
      errors.points = "Points must be at least 0.";
    if (!isUnlimitedAttempts) {
      if (!form.allowed_attempts.trim())
        errors.allowed_attempts = "Allowed Attempts is required.";
      else if (Number(form.allowed_attempts) < 1)
        errors.allowed_attempts = "Must be at least 1.";
      else if (!Number.isInteger(Number(form.allowed_attempts)))
        errors.allowed_attempts = "Must be an integer.";
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
    if (errors.content) {
      contentRef.current?.scrollIntoView({
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

    try {
      const created = await storeChallenge.mutateAsync({
        module_id: context.type === "module" ? context.id : null,
        lesson_id: context.type === "lesson" ? context.id : null,
        title: form.title,
        slug: generateSlug(form.title),
        type: "file_upload" as const,
        difficulty: form.difficulty as "easy" | "medium" | "hard",
        content: form.content,
        settings: { minimum_score: Number(form.minimum_score) } as any,
        metadata: [] as any,
        max_score: Number(form.max_score),
        points: Number(form.points),
        allowed_attempts: isUnlimitedAttempts
          ? null
          : Number(form.allowed_attempts),
      });

      if (selectedFile) {
        setIsUploading(true);
        try {
          await ChallengeService.addAttachment(
            created.id,
            selectedFile,
            selectedFile.name,
            "starter_file",
          );
          toast.success("Coding Assignment created with attachment");
        } catch {
          toast.warning(
            "Assignment created, but attachment upload failed. You can add it later via Edit.",
          );
        } finally {
          setIsUploading(false);
        }
      } else {
        toast.success("Coding Assignment created successfully");
      }

      localStorage.removeItem(STORAGE_KEY(contextId, contextType));
      onOpenChange(false);
    } catch {
      toast.error("Failed to create Coding Assignment");
    }
  };

  const isProcessing = storeChallenge.isPending || isUploading;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
        {/* Fixed header */}
        <DialogHeader className="shrink-0 border-b border-gray-100 dark:border-white/5 px-6 pt-6 pb-4 bg-white dark:bg-[#0b1215]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle
                className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white"
                style={{ letterSpacing: "-0.02em" }}>
                Add Coding Assignment
              </DialogTitle>
              <DialogDescription asChild>
                <span className="inline-flex items-center rounded-full bg-[#1c81ff]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1c81ff]">
                  {context.type === "lesson" ? "Lesson" : "Module"}:{" "}
                  {context.title}
                </span>
              </DialogDescription>
            </div>
            <div className="flex items-center gap-1.5 text-[12px] shrink-0">
              {saving ? (
                <>
                  <Loader2 className="h-3 w-3 animate-spin text-[#f6b60b]" />
                  <span className="text-[#f6b60b]">Saving…</span>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-3 w-3 text-[#00E676]" />
                  <span className="font-bold text-[#00E676]">Saved</span>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 bg-gray-50 dark:bg-[#0d1117]">
            <div className="flex flex-col gap-6 py-6">
              {/* Server error */}
              {storeChallenge.error &&
                storeChallenge.error.message !== "Validation errors" && (
                  <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
                    <p className="text-[14px] text-red-600 dark:text-red-400">
                      {storeChallenge.error.message}
                    </p>
                  </div>
                )}

              {/* ── Information ── */}
              <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                    <Info className="h-4 w-4 text-[#1c81ff]" />
                  </div>
                  <div>
                    <h3
                      className="font-extrabold text-[15px] text-gray-900 dark:text-white"
                      style={{ letterSpacing: "-0.01em" }}>
                      Challenge Information
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Basic details about the coding assignment
                    </p>
                  </div>
                </div>
                <div ref={titleRef}>
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
                  <div ref={difficultyRef} className="space-y-1.5">
                    <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                      Difficulty <span className="text-red-500">*</span>
                    </label>
                    <Select
                      value={form.difficulty}
                      onValueChange={(v) =>
                        setForm((p) => ({ ...p, difficulty: v as any }))
                      }>
                      <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="easy">Easy</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="hard">Hard</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.difficulty && (
                      <p className="text-[12px] text-red-500">
                        {formErrors.difficulty}
                      </p>
                    )}
                  </div>
                </div>
                <div ref={contentRef}>
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

              {/* ── Scoring ── */}
              <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
                    <Target className="h-4 w-4 text-[#f6b60b]" />
                  </div>
                  <div>
                    <h3
                      className="font-extrabold text-[15px] text-gray-900 dark:text-white"
                      style={{ letterSpacing: "-0.01em" }}>
                      Scoring Configuration
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Set the total weight and reward points
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div ref={maxScoreRef} className="space-y-1">
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
                    <p className="text-[12px] text-gray-400 dark:text-gray-600">
                      Total weight of the assignment
                    </p>
                  </div>
                  <div ref={minimumScoreRef} className="space-y-1">
                    <InputForm
                      name="minimum_score"
                      text="Minimum Score"
                      type="number"
                      value={form.minimum_score}
                      handleChange={handleChange}
                      error={
                        formErrors.minimum_score ??
                        getFieldError(
                          storeChallenge.error?.errors,
                          "minimum_score",
                        )
                      }
                    />
                    <p className="text-[12px] text-gray-400 dark:text-gray-600">
                      Required to pass
                    </p>
                  </div>
                  <div ref={pointsRef} className="space-y-1">
                    <InputForm
                      name="points"
                      text="Points (EXP)"
                      type="number"
                      value={form.points}
                      handleChange={handleChange}
                      isDisabled
                      error={
                        formErrors.points ??
                        getFieldError(storeChallenge.error?.errors, "points")
                      }
                    />
                    <p className="text-[12px] text-gray-400 dark:text-gray-600">
                      Auto-calculated from difficulty
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Attempt Settings ── */}
              <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#31c7c8]/10 flex items-center justify-center">
                    <RotateCw className="h-4 w-4 text-[#31c7c8]" />
                  </div>
                  <div>
                    <h3
                      className="font-extrabold text-[15px] text-gray-900 dark:text-white"
                      style={{ letterSpacing: "-0.01em" }}>
                      Attempt Settings
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Configure how many times students can submit
                    </p>
                  </div>
                </div>
                <div className="max-w-md space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="unlimited-attempts-coding"
                      checked={isUnlimitedAttempts}
                      onCheckedChange={(checked) =>
                        setIsUnlimitedAttempts(checked === true)
                      }
                    />
                    <label
                      htmlFor="unlimited-attempts-coding"
                      className="text-[14px] font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                      Unlimited attempts
                    </label>
                  </div>
                  <div ref={allowedAttemptsRef} className="space-y-1">
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
                    <p className="text-[12px] text-gray-400 dark:text-gray-600">
                      Number of attempts (minimum: 1)
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Starter File ── */}
              <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-5">
                <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                  <div className="w-8 h-8 rounded-full bg-[#2548d8]/10 flex items-center justify-center">
                    <Code2 className="h-4 w-4 text-[#2548d8]" />
                  </div>
                  <div>
                    <h3
                      className="font-extrabold text-[15px] text-gray-900 dark:text-white"
                      style={{ letterSpacing: "-0.01em" }}>
                      Starter File{" "}
                      <span className="text-[13px] font-normal text-gray-400 dark:text-gray-600">
                        (optional)
                      </span>
                    </h3>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">
                      Upload a starter file or example (max 50MB)
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
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="flex items-center gap-2 bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-700 dark:text-gray-300 font-bold rounded-xl py-2.5 px-4 text-[13px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 transition-all">
                    <Upload className="h-4 w-4" /> Choose File
                  </button>
                ) : (
                  <div className="flex items-center gap-3 rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3">
                    <div className="w-8 h-8 rounded-full bg-[#2548d8]/10 flex items-center justify-center shrink-0">
                      <FileText className="h-4 w-4 text-[#2548d8]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-[14px] text-gray-900 dark:text-white truncate">
                        {selectedFile.name}
                      </p>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400 tabular-nums">
                        {formatFileSize(selectedFile.size)}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      disabled={isProcessing}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-400 dark:text-gray-600 hover:bg-gray-100 dark:hover:bg-white/10 hover:text-red-500 disabled:opacity-40 transition-colors">
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}

                {fileError && (
                  <div className="flex items-start gap-2.5 rounded-xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 px-4 py-3">
                    <AlertCircle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
                    <p className="text-[13px] text-red-600 dark:text-red-400">
                      {fileError}
                    </p>
                  </div>
                )}

                {isUploading && (
                  <div className="flex items-center gap-2 text-[13px] text-[#1c81ff]">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    Uploading attachment, please wait…
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Fixed footer */}
          <div className="shrink-0 border-t border-gray-100 dark:border-white/5 px-6 py-4 bg-white dark:bg-[#0b1215]">
            <LoadingButton
              text={
                isUploading
                  ? "Uploading attachment…"
                  : storeChallenge.isPending
                    ? "Creating…"
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
