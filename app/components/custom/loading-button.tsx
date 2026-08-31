import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

export default function LoadingButton({
  loading = false,
  text = "Submit",
  disabled = false,
  className,
}: {
  loading?: boolean;
  text?: string;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <Button
      type="submit"
      className={className ?? "flex-row gap-2 w-full"}
      disabled={loading || disabled}>
      {loading && <Spinner />}
      {text}
    </Button>
  );
}
