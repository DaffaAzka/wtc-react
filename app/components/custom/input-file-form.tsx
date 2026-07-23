import { Input } from "@/components/ui/input";
import type { ChangeEventHandler } from "react";
// import ImagePreview from "./image-preview";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

export default function InputFileForm({
  name,
  text,
  value = "",
  handleChange,
  error = null,
  placeholder = "",
  isDisabled = false,
  accept = "image/*",
  preview,
  existingImage,
  onRemoveImage,
}: {
  name: string;
  text: string;
  value?: string;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  error?: string | null;
  placeholder?: string;
  isDisabled?: boolean;
  accept?: string;
  preview?: string;
  existingImage?: string;
  onRemoveImage?: () => void;
}) {
  return (
    <Field aria-invalid={error != null} className="flex flex-col gap-3">
      <FieldLabel htmlFor={name}>{text}</FieldLabel>
      <div className="flex flex-col gap-2">
        {/* <ImagePreview
          preview={preview}
          existingImage={existingImage}
          onRemove={onRemoveImage}
          disabled={isDisabled}
        /> */}
        <Input
          id={name}
          name={name}
          type="file"
          onChange={handleChange}
          disabled={isDisabled}
          aria-invalid={error != null}
          placeholder={placeholder}
          accept={accept}
          className="bg-white"
        />
        {error && (
          <FieldDescription className="text-xs">{error}</FieldDescription>
        )}
      </div>
    </Field>
  );
}
