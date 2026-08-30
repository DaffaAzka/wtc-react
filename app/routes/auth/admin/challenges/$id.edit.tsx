import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, Save, Info } from "lucide-react";
import { useGetChallenge, useUpdateChallenge } from "@/hooks/challenges";
import { PageHeaderSkeleton } from "@/components/skeletons/page-header";
import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useState, useEffect } from "react";
import { toast } from "sonner";

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
    points: "",
    allowed_attempts: "",
  });
  const [isUnlimitedAttempts, setIsUnlimitedAttempts] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!challenge) return;
    setForm({
      title: challenge.title || "",
      difficulty: (challenge.difficulty as "" | "easy" | "medium" | "hard") || "",
      content: challenge.content || "",
      max_score: challenge.max_score?.toString() || "100",
      points: challenge.points?.toString() || "",
      allowed_attempts: challenge.allowed_attempts?.toString() || "1",
    });
    setIsUnlimitedAttempts(
      challenge.allowed_attempts === null || challenge.allowed_attempts === -1
    );
  }, [challenge]);

  useEffect(() => {
    if (!form.difficulty) return;
    const map: Record<"easy" | "medium" | "hard", string> = { easy: "10", medium: "20", hard: "30" };
    setForm((prev) => ({ ...prev, points: map[form.difficulty as "easy" | "medium" | "hard"] }));
  }, [form.difficulty]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: undefined }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const errors: Record<string, string> = {};
    if (!form.title.trim()) errors.title = "Title is required.";
    if (!form.difficulty) errors.difficulty = "Difficulty is required.";
    if (!form.content.trim()) errors.content = "Description is required.";
    if (!form.max_score.trim()) errors.max_score = "Max Score is required.";
    else if (Number(form.max_score) < 1) errors.max_score = "Max Score must be at least 1.";
    if (!form.points.trim()) errors.points = "Points is required.";
    else if (Number(form.points) < 0) errors.points = "Points must be at least 0.";
    if (!isUnlimitedAttempts) {
      if (!form.allowed_attempts.trim()) errors.allowed_attempts = "Allowed Attempts is required.";
      else if (Number(form.allowed_attempts) < 1) errors.allowed_attempts = "Allowed Attempts must be at least 1.";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) { toast.error("Please fix the errors before saving."); return; }
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
        onSuccess: () => { toast.success("Challenge updated!"); navigate(`/admin/challenges/${challenge.id}`); },
        onError: (err) => { toast.error(err.message || "Failed to update challenge"); },
      }
    );
  };

  if (loading) return <div className="space-y-6"><PageHeaderSkeleton /><div className="h-96 animate-pulse rounded-2xl bg-gray-100 dark:bg-white/5" /></div>;

  if (error || !challenge) {
    return (
      <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6 flex items-start gap-3">
        <p className="text-[15px] text-red-600 dark:text-red-400">{error?.message || "Challenge not found."}</p>
        <button onClick={() => navigate("/admin/all-challenges")} className="ml-auto text-[13px] font-bold text-red-600 dark:text-red-400 hover:underline whitespace-nowrap">Back to Challenges</button>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl">
      {/* Header */}
      <div>
        <Link
          to={`/admin/challenges/${challenge.id}`}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </Link>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Edit</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
          Edit Challenge
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">{challenge.title}</p>
      </div>

      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-2xl bg-[#1c81ff]/5 border border-[#1c81ff]/15 dark:border-[#1c81ff]/20 p-4">
        <Info className="h-4.5 w-4.5 text-[#1c81ff] shrink-0 mt-0.5" />
        <p className="text-[14px] text-gray-600 dark:text-gray-300">
          This form edits basic properties. To edit questions, attachments, or advanced settings,
          visit the challenge from its lesson or module page.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic info */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
          <h2 className="font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Basic Information</h2>
          <InputForm name="title" text="Title" type="text" value={form.title} handleChange={handleChange} error={formErrors.title} />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">
                Difficulty <span className="text-red-500">*</span>
              </label>
              <Select
                value={form.difficulty}
                onValueChange={(v) => { setForm((p) => ({ ...p, difficulty: v as any })); setFormErrors((p) => ({ ...p, difficulty: undefined })); }}
              >
                <SelectTrigger className="rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border-slate-200 dark:border-gray-800 font-bold focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff]">
                  <SelectValue placeholder="Select difficulty" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="easy">Easy</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="hard">Hard</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.difficulty && <p className="text-[13px] text-red-500">{formErrors.difficulty}</p>}
            </div>
            <div className="space-y-1.5">
              <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Type (Read-only)</label>
              <input type="text" value={challenge.type.replace(/_/g, " ")} disabled
                className="w-full rounded-xl bg-gray-100 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 text-[14px] text-gray-500 dark:text-gray-400 capitalize cursor-not-allowed" />
            </div>
          </div>

          <TextareaForm name="content" text="Description" value={form.content} handleChange={handleChange} error={formErrors.content} />
        </div>

        {/* Scoring */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
          <h2 className="font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Scoring</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <InputForm name="max_score" text="Max Score" type="number" value={form.max_score} handleChange={handleChange} error={formErrors.max_score} />
            <InputForm name="points" text="Points (EXP)" type="number" value={form.points} handleChange={handleChange} isDisabled error={formErrors.points} />
          </div>
          <p className="text-[12px] text-gray-400 dark:text-gray-600">
            Points auto-calculated from difficulty — Easy: 10 · Medium: 20 · Hard: 30
          </p>
        </div>

        {/* Attempt settings */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
          <h2 className="font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Attempt Settings</h2>
          <div className="flex items-center gap-2">
            <Checkbox
              id="unlimited-attempts"
              checked={isUnlimitedAttempts}
              onCheckedChange={(checked) => setIsUnlimitedAttempts(checked === true)}
            />
            <label htmlFor="unlimited-attempts" className="text-[14px] font-bold text-gray-700 dark:text-gray-300 cursor-pointer">
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
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3">
          <button type="button" onClick={() => navigate(`/admin/challenges/${challenge.id}`)}
            className="bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl py-2.5 px-5 text-[14px] hover:bg-gray-50 dark:hover:bg-white/5 transition-all">
            Cancel
          </button>
          <button type="submit" disabled={updateChallenge.isPending}
            className="flex items-center gap-2 bg-[#1c81ff] text-white font-bold rounded-xl py-2.5 px-5 shadow-md shadow-blue-500/20 transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60 disabled:cursor-not-allowed text-[14px]">
            <Save className="h-4 w-4" />
            {updateChallenge.isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
}
