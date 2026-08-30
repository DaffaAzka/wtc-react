import type { StudyClass } from "@/services/study-class";
import { useEffect, useState } from "react";

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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUpdateStudyClass } from "@/hooks/study-classes";
import { getFieldError } from "@/utils/global";

export default function ModalEdit({
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
    description: "",
    academic_year: "",
    semester: "",
  });

  useEffect(() => {
    if (data) {
      setForm({
        id: data.id,
        name: data.name,
        description: data.description || "",
        academic_year: data.academic_year || "",
        semester: data.semester || "",
      });
    }
  }, [data]);

  const updateStudyClass = useUpdateStudyClass();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSelectChange = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    updateStudyClass.mutate(
      {
        id: form.id,
        data: {
          name: form.name,
          description: form.description || null,
          academic_year: form.academic_year || null,
          semester: form.semester || null,
        },
      },
      {
        onSuccess: () => {
          onOpenChange(false);
        },
      },
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Update Study Class</DialogTitle>
          <DialogDescription>
            Modify the details for this study class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {updateStudyClass.error &&
            updateStudyClass.error.message !== "Validation errors" && (
              <Alert variant="destructive" className="bg-red-100">
                <AlertDescription>
                  {updateStudyClass.error.message ??
                    "An unknown error occurred."}
                </AlertDescription>
              </Alert>
            )}

          <InputForm
            name="name"
            text="Class Name"
            type="text"
            value={form.name}
            handleChange={handleChange}
            error={getFieldError(updateStudyClass.error?.errors, "name")}
            required
          />

          <div className="flex flex-col gap-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              value={form.description}
              onChange={handleChange}
              placeholder="Enter class description (optional)"
              rows={4}
            />
            {getFieldError(updateStudyClass.error?.errors, "description") && (
              <p className="text-sm text-red-600">
                {getFieldError(updateStudyClass.error?.errors, "description")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="academic_year">Academic Year</Label>
            <Select
              value={form.academic_year}
              onValueChange={(value) =>
                handleSelectChange("academic_year", value)
              }>
              <SelectTrigger>
                <SelectValue placeholder="Select academic year (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2023/2024">2023/2024</SelectItem>
                <SelectItem value="2024/2025">2024/2025</SelectItem>
                <SelectItem value="2025/2026">2025/2026</SelectItem>
                <SelectItem value="2026/2027">2026/2027</SelectItem>
                <SelectItem value="2027/2028">2027/2028</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError(updateStudyClass.error?.errors, "academic_year") && (
              <p className="text-sm text-red-600">
                {getFieldError(updateStudyClass.error?.errors, "academic_year")}
              </p>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <Label htmlFor="semester">Semester</Label>
            <Select
              value={form.semester}
              onValueChange={(value) => handleSelectChange("semester", value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select semester (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Semester 1</SelectItem>
                <SelectItem value="2">Semester 2</SelectItem>
                <SelectItem value="3">Semester 3</SelectItem>
                <SelectItem value="4">Semester 4</SelectItem>
                <SelectItem value="5">Semester 5</SelectItem>
                <SelectItem value="6">Semester 6</SelectItem>
                <SelectItem value="7">Semester 7</SelectItem>
                <SelectItem value="8">Semester 8</SelectItem>
              </SelectContent>
            </Select>
            {getFieldError(updateStudyClass.error?.errors, "semester") && (
              <p className="text-sm text-red-600">
                {getFieldError(updateStudyClass.error?.errors, "semester")}
              </p>
            )}
          </div>

          <LoadingButton text="Update" loading={updateStudyClass.isPending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
