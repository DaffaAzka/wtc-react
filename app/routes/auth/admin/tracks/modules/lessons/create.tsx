import { Alert, AlertDescription } from "@/components/ui/alert";
import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { RichEditor } from "@/components/custom/rich-editor";
import { useStoreLesson } from "@/hooks/lessons";
import { useGetModule } from "@/hooks/modules";
import { generateSlug, getFieldError } from "@/utils/global";
import { useState } from "react";
import type { Route } from "./+types/create";

export default function CreatePage({ params }: Route.ComponentProps) {
  const { module, loading, error } = useGetModule(params.moduleSlug);
  const storeLesson = useStoreLesson();
  const [editorResetKey, setEditorResetKey] = useState(0);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    content: "",
    video_url: "",
    order: "",
  });

  const [editorContent, setEditorContent] = useState("");

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
        onSuccess: () => {
          setForm({
            title: "",
            slug: "",
            content: "",
            video_url: "",
            order: "",
          });
          setEditorContent("");
          setEditorResetKey((prev) => prev + 1);
        },
      },
    );
  };

  if (loading) return <p>Loading module...</p>;
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

        <LoadingButton text="Create Lesson" loading={storeLesson.isPending} />
      </form>
    </div>
  );
}
