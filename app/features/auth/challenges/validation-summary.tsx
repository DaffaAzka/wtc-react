import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

type Props = {
  errors: Record<string, string>;
};

export default function ValidationSummary({ errors }: Props) {
  const errorCount = Object.keys(errors).length;

  if (errorCount === 0) {
    return null;
  }

  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>Validation Errors</AlertTitle>
      <AlertDescription>
        {errorCount === 1 ? (
          <span>There is 1 validation error.</span>
        ) : (
          <span>There are {errorCount} validation errors.</span>
        )}{" "}
        Please complete all required fields before creating this challenge.
      </AlertDescription>
    </Alert>
  );
}
