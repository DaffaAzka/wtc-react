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
import { useUpdateChallenge } from "@/hooks/challenges";
import type { Challenge } from "@/types/model";
import type { ChallengeFormType } from "@/types/challenge";
import type { ChallengeContext } from "./challenge-manager";
import { getFieldError } from "@/utils/global";
import { useState, useEffect, useRef, useMemo } from "react";
import { calculateQuestionScore } from "@/helper/calculate-score";
import { validateAllQuestions } from "@/helper/validate-question";
import {
  CheckCircle2,
  Info,
  Target,
  RotateCw,
  HelpCircle,
  Loader2,
} from "lucide-react";

type Props = {
  challenge: Challenge;
  context: ChallengeContext;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

const EDIT_STORAGE_KEY = (challengeId: number) =>
  `challenge-edit-draft-${challengeId}`;

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
    title: challenge.title,
    type: challenge.type as ChallengeFormType,
    difficulty: challenge.difficulty || "",
    content: challenge.content,
    max_score: String(challenge.max_score),
    minimum_score: "0",
    points: challenge.points ? String(challenge.points) : "",
    allowed_attempts: challenge.allowed_attempts ? String(challenge.allowed_attempts) : "1",
  });

  const [isUnlimitedAttempts, setIsUnlimitedAttempts] = useState(challenge.allowed_attempts === null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<{
    title?: string; difficulty?: string; content?: string;
    max_score?: string; minimum_score?: string; points?: string; allowed_attempts?: string;
  }>({});
  const [saving, setSaving] = useState(false);
  const [pendingTypeChange, setPendingTypeChange] = useState<ChallengeFormType | null>(null);

  const debouncedForm = useDebounce(form);
  const debouncedQuestions = useDebounce(questions);
  const [readyToSave, setReadyToSave] = useState(false);
  const [originalState, setOriginalState] = useState<{ form: typeof form; questions: Question[] } | null>(null);

  const titleRef = useRef<HTMLDivElement>(null);
  const difficultyRef = useRef<HTMLDivElement>(null);
  const maxScoreRef = useRef<HTMLDivElement>(null);
  const minimumScoreRef = useRef<HTMLDivElement>(null);
  const pointsRef = useRef<HTMLDivElement>(null);
  const allowedAttemptsRef = useRef<HTMLDivElement>(null);
  const descriptionRef = useRef<HTMLDivElement>(null);

  const hasUnsavedChanges = useMemo(() => {
    if (!originalState) return false;
    return JSON.stringify({ form, questions }) !== JSON.stringify(originalState);
  }, [form, questions, originalState]);

  useEffect(() => {
    if (!isOpen) return;
    setReadyToSave(false);

    const draft = localStorage.getItem(EDIT_STORAGE_KEY(challenge.id));
    const existingQuestions = challenge.metadata?.questions ?? [];
    const initialForm = {
      title: challenge.title,
      type: challenge.type === "quiz_group" ? "mixed" : (challenge.type as ChallengeFormType),
      difficulty: (challenge.difficulty as "" | "easy" | "medium" | "hard") || "",
      content: challenge.content,
      max_score: String(challenge.max_score),
      minimum_score: challenge.settings?.minimum_score !== undefined ? String(challenge.settings.minimum_score) : "0",
      points: challenge.points ? String(challenge.points) : "",
      allowed_attempts: challenge.allowed_attempts ? String(challenge.allowed_attempts) : "1",
    };

    if (draft) {
      try {
        const parsed = JSON.parse(draft);
        setForm({ ...parsed.form, minimum_score: parsed.form.minimum_score ?? "0" });
        setQuestions(parsed.questions ?? []);
        setIsUnlimitedAttempts(parsed.isUnlimitedAttempts ?? (challenge.allowed_attempts === null));
        setOriginalState({ form: initialForm, questions: existingQuestions });
        toast("Draft restored");
        setReadyToSave(true);
        return;
      } catch {
        setIsUnlimitedAttempts(challenge.allowed_attempts === null);
      }
    }

    setForm(initialForm);
    setQuestions(existingQuestions);
    setIsUnlimitedAttempts(challenge.allowed_attempts === null);
    setOriginalState({ form: initialForm, questions: existingQuestions });
    setReadyToSave(true);
  }, [isOpen, challenge]);

  useEffect(() => {
    if (!isOpen || !readyToSave) return;
    setSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem(EDIT_STORAGE_KEY(challenge.id),
        JSON.stringify({ form: debouncedForm, questions: debouncedQuestions, isUnlimitedAttempts }));
      setSaving(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedForm, debouncedQuestions, isUnlimitedAttempts, challenge.id, readyToSave, isOpen]);

  useEffect(() => {
    if (!readyToSave || !form.max_score || questions.length === 0) return;
    const maxScore = Number(form.max_score);
    if (maxScore <= 0 || isNaN(maxScore)) return;
    const mcqCount   = questions.filter((q) => q.type === "multiple_choice").length;
    const essayCount = questions.filter((q) => q.type === "essay").length;
    const firstQuestion = questions[0];
    const expectedScore = calculateQuestionScore(firstQuestion.type, maxScore, mcqCount, essayCount, form.type);
    if (Math.abs(firstQuestion.score - expectedScore) < 0.001) return;
    setQuestions(questions.map((q) => ({ ...q, score: calculateQuestionScore(q.type, maxScore, mcqCount, essayCount, form.type) })));
  }, [form.max_score, questions.length, form.type, readyToSave]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const validateQuestions = () => {
    const errors = validateAllQuestions(questions, form.type);
    setQuestionErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const errors: typeof formErrors = {};
    if (!form.title.trim())          errors.title = "Challenge title is required.";
    if (!form.difficulty)            errors.difficulty = "Difficulty is required.";
    if (!form.max_score.trim())      errors.max_score = "Max Score is required.";
    else if (Number(form.max_score) < 1) errors.max_score = "Max Score must be at least 1.";
    if (!form.minimum_score.trim())  errors.minimum_score = "Minimum Score is required.";
    else if (Number(form.minimum_score) < 0) errors.minimum_score = "Minimum Score cannot be negative.";
    else if (Number(form.minimum_score) > Number(form.max_score)) errors.minimum_score = "Minimum Score cannot exceed Max Score.";
    if (!form.points.trim())         errors.points = "Points is required.";
    else if (Number(form.points) < 0) errors.points = "Points must be at least 0.";
    if (!isUnlimitedAttempts) {
      if (!form.allowed_attempts.trim()) errors.allowed_attempts = "Allowed Attempts is required.";
      else if (Number(form.allowed_attempts) < 1) errors.allowed_attempts = "Must be at least 1.";
      else if (!Number.isInteger(Number(form.allowed_attempts))) errors.allowed_attempts = "Must be an integer.";
    }
    if (!form.content.trim()) errors.content = "Description is required.";
    setFormErrors(errors);

    if (errors.title)            { titleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.difficulty)       { difficultyRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.max_score)        { maxScoreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.minimum_score)    { minimumScoreRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.points)           { pointsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.allowed_attempts) { allowedAttemptsRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (errors.content)          { descriptionRef.current?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (questions.length === 0)  { toast.error("Please add at least one question."); return; }
    if (!validateQuestions())    { toast.error("Please fix all validation errors before submitting."); return; }

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
        content: form.content,
        settings: { ...challenge.settings, minimum_score: Number(form.minimum_score) },
        metadata: { ...challenge.metadata, questions },
        max_score: Number(form.max_score),
        points: Number(form.points),
        allowed_attempts: isUnlimitedAttempts ? null : Number(form.allowed_attempts),
      },
      {
        onSuccess: () => {
          localStorage.removeItem(EDIT_STORAGE_KEY(challenge.id));
          setOriginalState({ form, questions });
          onOpenChange(false);
          toast.success("Challenge updated successfully");
        },
      },
    );
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent
          className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10"
          onEscapeKeyDown={undefined}
          onPointerDownOutside={undefined}
        >
          {/* Fixed header */}
          <DialogHeader className="shrink-0 border-b border-gray-100 dark:border-white/5 px-6 pt-6 pb-4 bg-white dark:bg-[#0b1215]">
            <div className="flex items-start justify-between gap-4">
              <div className="space-y-2">
                <DialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
                  Edit Challenge
                </DialogTitle>
                <DialogDescription asChild>
                  <span className="inline-flex items-center rounded-full bg-[#1c81ff]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1c81ff]">
                    {context.type === "lesson" ? "Lesson" : "Module"}: {context.title}
                  </span>
                </DialogDescription>
              </div>

              {/* Status indicators */}
              <div className="flex items-center gap-3 shrink-0">
                {hasUnsavedChanges && !saving && (
                  <span className="text-[12px] font-bold text-[#f6b60b]">Unsaved changes</span>
                )}
                {saving ? (
                  <span className="flex items-center gap-1.5 text-[12px] text-[#f6b60b]">
                    <Loader2 className="h-3 w-3 animate-spin" /> Saving…
                  </span>
                ) : (
                  <span className="flex items-center gap-1.5 text-[12px] text-[#00E676]">
                    <CheckCircle2 className="h-3 w-3" /> Saved
                  </span>
                )}
              </div>
            </div>

            {/* Meta */}
            <div className="mt-3 flex items-center gap-4">
              <div className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400">
                <span>Questions:</span>
                <span className="font-bold text-gray-900 dark:text-white">{questions.length}</span>
              </div>
              <div className="flex items-center gap-1.5 text-[13px] text-gray-500 dark:text-gray-400">
                <span>Slug:</span>
                <code className="font-mono text-[12px] rounded-lg bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-2 py-0.5 text-gray-500 dark:text-gray-400">
                  {challenge.slug}
                </code>
              </div>
            </div>
          </DialogHeader>

          {/* Form */}
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto px-6 bg-gray-50 dark:bg-[#0d1117]">
              <div className="flex flex-col gap-6 py-6">
                {/* Server error */}
                {updateChallenge.error && updateChallenge.error.message !== "Validation errors" && (
                  <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
                    <p className="text-[14px] text-red-600 dark:text-red-400">{updateChallenge.error.message}</p>
                  </div>
                )}

                {/* ── Challenge Information ── */}
                <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
                      <Info className="h-4 w-4 text-[#1c81ff]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Challenge Information</h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400">Basic details about the challenge</p>
                    </div>
                  </div>

                  <div ref={titleRef}>
                    <InputForm name="title" text="Challenge Title" type="text" value={form.title} handleChange={handleChange}
                      error={formErrors.title ?? getFieldError(updateChallenge.error?.errors, "title")} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div ref={difficultyRef} className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                        Difficulty <span className="text-red-500">*</span>
                      </label>
                      <Select value={form.difficulty || undefined}
                        onValueChange={(v) => { setForm((p) => ({ ...p, difficulty: v as any })); setFormErrors((p) => ({ ...p, difficulty: undefined })); }}>
                        <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                          <SelectValue placeholder="Select difficulty" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="easy">Easy</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="hard">Hard</SelectItem>
                        </SelectContent>
                      </Select>
                      {formErrors.difficulty && <p className="text-[12px] text-red-500">{formErrors.difficulty}</p>}
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300 block">
                        Challenge Type <span className="text-red-500">*</span>
                      </label>
                      <Select value={form.type}
                        onValueChange={(v) => {
                          const newType = v as ChallengeFormType;
                          if (questions.length > 0 && newType !== form.type) setPendingTypeChange(newType);
                          else setForm((p) => ({ ...p, type: newType }));
                        }}>
                        <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                          <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                          <SelectItem value="essay">Essay</SelectItem>
                          <SelectItem value="mixed">Mixed Quiz</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div ref={descriptionRef}>
                    <TextareaForm name="content" text="Description" value={form.content} handleChange={handleChange}
                      error={formErrors.content ?? getFieldError(updateChallenge.error?.errors, "content")} />
                  </div>
                </div>

                {/* ── Scoring ── */}
                <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#f6b60b]/10 flex items-center justify-center">
                      <Target className="h-4 w-4 text-[#f6b60b]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Scoring Configuration</h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400">Set the total weight and reward points</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div ref={maxScoreRef} className="space-y-1">
                      <InputForm name="max_score" text="Max Score" type="number" value={form.max_score} handleChange={handleChange}
                        error={formErrors.max_score ?? getFieldError(updateChallenge.error?.errors, "max_score")} />
                      <p className="text-[12px] text-gray-400 dark:text-gray-600">Distributed across questions</p>
                    </div>
                    <div ref={minimumScoreRef} className="space-y-1">
                      <InputForm name="minimum_score" text="Minimum Score" type="number" value={form.minimum_score} handleChange={handleChange}
                        error={formErrors.minimum_score ?? getFieldError(updateChallenge.error?.errors, "minimum_score")} />
                      <p className="text-[12px] text-gray-400 dark:text-gray-600">Required to pass</p>
                    </div>
                    <div ref={pointsRef} className="space-y-1">
                      <InputForm name="points" text="Points (EXP)" type="number" value={form.points} handleChange={handleChange}
                        error={formErrors.points ?? getFieldError(updateChallenge.error?.errors, "points")} />
                      <p className="text-[12px] text-gray-400 dark:text-gray-600">Reward upon completion</p>
                    </div>
                  </div>

                  {questions.length > 0 && (
                    <ScoringSummary type={form.type} maxScore={Number(form.max_score)} questions={questions} />
                  )}
                </div>

                {/* ── Attempt Settings ── */}
                <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#31c7c8]/10 flex items-center justify-center">
                      <RotateCw className="h-4 w-4 text-[#31c7c8]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Attempt Settings</h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400">Configure how many times students can attempt</p>
                    </div>
                  </div>
                  <div className="max-w-md space-y-4">
                    <div className="flex items-center gap-2">
                      <Checkbox id="unlimited-attempts-edit" checked={isUnlimitedAttempts}
                        onCheckedChange={(checked) => setIsUnlimitedAttempts(checked === true)} />
                      <label htmlFor="unlimited-attempts-edit" className="text-[14px] font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                        Unlimited attempts
                      </label>
                    </div>
                    <div ref={allowedAttemptsRef} className="space-y-1">
                      <InputForm name="allowed_attempts" text="Allowed Attempts" type="number"
                        value={isUnlimitedAttempts ? "" : form.allowed_attempts}
                        handleChange={handleChange} isDisabled={isUnlimitedAttempts}
                        placeholder={isUnlimitedAttempts ? "Unlimited" : ""}
                        error={formErrors.allowed_attempts ?? getFieldError(updateChallenge.error?.errors, "allowed_attempts")} />
                      <p className="text-[12px] text-gray-400 dark:text-gray-600">Number of attempts (minimum: 1)</p>
                    </div>
                  </div>
                </div>

                {/* ── Question Builder ── */}
                <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-5 space-y-5">
                  <div className="flex items-center gap-3 pb-3 border-b border-gray-100 dark:border-white/5">
                    <div className="w-8 h-8 rounded-full bg-[#2548d8]/10 flex items-center justify-center">
                      <HelpCircle className="h-4 w-4 text-[#2548d8]" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Question Builder</h3>
                      <p className="text-[12px] text-gray-500 dark:text-gray-400">Edit questions for this challenge</p>
                    </div>
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
              </div>
            </div>

            {/* Fixed footer */}
            <div className="shrink-0 border-t border-gray-100 dark:border-white/5 px-6 py-4 bg-white dark:bg-[#0b1215]">
              <LoadingButton
                text="Update Challenge"
                loading={updateChallenge.isPending}
                disabled={!hasUnsavedChanges || updateChallenge.isPending}
              />
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Type change confirmation */}
      <AlertDialog open={pendingTypeChange !== null} onOpenChange={(open) => { if (!open) setPendingTypeChange(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
              Change Challenge Type?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-gray-500 dark:text-gray-400">
              Changing the challenge type will delete all{" "}
              <span className="font-bold text-gray-900 dark:text-white">{questions.length}</span>{" "}
              existing {questions.length !== 1 ? "questions" : "question"}. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPendingTypeChange(null)} className="rounded-xl border-[1.5px] border-gray-200 dark:border-white/20 font-bold">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors"
              onClick={() => {
                if (pendingTypeChange) {
                  setForm((prev) => ({ ...prev, type: pendingTypeChange }));
                  setQuestions([]);
                  setQuestionErrors({});
                  setPendingTypeChange(null);
                }
              }}
            >
              Change Type &amp; Delete Questions
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
