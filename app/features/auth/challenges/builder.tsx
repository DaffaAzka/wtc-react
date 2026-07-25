import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

type BuilderProps = {
  type: "multiple_choice" | "essay" | "mixed";
};

export default function Builder({ type }: BuilderProps) {
  return (
    <div className="space-y-4 border rounded-lg p-4">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-lg">Questions</h3>

        <Button type="button" size="sm">
          <Plus className="w-4 h-4 mr-2" />
          Add Question
        </Button>
      </div>

      {type === "multiple_choice" && (
        <p className="text-sm text-muted-foreground">
          Builder Multiple Choice akan ditampilkan di sini.
        </p>
      )}

      {type === "essay" && (
        <p className="text-sm text-muted-foreground">
          Builder Essay akan ditampilkan di sini.
        </p>
      )}

      {type === "mixed" && (
        <p className="text-sm text-muted-foreground">
          Builder Mixed Quiz akan ditampilkan di sini.
        </p>
      )}
    </div>
  );
}
