import { Alert, AlertDescription } from "@/components/ui/alert";
import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { RichEditor } from "@/components/custom/rich-editor";
import { useStoreLesson, useAddLessonAttachment } from "@/hooks/lessons";
import { useGetModule } from "@/hooks/modules";
import { generateSlug, getFieldError } from "@/utils/global";
import { useState } from "react";
import type { Route } from "./+types/create";
import { FormPageSkeleton } from "@/components/skeletons/form-page";
import { Link } from "react-router";
import { ArrowLeft, Paperclip, X } from "lucide-react";

const ATTACHMENT_TYPES = ["material", "reference", "download", "slides", "document"] as const;
type AttachmentType = typeof ATTACHMENT_TYPES[number];

export default function CreatePage({ params }: Route.ComponentProps) {
  const { module, loading, error } = useGetModule(params.slug!);
  const storeLesson = useStoreLesson();
  const addAttachment = useAddLessonAttachment();
  const [editorResetKey, setEditorResetKey] = useState(0);

  const [form, setForm] = useState({ title: "", slug: "", content: "", video_url: "", order: "" });
  const [editorContent, setEditorContent] = useState("");
  const [preparedAttachments, setPreparedAttachments] = useState<
    Array<{ file: File; title: string; type: AttachmentType; description: string }>
  >([]);
  const [attachmentForm, setAttachmentForm] = useState<{
    file: File | null; title: string; type: AttachmentType; description: string;
  }>({ file: null, title: "", type: "material", description: "" });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAttachmentFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAttachmentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handlePrepareAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentForm.file || !attachmentForm.title) return;
    setPreparedAttachments((prev) => [...prev, { file: attachmentForm.file!, title: attachmentForm.title, type: attachmentForm.type, description: attachmentForm.description }]);
    setAttachmentForm({ file: null, title: "", type: "material", description: "" });
    const fileInput = document.getElementById("attachment-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!module) return;
    storeLesson.mutate(
      { title: form.title, content: editorContent || form.content, slug: form.slug || generateSlug(form.title), video_url: form.video_url || null, order: Number.parseInt(form.order, 10), module_id: module.id },
      {
        onSuccess: (data) => {
          if (preparedAttachments.length > 0 && data.slug) {
            preparedAttachments.forEach((a) => addAttachment.mutate({ lessonSlug: data.slug, file: a.file, title: a.title, type: a.type, description: a.description || undefined }));
          }
          setForm({ title: "", slug: "", content: "", video_url: "", order: "" });
          setEditorContent("");
          setPreparedAttachments([]);
          setEditorResetKey((prev) => prev + 1);
        },
      }
    );
  };

  if (loading) return <FormPageSkeleton />;
  if (error) return <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6"><p className="text-[15px] text-red-600 dark:text-red-400">Error: {error.message}</p></div>;
  if (!module) return <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-10 text-center"><p className="text-[15px] text-gray-500 dark:text-gray-400">Module not found.</p></div>;

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          to={`/${module.slug}/lessons`}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to {module.title}
        </Link>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">
          New Lesson
        </p>
        <h1
          className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight"
          style={{ letterSpacing: "-0.02em" }}
        >
          Create Lesson
        </h1>
        <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mt-1">
          Adding to <span className="font-bold text-gray-700 dark:text-gray-300">{module.title}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error banner */}
        {storeLesson.error && storeLesson.error.message !== "Validation errors" && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
            <p className="text-[14px] text-red-600 dark:text-red-400">
              {storeLesson.error.message ?? "An unknown error occurred."}
            </p>
          </div>
        )}

        {/* Main fields card */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
          <h2 className="font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>
            Lesson Details
          </h2>
          <InputForm name="title" text="Lesson Title" type="text" value={form.title} handleChange={handleChange} error={getFieldError(storeLesson.error?.errors, "title")} />
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Lesson Content</label>
            <RichEditor key={editorResetKey} onSerializedChange={(s) => setEditorContent(JSON.stringify(s))} />
            {getFieldError(storeLesson.error?.errors, "content") && (
              <p className="text-[13px] text-red-500">{getFieldError(storeLesson.error?.errors, "content")}</p>
            )}
          </div>
          <InputForm name="video_url" text="Video URL" type="url" value={form.video_url} handleChange={handleChange} error={getFieldError(storeLesson.error?.errors, "video_url")} />
          <InputForm name="order" text="Lesson Order" type="number" value={form.order} handleChange={handleChange} error={getFieldError(storeLesson.error?.errors, "order")} />
        </div>

        {/* Attachments card */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
              <Paperclip className="h-3.5 w-3.5 text-[#1c81ff]" />
            </div>
            <h2 className="font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>
              Attachments <span className="text-[13px] font-bold text-gray-400 dark:text-gray-600">(optional)</span>
            </h2>
          </div>

          {/* Prepared list */}
          {preparedAttachments.length > 0 && (
            <div className="space-y-2">
              {preparedAttachments.map((a, i) => (
                <div key={i} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3">
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">{a.title}</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">{a.file.name} · {a.type}</p>
                  </div>
                  <button type="button" onClick={() => setPreparedAttachments((prev) => prev.filter((_, j) => j !== i))} className="text-red-500 hover:text-red-600 transition-colors">
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add attachment form */}
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-4 space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="attachment-file" className="text-[13px] font-bold text-gray-700 dark:text-gray-300">File</label>
              <input id="attachment-file" type="file" onChange={(e) => setAttachmentForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                className="block w-full text-[13px] text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none" />
            </div>
            <InputForm name="title" text="Attachment Title" type="text" value={attachmentForm.title} handleChange={handleAttachmentFormChange} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="attachment-type" className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Type</label>
              <select id="attachment-type" name="type" value={attachmentForm.type} onChange={handleAttachmentFormChange}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-white focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all">
                {ATTACHMENT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <InputForm name="description" text="Description (Optional)" type="text" value={attachmentForm.description} handleChange={handleAttachmentFormChange} />
            <button type="button" onClick={handlePrepareAttachment} disabled={!attachmentForm.file || !attachmentForm.title}
              className="w-full bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl py-2.5 text-[14px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Add to Queue
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <LoadingButton text="Create Lesson" loading={storeLesson.isPending} />
        </div>
      </form>
    </div>
  );
}
