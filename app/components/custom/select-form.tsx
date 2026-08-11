import { Field, FieldDescription, FieldLabel } from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { SelectItems } from "@/types/global";

export default function SelectForm({
  name,
  text,
  handleChange,
  items,
  error = null,
  usePlaceholder = false,
  value = null,
  isDisabled = false,
  withAll = false,
}: {
  name: string;
  text: string;
  handleChange: (value: string) => void;
  items: SelectItems[];
  error?: string | null;
  value?: string | null;
  usePlaceholder?: boolean;
  isDisabled?: boolean;
  withAll?: boolean;
}) {
  return (
    <Field aria-invalid={error != null} className="flex flex-col gap-1.5">
      {!usePlaceholder && <FieldLabel htmlFor={name}>{text}</FieldLabel>}
      <div className="flex flex-col gap-1">
        <Select onValueChange={handleChange} name={name} value={value ?? ""}>
          <SelectTrigger className="w-full" disabled={isDisabled}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {withAll && <SelectItem value="all">All</SelectItem>}
            {items.map((item) => (
              <SelectItem key={item.id} value={item.id.toString()}>
                {item.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {error && (
          <FieldDescription className="text-xs">{error}</FieldDescription>
        )}
      </div>
    </Field>
  );
}
