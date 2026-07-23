import { Input } from "@/components/ui/input";
import type { ChangeEventHandler, HTMLInputTypeAttribute } from "react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

export default function InputForm({
  name,
  text,
  type,
  value = "",
  handleChange,
  error = null,
  placeholder = "",
  isDisabled = false,
}: {
  name: string;
  text: string;
  type: HTMLInputTypeAttribute;
  value?: string;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  error?: string | null;
  placeholder?: string;
  isDisabled?: boolean;
}) {
  return (
    <Field aria-invalid={error != null} className="flex flex-col gap-1.5">
      <FieldLabel htmlFor={name}>{text}</FieldLabel>
      <div className="flex flex-col gap-1">
        <Input
          id={name}
          name={name}
          type={type}
          value={value}
          disabled={isDisabled}
          onChange={handleChange}
          aria-invalid={error != null}
          placeholder={placeholder}
          className="text-black"
        />
        {error && (
          <FieldDescription className="text-xs">{error}</FieldDescription>
        )}
      </div>
    </Field>
  );
}
