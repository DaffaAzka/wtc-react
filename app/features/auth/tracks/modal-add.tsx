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
import { useStoreTrack } from "@/hooks/tracks";
import { generateSlug } from "@/utils/global";
import { getFieldError } from "@/utils/global";
import { useState } from "react";

export default function ModalAdd() {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    description: "",
    order: "",
    image_url: "",
  });

  const storeTrack = useStoreTrack();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    storeTrack.mutate(
      {
        title: form.title,
        slug: generateSlug(form.title),
        description: form.description,
        order: Number.parseInt(form.order),
        image_url: form.image_url,
      },
      {
        onSuccess: () => {
          setOpen(false);
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
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger>
        <Button>Add Track</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Track</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              {storeTrack.error &&
                storeTrack.error.message !== "Validation errors" && (
                  <Alert variant="destructive" className="bg-red-100">
                    <AlertDescription>
                      {storeTrack.error.message ?? "An unknown error occurred."}
                    </AlertDescription>
                  </Alert>
                )}

              <InputForm
                name="title"
                text="Track Title"
                type="text"
                value={form.title}
                handleChange={handleChange}
                error={getFieldError(storeTrack.error?.errors, "title")}
              />
              <InputForm
                name="description"
                text="Track Description"
                type="text"
                value={form.description}
                handleChange={handleChange}
                error={getFieldError(storeTrack.error?.errors, "description")}
              />
              <InputForm
                name="order"
                text="Track Order"
                type="number"
                value={form.order}
                handleChange={handleChange}
                error={getFieldError(storeTrack.error?.errors, "order")}
              />
              <InputForm
                name="image_url"
                text="Image URL"
                type="text"
                value={form.image_url}
                handleChange={handleChange}
                error={getFieldError(storeTrack.error?.errors, "image_url")}
              />

              <LoadingButton text="Create" loading={storeTrack.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
