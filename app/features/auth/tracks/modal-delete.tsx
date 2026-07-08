import type { Track } from "@/types/model";
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
import { useDeleteTrack } from "@/hooks/tracks";

export default function ModalDelete({
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
  });

  useEffect(() => {
    if (data) {
      setForm({
        title: data.title,
        slug: data.slug,
      });
    }
  }, [data]);

  const deleteTrack = useDeleteTrack();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    deleteTrack.mutate(form!.slug, {
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
          <DialogTitle>Delete Track</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {deleteTrack.error &&
                deleteTrack.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {deleteTrack.error.message ??
                        "An unknown error occurred."}
                    </AlertDescription>
                  </Alert>
                )}
              <p>Are you sure, you want to delete {form.title}?</p>
              <LoadingButton text="Delete" loading={deleteTrack.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
