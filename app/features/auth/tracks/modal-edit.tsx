import type { Track } from "@/types/model";
import React, { useEffect, useState } from "react";

import InputForm from "@/components/custom/input-form";
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
import { useUpdateTrack } from "@/hooks/tracks";
import { getFieldError } from "@/utils/global";

export default function ModalEdit({
  data,
  isOpen,
  onOpenChange,
}: {
  data: Track | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    order: "",
    image_url: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        description: data.description,
        order: data.order.toString(),
        image_url: data.image_url,
      });
    }
  }, [data]);

  const updateTrack = useUpdateTrack(data!.slug);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateTrack.mutate(
      {
        title: form.title,
        slug: form.slug,
        description: form.description,
        order: Number.parseInt(form.order),
        image_url: form.image_url,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({
            title: "",
            slug: "",
            description: "",
            order: "",
            image_url: "",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Track</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {updateTrack.error &&
                updateTrack.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {updateTrack.error.message ??
                        "An unknown error occurred."}
                    </AlertDescription>
                  </Alert>
                )}

              <InputForm
                name="title"
                text="Track Title"
                type="text"
                value={form.title}
                handleChange={handleChange}
                error={getFieldError(updateTrack.error?.errors, "title")}
              />
              <InputForm
                name="description"
                text="Track Description"
                type="text"
                value={form.description}
                handleChange={handleChange}
                error={getFieldError(updateTrack.error?.errors, "description")}
              />
              <InputForm
                name="order"
                text="Track Order"
                type="number"
                value={form.order}
                handleChange={handleChange}
                error={getFieldError(updateTrack.error?.errors, "order")}
              />
              <InputForm
                name="image_url"
                text="Image URL"
                type="text"
                value={form.image_url}
                handleChange={handleChange}
                error={getFieldError(updateTrack.error?.errors, "image_url")}
              />

              <LoadingButton text="Update" loading={updateTrack.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
