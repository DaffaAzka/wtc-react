import type { Lesson } from "@/types/model";
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
import { useDeleteLesson } from "@/hooks/lessons";

export default function ModalDelete({
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
  });

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        title: data.title,
      });
    }
  }, [data]);

  const deleteLesson = useDeleteLesson();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    deleteLesson.mutate(form.id, {
      onSuccess: () => {
        onOpenChange(false);
        setForm({
          id: 0,
          title: "",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Lesson</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {deleteLesson.error &&
                deleteLesson.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {deleteLesson.error.message ??
                        "An unknown error occurred."}
                    </AlertDescription>
                  </Alert>
                )}
              <p>Are you sure, you want to delete {form.title}?</p>
              <LoadingButton text="Delete" loading={deleteLesson.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
