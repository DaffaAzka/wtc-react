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
import { Loader2 } from "lucide-react";

interface EnrollmentConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  trackTitle: string;
}

export function EnrollmentConfirmationModal({
  open,
  onOpenChange,
  onConfirm,
  loading = false,
  trackTitle,
}: EnrollmentConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Konfirmasi Pengambilan Kelas</AlertDialogTitle>
          <AlertDialogDescription className="space-y-3">
            <p>
              Apakah Anda yakin ingin mengambil dan berkomitmen untuk menyelesaikan kelas{" "}
              <span className="font-semibold text-foreground">"{trackTitle}"</span>?
            </p>
            <p className="text-sm text-muted-foreground">
              Dengan mengambil kelas ini, Anda dapat mulai belajar dan melacak progres Anda.
            </p>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={loading}>Batal</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Memproses...
              </>
            ) : (
              "Ya, Ambil Kelas"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
