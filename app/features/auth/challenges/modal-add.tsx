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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
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
  Loader2,
} from "lucide-react";

type Props = {
  context: ChallengeContext;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  prefill?: GeneratedChallenge;
};

const STORAGE_KEY = (contextId: number, contextType: "lesson" | "module") =>
  `challenge-draft-${contextType}-${contextId}`;

const SECTION_ICONS = [
  { icon: Info,       bg: "bg-[#1c81ff]/10",  color: "text-[#1c81ff]"  },
  { icon: Target,     bg: "bg-[#f6b60b]/10",  color: "text-[#f6b60b]"  },
  { icon: RotateCw,   bg: "bg-[#31c7c8]/10",  color: "text-[#31c7c8]"  },
  { icon: HelpCircle, bg: "bg-[#2548d8]/10",  color: "text-[#2548d8]"  },
];

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
  const [questionErrors, setQuestionErrors] = useState<Record<string, string>>({});
  const [formErrors, setFormErrors] = useState<{
    title?: string; difficulty?: string; content?: string;
    max_score?: string; minimum_score?: string; points?: string; allowed_attempts?: string;
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
          : prefill.questions.length === 1
        ? "multiple_choice"
        : "quiz_group";

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

  // Apply prefill from AI generation
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
      setForm({ title: "", type: "multiple_choice", difficulty: "", content: "", max_score: "100", minimum_score: "0", points: "", allowed_attempts: "1" });
      setIsUnlimitedAttempts(false); setQuestions([]); setReadyToSave(true); return;
    }
    try {
      const parsed = JSON.parse(draft);
      setForm({ title: parsed.form.title || "", type: parsed.form.type || "multiple_choice", difficulty: parsed.form.difficulty || "",
        content: parsed.form.content || "", max_score: parsed.form.max_score || "100", minimum_score: parsed.form.minimum_score ?? "0",
        points: parsed.form.points || "", allowed_attempts: parsed.form.allowed_attempts || "1" });
      setIsUnlimitedAttempts(parsed.isUnlimitedAttempts ?? false);
      setQuestions(parsed.questions ?? []);
      toast("Draft restored");
    } catch {
      setForm({ title: "", type: "multiple_choice", difficulty: "", content: "", max_score: "100", minimum_score: "0", points: "", allowed_attempts: "1" });
      setIsUnlimitedAttempts(false); setQuestions([]);
    } finally {
      setReadyToSave(true);
    }
  }, [contextId, isOpen]);

  useEffect(() => {
    if (!isOpen || !readyToSave) return;
    setSaving(true);
    const timer = setTimeout(() => {
      localStorage.setItem(STORAGE_KEY(contextId, contextType),
        JSON.stringify({ form: debouncedForm, questions: debouncedQuestions, isUnlimitedAttempts }));
      setSaving(false);
    }, 300);
    return () => clearTimeout(timer);
  }, [debouncedForm, debouncedQuestions, contextId, readyToSave, isOpen, isUnlimitedAttempts]);

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

    const submissionType =
      form.type === "mixed"    ? "quiz_group"
      : form.type === "essay"  ? "essay"
      : form.type; // multiple_choice → multiple_choice, quiz_group → quiz_group

    storeChallenge.mutate(
      {
        module_id: context.type === "module" ? context.id : null,
        lesson_id: context.type === "lesson" ? context.id : null,
        title: form.title, slug: generateSlug(form.title),
        type: submissionType, difficulty: form.difficulty || undefined,
        content: form.content,
        settings: { minimum_score: Number(form.minimum_score) },
        metadata: { questions },
        max_score: Number(form.max_score),
        points: Number(form.points),
        allowed_attempts: isUnlimitedAttempts ? null : Number(form.allowed_attempts),
      },
      {
        onSuccess: () => {
          localStorage.removeItem(STORAGE_KEY(contextId, contextType));
          setForm({ title: "", type: "multiple_choice", difficulty: "", content: "", max_score: "100", minimum_score: "0", points: "", allowed_attempts: "1" });
          setIsUnlimitedAttempts(false); setQuestions([]);
          onOpenChange(false);
          toast.success("Challenge created successfully");
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] flex flex-col p-0 rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10">
        {/* Fixed header */}
        <DialogHeader className="shrink-0 border-b border-gray-100 dark:border-white/5 px-6 pt-6 pb-4 bg-white dark:bg-[#0b1215]">
          <div className="flex items-start justify-between gap-4">
            <div className="space-y-2">
              <DialogTitle
                className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white"
                style={{ letterSpacing: "-0.02em" }}
              >
                Add Challenge
              </DialogTitle>
              <DialogDescription asChild>
                <span className="inline-flex items-center rounded-full bg-[#1c81ff]/10 px-2.5 py-0.5 text-[11px] font-bold text-[#1c81ff]">
                  {context.type === "lesson" ? "Lesson" : "Module"}: {context.title}
                </span>
              </DialogDescription>
            </div>

            {/* Draft status */}
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

        {/* Scrollable form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
          <div className="flex-1 overflow-y-auto px-6 bg-gray-50 dark:bg-[#0d1117]">
            <div className="flex flex-col gap-6 py-6">
              {/* Server error */}
              {storeChallenge.error && storeChallenge.error.message !== "Validation errors" && (
                <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
                  <p className="text-[14px] text-red-600 dark:text-red-400">{storeChallenge.error.message}</p>
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
                    error={formErrors.title ?? getFieldError(storeChallenge.error?.errors, "title")} />
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
                    <Select value={form.type} onValueChange={(v) => setForm((p) => ({ ...p, type: v as ChallengeFormType }))}>
                      <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="rounded-xl">
                        <SelectItem value="multiple_choice">Multiple Choice</SelectItem>
                        <SelectItem value="quiz_group">Quiz Group</SelectItem>
                        <SelectItem value="essay">Essay</SelectItem>
                        <SelectItem value="mixed">Mixed Quiz</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div ref={descriptionRef}>
                  <TextareaForm name="content" text="Description" value={form.content} handleChange={handleChange}
                    error={formErrors.content ?? getFieldError(storeChallenge.error?.errors, "content")} />
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
                      error={formErrors.max_score ?? getFieldError(storeChallenge.error?.errors, "max_score")} />
                    <p className="text-[12px] text-gray-400 dark:text-gray-600">Total weight (distributed across questions)</p>
                  </div>
                  <div ref={minimumScoreRef} className="space-y-1">
                    <InputForm name="minimum_score" text="Minimum Score" type="number" value={form.minimum_score} handleChange={handleChange}
                      error={formErrors.minimum_score ?? getFieldError(storeChallenge.error?.errors, "minimum_score")} />
                    <p className="text-[12px] text-gray-400 dark:text-gray-600">Minimum score required to pass</p>
                  </div>
                  <div ref={pointsRef} className="space-y-1">
                    <InputForm name="points" text="Points (EXP)" type="number" value={form.points} handleChange={handleChange}
                      isDisabled error={formErrors.points ?? getFieldError(storeChallenge.error?.errors, "points")} />
                    <p className="text-[12px] text-gray-400 dark:text-gray-600">Auto-calculated from difficulty</p>
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
                    <h3 className="font-extrabold text-[15px] text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Attempt Settings</h3>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">Configure how many times students can attempt</p>
                  </div>
                </div>

                <div className="max-w-md space-y-4">
                  <div className="flex items-center gap-2">
                    <Checkbox id="unlimited-attempts" checked={isUnlimitedAttempts}
                      onCheckedChange={(checked) => setIsUnlimitedAttempts(checked === true)} />
                    <label htmlFor="unlimited-attempts" className="text-[14px] font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
                      Unlimited attempts
                    </label>
                  </div>
                  <div ref={allowedAttemptsRef} className="space-y-1">
                    <InputForm name="allowed_attempts" text="Allowed Attempts" type="number"
                      value={isUnlimitedAttempts ? "" : form.allowed_attempts}
                      handleChange={handleChange} isDisabled={isUnlimitedAttempts}
                      placeholder={isUnlimitedAttempts ? "Unlimited" : ""}
                      error={formErrors.allowed_attempts ?? getFieldError(storeChallenge.error?.errors, "allowed_attempts")} />
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
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">Add and configure questions for this challenge</p>
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

          {/* Fixed footer */}
          <div className="shrink-0 border-t border-gray-100 dark:border-white/5 px-6 py-4 bg-white dark:bg-[#0b1215]">
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
