import type { StudyClass } from "@/services/study-class";
import { useEffect, useState } from "react";

import LoadingButton from "@/components/custom/loading-button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useDeleteStudyClass } from "@/hooks/study-classes";

export default function ModalDelete({
  data,
  isOpen,
  onOpenChange,
}: {
  data: StudyClass | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [form, setForm] = useState({
    id: 0,
    name: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        name: data.name,
      });
    }
  }, [data]);

  const deleteStudyClass = useDeleteStudyClass();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    deleteStudyClass.mutate(form.id, {
      onSuccess: () => {
        onOpenChange(false);
        setForm({
          id: 0,
          name: "",
        });
      },
    });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Delete Study Class</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {deleteStudyClass.error &&
                deleteStudyClass.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {deleteStudyClass.error.message ??
                        "An unknown error occurred."}
                    </AlertDescription>
                  </Alert>
                )}
              <p>
                Are you sure you want to delete <strong>{form.name}</strong>?
                This action cannot be undone.
              </p>
              <LoadingButton
                text="Delete"
                loading={deleteStudyClass.isPending}
              />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
