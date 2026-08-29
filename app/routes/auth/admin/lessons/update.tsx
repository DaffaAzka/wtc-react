import { useGetLesson, useUpdateLesson, useAddLessonAttachment, useDeleteLessonAttachment } from "@/hooks/lessons";
import type { Route } from "./+types/update";
import { FormPageSkeleton } from "@/components/skeletons/form-page";
import type { SerializedEditorState } from "lexical";
import { useEffect, useState } from "react";
import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { RichEditor } from "@/components/custom/rich-editor";
import { buildInitialEditorState, getFieldError } from "@/utils/global";
import { Link } from "react-router";
import { ArrowLeft, Paperclip, Trash2 } from "lucide-react";
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

const ATTACHMENT_TYPES = ["material", "reference", "download", "slides", "document"] as const;
type AttachmentType = typeof ATTACHMENT_TYPES[number];

export default function UpdatePage({ params }: Route.ComponentProps) {
  const { lesson, error, loading, refresh } = useGetLesson(params.lessonSlug);
  const updateLesson = useUpdateLesson();
  const addAttachment = useAddLessonAttachment();
  const deleteAttachment = useDeleteLessonAttachment();

  const [editorResetKey, setEditorResetKey] = useState(0);
  const [editorInitialState, setEditorInitialState] = useState<SerializedEditorState | undefined>(undefined);
  const [form, setForm] = useState({ title: "", slug: "", content: "", video_url: "", module_id: "" });
  const [editorContent, setEditorContent] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [attachmentForm, setAttachmentForm] = useState<{
    file: File | null; title: string; type: AttachmentType; description: string;
  }>({ file: null, title: "", type: "material", description: "" });

  useEffect(() => {
    if (!lesson) return;
    setForm({ title: lesson.title, slug: lesson.slug, content: lesson.content, video_url: lesson.video_url ?? "", module_id: String(lesson.module_id) });
    setEditorContent("");
    setEditorInitialState(buildInitialEditorState(lesson.content));
    setEditorResetKey((prev) => prev + 1);
  }, [lesson]);

  if (loading) return <FormPageSkeleton />;
  if (error) return <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-6"><p className="text-[15px] text-red-600 dark:text-red-400">Error: {error.message}</p></div>;
  if (!lesson) return <div className="rounded-2xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 p-10 text-center"><p className="text-[15px] text-gray-500 dark:text-gray-400">Lesson not found.</p></div>;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleAttachmentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setAttachmentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    updateLesson.mutate(
      { id: lesson.id, title: form.title, slug: lesson.slug, content: editorContent || form.content, video_url: form.video_url || null, module_id: lesson.module_id, order: lesson.order },
      {
        onSuccess: () => {
          refresh();
          setEditorContent("");
          setEditorResetKey((prev) => prev + 1);
        },
      }
    );
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!attachmentForm.file || !attachmentForm.title) return;
    addAttachment.mutate(
      { lessonSlug: lesson.slug, file: attachmentForm.file, title: attachmentForm.title, type: attachmentForm.type, description: attachmentForm.description || undefined },
      {
        onSuccess: () => {
          setAttachmentForm({ file: null, title: "", type: "material", description: "" });
          const fileInput = document.getElementById("attachment-file") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
          refresh();
        },
      }
    );
  };

  const handleConfirmDelete = () => {
    if (!deleteTarget) return;
    deleteAttachment.mutate({ lessonSlug: lesson.slug, attachmentId: deleteTarget }, { onSuccess: () => { refresh(); setDeleteTarget(null); } });
  };

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Header */}
      <div>
        <Link
          to={`/${lesson.slug}/lessons`}
          className="inline-flex items-center gap-1.5 text-[13px] font-bold text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to Lessons
        </Link>
        <p className="text-[12px] font-bold uppercase tracking-[0.15em] text-[#1c81ff] mb-2">Edit Lesson</p>
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white leading-tight" style={{ letterSpacing: "-0.02em" }}>
          {lesson.title}
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Error banner */}
        {updateLesson.error && updateLesson.error.message !== "Validation errors" && (
          <div className="rounded-2xl bg-red-50 dark:bg-red-500/5 border border-red-200 dark:border-red-500/20 p-4">
            <p className="text-[14px] text-red-600 dark:text-red-400">{updateLesson.error.message ?? "An unknown error occurred."}</p>
          </div>
        )}

        {/* Main fields */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
          <h2 className="font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Lesson Details</h2>
          <InputForm name="title" text="Lesson Title" type="text" value={form.title} handleChange={handleChange} error={getFieldError(updateLesson.error?.errors, "title")} />
          <div className="flex flex-col gap-2">
            <label className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Lesson Content</label>
            <RichEditor key={editorResetKey} editorSerializedState={editorInitialState} onSerializedChange={(s) => setEditorContent(JSON.stringify(s))} />
            {getFieldError(updateLesson.error?.errors, "content") && (
              <p className="text-[13px] text-red-500">{getFieldError(updateLesson.error?.errors, "content")}</p>
            )}
          </div>
          <InputForm name="video_url" text="Video URL" type="url" value={form.video_url ?? ""} handleChange={handleChange} error={getFieldError(updateLesson.error?.errors, "video_url")} />
        </div>

        {/* Attachments */}
        <div className="rounded-2xl bg-white border border-gray-200 dark:bg-[#0b1215] dark:border-white/10 shadow-sm p-6 space-y-5">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
              <Paperclip className="h-3.5 w-3.5 text-[#1c81ff]" />
            </div>
            <h2 className="font-extrabold text-gray-900 dark:text-white" style={{ letterSpacing: "-0.01em" }}>Attachments</h2>
          </div>

          {/* Existing attachments */}
          {lesson.attachments && lesson.attachments.length > 0 && (
            <div className="space-y-2">
              <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em]">Existing</p>
              {lesson.attachments.map((att: any) => (
                <div key={att.id} className="flex items-center justify-between rounded-xl bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 px-4 py-3 group">
                  <div>
                    <p className="text-[14px] font-bold text-gray-900 dark:text-white">{att.title}</p>
                    <p className="text-[12px] text-gray-500 dark:text-gray-400">{att.type} · {new Date(att.created_at).toLocaleDateString()}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setDeleteTarget(att.id)}
                    disabled={deleteAttachment.isPending && deleteTarget === att.id}
                    className="flex items-center gap-1.5 text-[13px] font-bold text-red-500 hover:text-red-600 opacity-0 group-hover:opacity-100 disabled:opacity-40 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Delete
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add new attachment */}
          <div className="rounded-xl border border-dashed border-gray-200 dark:border-white/10 p-4 space-y-4">
            <p className="text-[13px] font-bold text-gray-500 dark:text-gray-400 uppercase tracking-[0.1em]">Add New</p>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="attachment-file" className="text-[13px] font-bold text-gray-700 dark:text-gray-300">File</label>
              <input id="attachment-file" type="file" onChange={(e) => setAttachmentForm((prev) => ({ ...prev, file: e.target.files?.[0] || null }))}
                className="block w-full text-[13px] text-gray-700 dark:text-gray-300 bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 rounded-xl px-3 py-2.5 cursor-pointer focus:outline-none" />
            </div>
            <InputForm name="title" text="Attachment Title" type="text" value={attachmentForm.title} handleChange={handleAttachmentChange} />
            <div className="flex flex-col gap-1.5">
              <label htmlFor="attachment-type" className="text-[13px] font-bold text-gray-700 dark:text-gray-300">Type</label>
              <select id="attachment-type" name="type" value={attachmentForm.type} onChange={handleAttachmentChange}
                className="w-full rounded-xl bg-slate-50 dark:bg-[#1a1a1a] border border-slate-200 dark:border-gray-800 px-4 py-3 text-[14px] text-gray-900 dark:text-white focus:border-[#1c81ff] focus:ring-1 focus:ring-[#1c81ff] outline-none transition-all">
                {ATTACHMENT_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
              </select>
            </div>
            <InputForm name="description" text="Description (Optional)" type="text" value={attachmentForm.description} handleChange={handleAttachmentChange} />
            <button type="button" onClick={handleAddAttachment} disabled={!attachmentForm.file || !attachmentForm.title || addAttachment.isPending}
              className="w-full bg-transparent border-[1.5px] border-gray-200 dark:border-white/20 text-gray-900 dark:text-white font-bold rounded-xl py-2.5 text-[14px] hover:bg-gray-50 dark:hover:bg-white/5 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              {addAttachment.isPending ? "Uploading…" : "Add Attachment"}
            </button>
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end">
          <LoadingButton text="Update Lesson" loading={updateLesson.isPending} />
        </div>
      </form>

      {/* Confirm delete dialog */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
              Delete attachment?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-[15px] text-gray-500 dark:text-gray-400">
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl border-[1.5px] border-gray-200 dark:border-white/20 font-bold">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete} disabled={deleteAttachment.isPending}
              className="bg-red-500 text-white font-bold rounded-xl hover:bg-red-600 transition-colors">
              {deleteAttachment.isPending ? "Deleting…" : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
