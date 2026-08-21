import { useGetLesson, useUpdateLesson, useAddLessonAttachment, useDeleteLessonAttachment } from "@/hooks/lessons";
import type { Route } from "./+types/update";
import { FormPageSkeleton } from "@/components/skeletons/form-page";
import type { SerializedEditorState } from "lexical";
import { useEffect, useState } from "react";

import { Alert, AlertDescription } from "@/components/ui/alert";
import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { RichEditor } from "@/components/custom/rich-editor";
import { buildInitialEditorState, getFieldError } from "@/utils/global";

export default function UpdatePage({ params }: Route.ComponentProps) {
  const { lesson, error, loading, refresh } = useGetLesson(params.lessonSlug);
  const updateLesson = useUpdateLesson();
  const addAttachment = useAddLessonAttachment();
  const deleteAttachment = useDeleteLessonAttachment();
  const [editorResetKey, setEditorResetKey] = useState(0);
  const [editorInitialState, setEditorInitialState] = useState<
    SerializedEditorState | undefined
  >(undefined);
  const [form, setForm] = useState({
    title: lesson?.title ?? "",
    slug: lesson?.slug ?? "",
    content: lesson?.content ?? "",
    video_url: lesson?.video_url ?? "",
    module_id: lesson?.module_id ?? "",
  });
  const [editorContent, setEditorContent] = useState("");

  const [attachmentForm, setAttachmentForm] = useState<{
    file: File | null;
    title: string;
    type: "material" | "reference" | "download" | "slides" | "document";
    description: string;
  }>({
    file: null,
    title: "",
    type: "material",
    description: "",
  });

  useEffect(() => {
    if (!lesson) return;

    setForm({
      title: lesson.title,
      slug: lesson.slug,
      content: lesson.content,
      video_url: lesson.video_url ?? "",
      module_id: lesson.module_id,
    });
    setEditorContent("");
    setEditorInitialState(buildInitialEditorState(lesson.content));
    setEditorResetKey((prev) => prev + 1);
  }, [lesson]);

  if (loading) return <FormPageSkeleton />;
  if (error) return <p>Error: {error.message}</p>;
  if (!lesson) return <p>Lesson not found.</p>;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateLesson.mutate(
      {
        id: lesson.id,
        title: form.title,
        slug: lesson.slug,
        content: editorContent || form.content,
        video_url: form.video_url || null,
        module_id: lesson.module_id,
        order: lesson.order,
      },
      {
        onSuccess: () => {
          refresh();
          setEditorContent("");
          setEditorResetKey((prev) => prev + 1);
        },
      },
    );
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAttachmentForm((prev) => ({ ...prev, file }));
  };

  const handleAttachmentChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setAttachmentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddAttachment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!lesson || !attachmentForm.file || !attachmentForm.title) return;

    addAttachment.mutate(
      {
        lessonSlug: lesson.slug,
        file: attachmentForm.file,
        title: attachmentForm.title,
        type: attachmentForm.type,
        description: attachmentForm.description || undefined,
      },
      {
        onSuccess: () => {
          setAttachmentForm({
            file: null,
            title: "",
            type: "material",
            description: "",
          });
          const fileInput = document.getElementById("attachment-file") as HTMLInputElement;
          if (fileInput) fileInput.value = "";
          refresh();
        },
      },
    );
  };

  const handleDeleteAttachment = (attachmentId: string) => {
    if (!lesson) return;

    if (window.confirm("Are you sure you want to delete this attachment?")) {
      deleteAttachment.mutate(
        {
          lessonSlug: lesson.slug,
          attachmentId,
        },
        {
          onSuccess: () => {
            refresh();
          },
        },
      );
    }
  };

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Update lesson</h1>
        <p className="text-sm text-muted-foreground">
          Update the lesson details below. Make sure to fill in all required
          fields before submitting the form.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {updateLesson.error &&
          updateLesson.error.message !== "Validation errors" && (
            <Alert variant="destructive" className="bg-red-100">
              <AlertDescription>
                {updateLesson.error.message ?? "An unknown error occurred."}
              </AlertDescription>
            </Alert>
          )}

        <InputForm
          name="title"
          text="Lesson Title"
          type="text"
          value={form.title}
          handleChange={handleChange}
          error={getFieldError(updateLesson.error?.errors, "title")}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Lesson Content</label>
          <RichEditor
            key={editorResetKey}
            editorSerializedState={editorInitialState}
            onSerializedChange={(serialized) =>
              setEditorContent(JSON.stringify(serialized))
            }
          />
          {getFieldError(updateLesson.error?.errors, "content") && (
            <p className="text-sm text-red-500">
              {getFieldError(updateLesson.error?.errors, "content")}
            </p>
          )}
        </div>

        <InputForm
          name="video_url"
          text="Video URL"
          type="url"
          value={form.video_url ?? ""}
          handleChange={handleChange}
          error={getFieldError(updateLesson.error?.errors, "video_url")}
        />

        <div className="flex flex-col gap-4 border-t pt-6">
          <h2 className="text-lg font-semibold">Attachments</h2>

          {lesson?.attachments && lesson.attachments.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Existing Attachments</label>
              <div className="flex flex-col gap-2">
                {lesson.attachments.map((attachment: any) => (
                  <div
                    key={attachment.id}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{attachment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        Type: {attachment.type} | Uploaded: {new Date(attachment.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleDeleteAttachment(attachment.id)}
                      disabled={deleteAttachment.isPending}
                      className="text-sm text-red-600 hover:text-red-800 disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t pt-4">
            <label className="text-sm font-medium">Add New Attachment</label>

            <div className="flex flex-col gap-2">
              <label htmlFor="attachment-file" className="text-sm">File</label>
              <input
                id="attachment-file"
                type="file"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50 focus:outline-none"
              />
            </div>

            <InputForm
              name="title"
              text="Attachment Title"
              type="text"
              value={attachmentForm.title}
              handleChange={handleAttachmentChange}
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="attachment-type" className="text-sm font-medium">Type</label>
              <select
                id="attachment-type"
                name="type"
                value={attachmentForm.type}
                onChange={handleAttachmentChange}
                className="block w-full rounded-md border border-gray-300 p-2 text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="material">Material</option>
                <option value="reference">Reference</option>
                <option value="download">Download</option>
                <option value="slides">Slides</option>
                <option value="document">Document</option>
              </select>
            </div>

            <InputForm
              name="description"
              text="Description (Optional)"
              type="text"
              value={attachmentForm.description}
              handleChange={handleAttachmentChange}
            />

            <button
              type="button"
              onClick={handleAddAttachment}
              disabled={!attachmentForm.file || !attachmentForm.title || addAttachment.isPending}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {addAttachment.isPending ? "Uploading..." : "Add Attachment"}
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <LoadingButton
            text="Update Lesson"
            loading={updateLesson.isPending}
          />
        </div>
      </form>
    </div>
  );
}
