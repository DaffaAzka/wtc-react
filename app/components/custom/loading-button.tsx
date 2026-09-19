import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import type { CSSProperties } from "react";

export default function LoadingButton({
  loading = false,
  text = "Submit",
  disabled = false,
  className,
  style,
}: {
  loading?: boolean;
  text?: string;
  disabled?: boolean;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <Button
      type="submit"
      className={className ?? "flex-row gap-2 w-full"}
      style={style}
      disabled={loading || disabled}>
      {loading && <Spinner />}
      {text}
    </Button>
  );
}
