import type { ChangeEventHandler } from "react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";

export default function TextareaForm({
  name,
  text,
  value = "",
  handleChange,
  error = null,
  placeholder = "",
  isDisabled = false,
}: {
  name: string;
  text: string;
  value?: string;
  handleChange: ChangeEventHandler<HTMLTextAreaElement>;
  error?: string | null;
  placeholder?: string;
  isDisabled?: boolean;
}) {
  return (
    <Field aria-invalid={error != null} className="flex w-full flex-col gap-3">
      <FieldLabel htmlFor={name}>{text}</FieldLabel>
      <div className="flex w-full flex-col gap-1">
        <Textarea
          id={name}
          name={name}
          value={value}
          onChange={handleChange}
          aria-invalid={error != null}
          placeholder={placeholder}
          className="w-full resize-none overflow-auto bg-background wrap-break-word text-black"
          rows={4}
          disabled={isDisabled}
        />
        {error && (
          <FieldDescription className="text-xs">{error}</FieldDescription>
        )}
      </div>
    </Field>
  );
}
