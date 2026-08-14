import { useGetLesson, useUpdateLesson } from "@/hooks/lessons";
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
