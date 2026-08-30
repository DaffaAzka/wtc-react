import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Award, Loader2 } from "lucide-react";

interface EnrollmentConfirmationModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading?: boolean;
  trackTitle: string;
}

export function EnrollmentConfirmationModal({ open, onOpenChange, onConfirm, loading = false, trackTitle }: EnrollmentConfirmationModalProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-2xl max-w-md">
        <AlertDialogHeader>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-full bg-[#1c81ff]/10 flex items-center justify-center">
              <Award className="h-5 w-5 text-[#1c81ff]" />
            </div>
            <AlertDialogTitle className="text-xl font-extrabold tracking-tight text-gray-900 dark:text-white" style={{ letterSpacing: "-0.02em" }}>
              Konfirmasi Pengambilan Kelas
            </AlertDialogTitle>
          </div>
          <AlertDialogDescription asChild>
            <div className="space-y-3 text-left">
              <p className="text-[15px] leading-relaxed text-gray-600 dark:text-gray-300">
                Apakah Anda yakin ingin mengambil dan berkomitmen untuk menyelesaikan kelas <span className="font-bold text-gray-900 dark:text-white">"{trackTitle}"</span>?
              </p>
              <p className="text-[14px] leading-relaxed text-gray-500 dark:text-gray-400">Dengan mengambil kelas ini, Anda dapat mulai belajar dan melacak progres Anda.</p>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="gap-2 mt-2">
          <AlertDialogCancel disabled={loading} className="rounded-md px-4 py-3.5 border-[1.5px] border-gray-200 dark:border-white/20 font-bold">
            Batal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={loading}
            className="bg-[#1c81ff] px-4 py-3.5 text-white font-bold rounded-md hover:shadow-md hover:shadow-blue-500/20 hover:scale-[1.02] transition-transform"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                Memproses…
              </span>
            ) : (
              "Ya, Ambil Kelas"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
