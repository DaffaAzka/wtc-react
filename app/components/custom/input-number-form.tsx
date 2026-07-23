import { Input } from "@/components/ui/input";
import type { ChangeEventHandler } from "react";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

export default function InputNumberForm({
  name,
  text,
  value = "",
  handleChange,
  error = null,
  placeholder = "",
  isDisabled = false,
  min = 0,
}: {
  name: string;
  text: string;
  value?: string | number;
  handleChange: ChangeEventHandler<HTMLInputElement>;
  error?: string | null;
  placeholder?: string;
  isDisabled?: boolean;
  min?: string | number;
}) {
  return (
    <Field aria-invalid={error != null} className="flex flex-col gap-3">
      <FieldLabel htmlFor={name}>{text}</FieldLabel>
      <div className="flex flex-col gap-1">
        <Input
          id={name}
          name={name}
          type="number"
          min={min}
          value={value}
          onChange={handleChange}
          disabled={isDisabled}
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
