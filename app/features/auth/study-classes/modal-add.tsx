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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateStudyClass } from "@/hooks/study-classes";
import { getFieldError } from "@/utils/global";
import { useState } from "react";

export default function ModalAdd() {
  const [open, setOpen] = useState(false);

  const [form, setForm] = useState({
    name: "",
    description: "",
    academic_year: "",
    semester: "",
  });

  const createStudyClass = useCreateStudyClass();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
  ) => setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSelectChange = (name: string, value: string) =>
    setForm((prev) => ({ ...prev, [name]: value }));

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    createStudyClass.mutate(
      {
        name: form.name,
        description: form.description || null,
        academic_year: form.academic_year || null,
        semester: form.semester || null,
      },
      {
        onSuccess: () => {
          setOpen(false);
          setForm({
            name: "",
            description: "",
            academic_year: "",
            semester: "",
          });
        },
      },
    );
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>Add Study Class</Button>
      </DialogTrigger>
      <DialogContent
        className="max-w-2xl max-h-[90vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}>
        <DialogHeader>
          <DialogTitle>Add New Study Class</DialogTitle>
          <DialogDescription>
            Fill in the details for the new study class.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
          {createStudyClass.error &&
            createStudyClass.error.message !== "Validation errors" && (
              <Alert variant="destructive" className="bg-red-100">
                <AlertDescription>
                  {createStudyClass.error.message ??
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
            error={getFieldError(createStudyClass.error?.errors, "name")}
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
            {getFieldError(createStudyClass.error?.errors, "description") && (
              <p className="text-sm text-red-600">
                {getFieldError(createStudyClass.error?.errors, "description")}
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
            {getFieldError(createStudyClass.error?.errors, "academic_year") && (
              <p className="text-sm text-red-600">
                {getFieldError(createStudyClass.error?.errors, "academic_year")}
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
            {getFieldError(createStudyClass.error?.errors, "semester") && (
              <p className="text-sm text-red-600">
                {getFieldError(createStudyClass.error?.errors, "semester")}
              </p>
            )}
          </div>

          <LoadingButton text="Create" loading={createStudyClass.isPending} />
        </form>
      </DialogContent>
    </Dialog>
  );
}
