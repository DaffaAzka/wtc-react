import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";
import LoadingButton from "@/components/custom/loading-button";
import SelectForm from "@/components/custom/select-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useStoreLesson } from "@/hooks/lessons";
import { useGetModules } from "@/hooks/modules";
import { generateSlug, getFieldError } from "@/utils/global";
import { useState } from "react";

export default function TeacherLessonModalAdd() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    title: "",
    content: "",
    video_url: "",
    moduleId: "",
  });

  const storeLesson = useStoreLesson();
  const { modules } = useGetModules();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.moduleId) return;
    storeLesson.mutate(
      {
        title: form.title,
        content: form.content,
        slug: generateSlug(form.title),
        video_url: form.video_url || null,
        module_id: Number(form.moduleId),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ title: "", content: "", video_url: "", moduleId: "" });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Lesson</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>
            Fill in the details for the new lesson.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6 mt-2">
          {storeLesson.error &&
            storeLesson.error.message !== "Validation errors" && (
              <Alert variant="destructive" className="bg-red-100">
                <AlertDescription>
                  {storeLesson.error.message ?? "An unknown error occurred."}
                </AlertDescription>
              </Alert>
            )}

          <SelectForm
            name="moduleId"
            text="Module"
            items={modules.map((m) => ({ id: m.id, name: m.title }))}
            handleChange={(value) =>
              setForm((prev) => ({ ...prev, moduleId: value }))
            }
            value={form.moduleId}
          />

          <InputForm
            name="title"
            text="Lesson Title"
            type="text"
            value={form.title}
            handleChange={handleChange}
            error={getFieldError(storeLesson.error?.errors, "title")}
          />

          <TextareaForm
            name="content"
            text="Lesson Content"
            value={form.content}
            handleChange={handleChange}
            error={getFieldError(storeLesson.error?.errors, "content")}
          />

          <InputForm
            name="video_url"
            text="Video URL"
            type="url"
            value={form.video_url}
            handleChange={handleChange}
            error={getFieldError(storeLesson.error?.errors, "video_url")}
          />

          <LoadingButton
            text="Create"
            loading={storeLesson.isPending}
            disabled={!form.moduleId || !form.title.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
