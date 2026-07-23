import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";
import LoadingButton from "@/components/custom/loading-button";
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
import { getFieldError } from "@/utils/global";
import { useState } from "react";

export default function ModalAdd({ moduleId }: { moduleId: number }) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    content: "",
    video_url: "",
    order: "",
  });

  const storeLesson = useStoreLesson();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    storeLesson.mutate(
      {
        title: form.title,
        content: form.content,
        video_url: form.video_url || null,
        order: Number.parseInt(form.order),
        module_id: moduleId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({
            title: "",
            content: "",
            video_url: "",
            order: "",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Add Lesson</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Lesson</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {storeLesson.error &&
                storeLesson.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {storeLesson.error.message ??
                        "An unknown error occurred."}
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
              <InputForm
                name="order"
                text="Lesson Order"
                type="number"
                value={form.order}
                handleChange={handleChange}
                error={getFieldError(storeLesson.error?.errors, "order")}
              />

              <LoadingButton text="Create" loading={storeLesson.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
