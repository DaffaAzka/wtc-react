import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, FileQuestion } from "lucide-react";

type Props = {
  onAddClick: () => void;
};

export default function ChallengeEmpty({ onAddClick }: Props) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-16">
        <div className="rounded-full bg-muted p-4 mb-4">
          <FileQuestion className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">No challenges yet</h3>
        <p className="text-muted-foreground text-center mb-6 max-w-sm">
          This lesson doesn't have any challenges yet. Create your first challenge to get started.
        </p>
        <Button onClick={onAddClick}>
          <Plus className="h-4 w-4 mr-2" />
          Add Challenge
        </Button>
      </CardContent>
    </Card>
  );
}
