import type { Lesson } from "@/types/model";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Props = {
  lesson: Lesson;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
};

export default function ChallengeModalAdd({
  lesson,
  isOpen,
  onOpenChange,
}: Props) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Manage Challenge</DialogTitle>

          <DialogDescription className="space-y-4 pt-4">
            <div>
              <p className="text-sm text-muted-foreground">Lesson</p>
              <p className="font-medium">{lesson.title}</p>
            </div>

            <div className="rounded-md border p-4">
              <p className="text-sm text-muted-foreground">
                Challenge feature is under development.
              </p>
            </div>

            <div className="flex justify-end">
              <Button onClick={() => onOpenChange(false)}>Close</Button>
            </div>
          </DialogDescription>
        </DialogHeader>
      </DialogContent>
    </Dialog>
  );
}
