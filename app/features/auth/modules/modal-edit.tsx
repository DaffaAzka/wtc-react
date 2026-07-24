import type { Module } from "@/types/model";
import React, { useEffect, useState } from "react";

import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useUpdateModule } from "@/hooks/modules";
import { getFieldError } from "@/utils/global";

export default function ModalEdit({
  data,
  isOpen,
  onOpenChange,
}: {
  data: Module | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    order: "",
    track_id: 0,
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
        order: data.order.toString(),
        track_id: data.track_id,
      });
    }
  }, [data]);

  const updateModule = useUpdateModule();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateModule.mutate(
      {
        title: form.title,
        slug: form.slug,
        order: Number.parseInt(form.order),
        track_id: form.track_id,
      },
      {
        onSuccess: () => {
          onOpenChange(false);
          setForm({
            title: "",
            slug: "",
            order: "",
            track_id: 0,
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Update Module</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {updateModule.error &&
                updateModule.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {updateModule.error.message ??
                        "An unknown error occurred."}
                    </AlertDescription>
                  </Alert>
                )}

              <InputForm
                name="title"
                text="Module Title"
                type="text"
                value={form.title}
                handleChange={handleChange}
                error={getFieldError(updateModule.error?.errors, "title")}
              />
              <InputForm
                name="order"
                text="Module Order"
                type="number"
                value={form.order}
                handleChange={handleChange}
                error={getFieldError(updateModule.error?.errors, "order")}
              />

              <LoadingButton text="Update" loading={updateModule.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
