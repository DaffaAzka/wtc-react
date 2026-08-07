import { useState } from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";


export default function InputCheckbox({
  checked: controlledChecked,
  disabled = false,
  onChange,
  className,
}: {
  checked?: boolean;
  disabled?: boolean
  onChange?: (checked: boolean) => void;
  className?: string;
}) {
  const [internalChecked, setInternalChecked] = useState(false);

  const isChecked = controlledChecked ?? internalChecked;

  const handleToggle = () => {
    const next = !isChecked;
    setInternalChecked(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      onClick={handleToggle}
      className={cn(
        "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-200 cursor-pointer",
        isChecked ?
          "bg-[#1e2235] border-[#1e2235]"
        : "bg-transparent border-muted-foreground/40",
        className,
      )}
      disabled={disabled}
      >
      {isChecked && <Check className="w-4 h-4 text-white" strokeWidth={3} />}
    </button>
  );
}
