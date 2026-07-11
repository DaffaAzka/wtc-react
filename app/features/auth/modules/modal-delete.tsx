import type { Module } from "@/types/model";
import React, { useEffect, useState } from "react";

import LoadingButton from "@/components/custom/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteModule } from "@/hooks/modules";

export default function ModalDelete({
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
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
      });
    }
  }, [data]);

  const deleteModule = useDeleteModule();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    deleteModule.mutate(form!.slug, {
      onSuccess: () => {
        onOpenChange(false);
        setForm({
          title: "",
          slug: "",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Module</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {deleteModule.error &&
                deleteModule.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {deleteModule.error.message ??
                        "An unknown error occurred."}
                    </AlertDescription>
                  </Alert>
                )}
              <p>Are you sure, you want to delete {form.title}?</p>
              <LoadingButton text="Delete" loading={deleteModule.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
