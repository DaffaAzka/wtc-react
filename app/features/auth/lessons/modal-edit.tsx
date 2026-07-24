import type { Lesson } from "@/types/model";
import React, { useEffect, useState } from "react";

import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";
import LoadingButton from "@/components/custom/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateLesson } from "@/hooks/lessons";
import { getFieldError } from "@/utils/global";

export default function ModalEdit({
  data,
  isOpen,
  onOpenChange,
}: {
  data: Lesson | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    id: 0,
    title: "",
    content: "",
    video_url: "",
    order: "",
    module_id: 0,
  });

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        title: data.title,
        content: data.content,
        video_url: data.video_url ?? "",
        order: data.order.toString(),
        module_id: data.module_id,
      });
    }
  }, [data]);

  const updateLesson = useUpdateLesson();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateLesson.mutate(
      {
        id: form.id,
        title: form.title,
        content: form.content,
        video_url: form.video_url || null,
        order: Number.parseInt(form.order),
        module_id: form.module_id,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({
            id: 0,
            title: "",
            content: "",
            video_url: "",
            order: "",
            module_id: 0,
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Lesson</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {updateLesson.error &&
                updateLesson.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {updateLesson.error.message ??
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
                error={getFieldError(updateLesson.error?.errors, "title")}
              />
              <TextareaForm
                name="content"
                text="Lesson Content"
                value={form.content}
                handleChange={handleChange}
                error={getFieldError(updateLesson.error?.errors, "content")}
              />
              <InputForm
                name="video_url"
                text="Video URL"
                type="url"
                value={form.video_url}
                handleChange={handleChange}
                error={getFieldError(updateLesson.error?.errors, "video_url")}
              />
              <InputForm
                name="order"
                text="Lesson Order"
                type="number"
                value={form.order}
                handleChange={handleChange}
                error={getFieldError(updateLesson.error?.errors, "order")}
              />

              <LoadingButton text="Update" loading={updateLesson.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
