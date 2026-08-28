import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface SoftDeleteAlertProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  isPending?: boolean;
  onConfirm: () => void;
}

export default function SoftDeleteAlert({
  isOpen,
  onOpenChange,
  title,
  description,
  isPending = false,
  onConfirm,
}: SoftDeleteAlertProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Delete &ldquo;{title}&rdquo;?</AlertDialogTitle>
          <AlertDialogDescription>
            {description ??
              "This performs a soft delete. The record is archived and can be reviewed by an administrator. No restore option is available here."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={onConfirm}>
            {isPending ? "Deleting…" : "Soft delete"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
