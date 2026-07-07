import InputForm from "@/components/custom/input-form";
import LoadingButton from "@/components/custom/loading-button";
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
import { useState } from "react";

export default function ModalAdd() {
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
    form.slug = generateSlug(form.title);
    storeTrack.mutate({
      title: form.title,
      slug: form.slug,
      description: form.description,
      order: parseInt(form.order),
      image_url: form.image_url,
    });
  };

  return (
    <Dialog>
      <DialogTrigger>
        <Button>Add Track</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Track</DialogTitle>
          <DialogDescription>
            <form onSubmit={handleSubmit} className="flex flex-col gap-6">
              <InputForm
                name="title"
                text="Track Title"
                type="text"
                value={form.title}
                handleChange={handleChange}
              />
              <InputForm
                name="description"
                text="Track Description"
                type="text"
                value={form.description}
                handleChange={handleChange}
              />
              <InputForm
                name="order"
                text="Track Order"
                type="number"
                value={form.order}
                handleChange={handleChange}
              />
              <InputForm
                name="image_url"
                text="Image URL"
                type="text"
                value={form.image_url}
                handleChange={handleChange}
              />

              <LoadingButton text="Create" loading={storeTrack.isPending} />
            </form>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
