import InputForm from "@/components/custom/input-form";
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
import { useStoreModule } from "@/hooks/modules";
import { useGetTracks } from "@/hooks/tracks";
import { generateSlug, getFieldError } from "@/utils/global";
import { useState } from "react";

export default function TeacherModuleModalAdd() {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({ title: "", trackId: "" });

  const storeModule = useStoreModule();
  const { tracks } = useGetTracks();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form.trackId) return;
    storeModule.mutate(
      {
        title: form.title,
        slug: generateSlug(form.title),
        track_id: Number(form.trackId),
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({ title: "", trackId: "" });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Module</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-lg"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add New Module</DialogTitle>
          <DialogDescription>
            Fill in the details for the new module.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {storeModule.error &&
            storeModule.error.message !== "Validation errors" && (
              <Alert variant="destructive" className="bg-red-100">
                <AlertDescription>
                  {storeModule.error.message ?? "An unknown error occurred."}
                </AlertDescription>
              </Alert>
            )}

          <SelectForm
            name="trackId"
            text="Track"
            items={tracks.map((t) => ({ id: t.id, name: t.title }))}
            handleChange={(value) =>
              setForm((prev) => ({ ...prev, trackId: value }))
            }
            value={form.trackId}
          />

          <InputForm
            name="title"
            text="Module Title"
            type="text"
            value={form.title}
            handleChange={handleChange}
            error={getFieldError(storeModule.error?.errors, "title")}
          />

          <LoadingButton
            text="Create"
            loading={storeModule.isPending}
            disabled={!form.trackId || !form.title.trim()}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
