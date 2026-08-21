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

export default function CreatePage({ params }: Route.ComponentProps) {
  const { module, loading, error } = useGetModule(params.slug!);
  const storeLesson = useStoreLesson();
  const addAttachment = useAddLessonAttachment();
  const [editorResetKey, setEditorResetKey] = useState(0);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    video_url: "",
    order: "",
  });

  const [editorContent, setEditorContent] = useState("");

  const [preparedAttachments, setPreparedAttachments] = useState<
    Array<{
      file: File;
      title: string;
      type: "material" | "reference" | "download" | "slides" | "document";
      description: string;
    }>
  >([]);

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

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    setAttachmentForm((prev) => ({ ...prev, file }));
  };

  const handleAttachmentFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    setAttachmentForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePrepareAttachment = (e: React.FormEvent) => {
    e.preventDefault();

    if (!attachmentForm.file || !attachmentForm.title) return;

    setPreparedAttachments((prev) => [
      ...prev,
      {
        file: attachmentForm.file!,
        title: attachmentForm.title,
        type: attachmentForm.type,
        description: attachmentForm.description,
      },
    ]);

    setAttachmentForm({
      file: null,
      title: "",
      type: "material",
      description: "",
    });

    const fileInput = document.getElementById("attachment-file") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleRemoveAttachment = (index: number) => {
    setPreparedAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!module) return;

    storeLesson.mutate(
      {
        title: form.title,
        content: editorContent || form.content,
        slug: form.slug || generateSlug(form.title),
        video_url: form.video_url || null,
        order: Number.parseInt(form.order, 10),
        module_id: module.id,
      },
      {
        onSuccess: (data) => {
          // Upload attachments if any are prepared
          if (preparedAttachments.length > 0 && data.slug) {
            preparedAttachments.forEach((attachment) => {
              addAttachment.mutate({
                lessonSlug: data.slug,
                file: attachment.file,
                title: attachment.title,
                type: attachment.type,
                description: attachment.description || undefined,
              });
            });
          }

          // Reset form and attachments
          setForm({
            title: "",
            slug: "",
            content: "",
            video_url: "",
            order: "",
          });
          setEditorContent("");
          setPreparedAttachments([]);
          setEditorResetKey((prev) => prev + 1);
        },
      },
    );
  };

  if (loading) return <FormPageSkeleton />;
  if (error) return <p>Error: {error.message}</p>;
  if (!module) return <p>Module not found.</p>;

  return (
    <div className="mx-auto flex w-full flex-col gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Create lesson</h1>
        <p className="text-sm text-muted-foreground">
          Add a new lesson to {module.title}.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        {storeLesson.error &&
          storeLesson.error.message !== "Validation errors" && (
            <Alert variant="destructive" className="bg-red-100">
              <AlertDescription>
                {storeLesson.error.message ?? "An unknown error occurred."}
              </AlertDescription>
            </Alert>
          )}

        <InputForm
          name="title"
          text="Lesson Title"
          type="text"
          value={form.title}
          handleChange={handleChange}
          error={getFieldError(storeLesson.error?.errors, "title")}
        />

        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium">Lesson Content</label>
          <RichEditor
            key={editorResetKey}
            onSerializedChange={(serialized) =>
              setEditorContent(JSON.stringify(serialized))
            }
          />
          {getFieldError(storeLesson.error?.errors, "content") && (
            <p className="text-sm text-red-500">
              {getFieldError(storeLesson.error?.errors, "content")}
            </p>
          )}
        </div>

        <InputForm
          name="video_url"
          text="Video URL"
          type="url"
          value={form.video_url}
          handleChange={handleChange}
          error={getFieldError(storeLesson.error?.errors, "video_url")}
        />

        <InputForm
          name="order"
          text="Lesson Order"
          type="number"
          value={form.order}
          handleChange={handleChange}
          error={getFieldError(storeLesson.error?.errors, "order")}
        />

        <div className="flex flex-col gap-4 border-t pt-6">
          <h2 className="text-lg font-semibold">Attachments (Optional)</h2>
          <p className="text-sm text-muted-foreground">
            Prepare attachments to upload after lesson creation.
          </p>

          {preparedAttachments.length > 0 && (
            <div className="flex flex-col gap-2">
              <label className="text-sm font-medium">Prepared Attachments</label>
              <div className="flex flex-col gap-2">
                {preparedAttachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between rounded-md border p-3"
                  >
                    <div className="flex flex-col gap-1">
                      <p className="text-sm font-medium">{attachment.title}</p>
                      <p className="text-xs text-muted-foreground">
                        File: {attachment.file.name} | Type: {attachment.type}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveAttachment(index)}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-4 border-t pt-4">
            <label className="text-sm font-medium">Prepare New Attachment</label>

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
              handleChange={handleAttachmentFormChange}
            />

            <div className="flex flex-col gap-2">
              <label htmlFor="attachment-type" className="text-sm font-medium">Type</label>
              <select
                id="attachment-type"
                name="type"
                value={attachmentForm.type}
                onChange={handleAttachmentFormChange}
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
              handleChange={handleAttachmentFormChange}
            />

            <button
              type="button"
              onClick={handlePrepareAttachment}
              disabled={!attachmentForm.file || !attachmentForm.title}
              className="w-full rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Prepare Attachment
            </button>
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <LoadingButton text="Create Lesson" loading={storeLesson.isPending} />
        </div>
      </form>
    </div>
  );
}
