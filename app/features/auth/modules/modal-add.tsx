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
import { useStoreModule } from "@/hooks/modules";
import { generateSlug } from "@/utils/global";
import { getFieldError } from "@/utils/global";
import { useState } from "react";

export default function ModalAdd({ trackId }: { trackId: number }) {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    order: "",
  });

  const storeModule = useStoreModule();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    storeModule.mutate(
      {
        title: form.title,
        slug: generateSlug(form.title),
        order: Number.parseInt(form.order),
        track_id: trackId,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({
            title: "",
            slug: "",
            order: "",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Add Module</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Module</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {storeModule.error &&
                storeModule.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {storeModule.error.message ?? "An unknown error occurred."}
                    </AlertDescription>
                  </Alert>
                )}

              <InputForm
                name="title"
                text="Module Title"
                type="text"
                value={form.title}
                handleChange={handleChange}
                error={getFieldError(storeModule.error?.errors, "title")}
              />
              <InputForm
                name="order"
                text="Module Order"
                type="number"
                value={form.order}
                handleChange={handleChange}
                error={getFieldError(storeModule.error?.errors, "order")}
              />

              <LoadingButton text="Create" loading={storeModule.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
