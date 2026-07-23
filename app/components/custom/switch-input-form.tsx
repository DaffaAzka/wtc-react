import { Switch } from "@/components/ui/switch";
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";

export default function SwitchInputForm({
  name,
  text,
  value = false,
  handleChange,
  error = null,
  isDisabled = false,
}: {
  name: string;
  text: string;
  value?: boolean;
  handleChange: (checked: boolean) => void;
  error?: string | null;
  isDisabled?: boolean;
}) {
  return (
    <Field aria-invalid={error != null} className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <div className="flex justify-between">
          <FieldLabel htmlFor={name}>{text}</FieldLabel>
          <Switch
            id={name}
            checked={value}
            onCheckedChange={handleChange}
            disabled={isDisabled}
          />
        </div>
        {error && (
          <FieldDescription className="text-xs">{error}</FieldDescription>
        )}
      </div>
    </Field>
  );
}
