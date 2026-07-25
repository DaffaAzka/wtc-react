import InputForm from "@/components/custom/input-form";
import TextareaForm from "@/components/custom/textarea-form";
import Builder from "./builder";
import LoadingButton from "@/components/custom/loading-button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useStoreChallenge } from "@/hooks/challenges";
import type { Lesson } from "@/types/model";
import { getFieldError } from "@/utils/global";
import { useState } from "react";

type Props = {
  lesson: Lesson;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ChallengeModalAdd({
  lesson,
  isOpen,
  onOpenChange,
}: Props) {
  const [form, setForm] = useState({
    title: "",
    slug: "",
    type: "multiple_choice",
    content: "",
    max_score: "100",
  });

  const storeChallenge = useStoreChallenge();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) =>
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    storeChallenge.mutate(
      {
        module_id: null,
        lesson_id: lesson.id,
        title: form.title,
        slug: form.slug,
        type: form.type,
        content: form.content,
        metadata: null,
        max_score: Number(form.max_score),
      },
      {
        onSuccess: () => {
          onOpenChange(false);

          setForm({
            title: "",
            slug: "",
            type: "multiple_choice",
            content: "",
            max_score: "100",
          });
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Challenge</DialogTitle>

          <DialogDescription>
            Lesson: <strong>{lesson.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-5 mt-4">
          {storeChallenge.error &&
            storeChallenge.error.message !== "Validation errors" && (
              <Alert variant="destructive">
                <AlertDescription>
                  {storeChallenge.error.message}
                </AlertDescription>
              </Alert>
            )}

          <InputForm
            name="title"
            text="Challenge Title"
            type="text"
            value={form.title}
            handleChange={handleChange}
            error={getFieldError(storeChallenge.error?.errors, "title")}
          />

          <InputForm
            name="slug"
            text="Slug"
            type="text"
            value={form.slug}
            handleChange={handleChange}
            error={getFieldError(storeChallenge.error?.errors, "slug")}
          />

          <div className="space-y-2">
            <Label>Challenge Type</Label>

            <Select
              value={form.type}
              onValueChange={(value) =>
                setForm((prev) => ({
                  ...prev,
                  type: value,
                }))
              }>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="multiple_choice">Multiple Choice</SelectItem>

                <SelectItem value="fill_blank">Fill Blank</SelectItem>

                <SelectItem value="quiz_group">Mixed Quiz</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TextareaForm
            name="content"
            text="Description"
            value={form.content}
            handleChange={handleChange}
            error={getFieldError(storeChallenge.error?.errors, "content")}
          />

          <InputForm
            name="max_score"
            text="Max Score"
            type="number"
            value={form.max_score}
            handleChange={handleChange}
            error={getFieldError(storeChallenge.error?.errors, "max_score")}
          />

          <Builder type={form.type as "multiple_choice" | "essay" | "mixed"} />

          <LoadingButton
            text="Create Challenge"
            loading={storeChallenge.isPending}
          />
        </form>
      </DialogContent>
    </Dialog>
  );
}
