import type { Challenge } from "@/types/model";
import type { ChallengeContext } from "./challenge-manager";
import ChallengeCard from "./challenge-card";
import { useState } from "react";
import { useDeleteChallenge } from "@/hooks/challenges";
import { toast } from "sonner";
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
import ChallengeModalEdit from "./modal-edit";
import CodingAssignmentModalEdit from "./modal-edit-coding-assignment";
import ChallengeModalManage from "./modal-manage";

type Props = {
  challenges: Challenge[];
  context: ChallengeContext;
};

export default function ChallengeList({ challenges, context }: Props) {
  const deleteChallenge = useDeleteChallenge(
    context.type === 'lesson' ? context.id : undefined,
    context.type === 'module' ? context.slug : undefined
  );
  
  const [deleteDialog, setDeleteDialog] = useState<{
    challenge: Challenge | null;
    isOpen: boolean;
  }>({
    challenge: null,
    isOpen: false,
  });

  const [editModal, setEditModal] = useState<{
    challenge: Challenge | null;
    isOpen: boolean;
  }>({
    challenge: null,
    isOpen: false,
  });

  const [manageModal, setManageModal] = useState<{
    challenge: Challenge | null;
    isOpen: boolean;
  }>({
    challenge: null,
    isOpen: false,
  });

  const handleDelete = async () => {
    if (!deleteDialog.challenge) return;

    try {
      await deleteChallenge.mutateAsync(deleteDialog.challenge.id);
      toast.success("Challenge deleted successfully");
      setDeleteDialog({ challenge: null, isOpen: false });
    } catch (error) {
      toast.error("Failed to delete challenge");
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {challenges.map((challenge) => (
          <ChallengeCard
            key={challenge.id}
            challenge={challenge}
            onEdit={(challenge) => setEditModal({ challenge, isOpen: true })}
            onDelete={(challenge) => setDeleteDialog({ challenge, isOpen: true })}
            onManage={(challenge) => setManageModal({ challenge, isOpen: true })}
          />
        ))}
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={deleteDialog.isOpen}
        onOpenChange={(open) =>
          setDeleteDialog((prev) => ({ ...prev, isOpen: open }))
        }>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challenge</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteDialog.challenge?.title}"?
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteChallenge.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleteChallenge.isPending}
              className="bg-red-600 hover:bg-red-700">
              {deleteChallenge.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Edit Modal (Metadata Only) */}
      {editModal.challenge && (
        editModal.challenge.type === "file_upload" ? (
          <CodingAssignmentModalEdit
            key={`edit-${editModal.challenge.id}`}
            challenge={editModal.challenge}
            context={context}
            isOpen={editModal.isOpen}
            onOpenChange={(open) => setEditModal((prev) => ({ ...prev, isOpen: open }))}
          />
        ) : (
          <ChallengeModalEdit
            key={`edit-${editModal.challenge.id}`}
            challenge={editModal.challenge}
            context={context}
            isOpen={editModal.isOpen}
            onOpenChange={(open) => setEditModal((prev) => ({ ...prev, isOpen: open }))}
          />
        )
      )}

      {/* Manage Modal (Full Edit with Builder) */}
      {manageModal.challenge && (
        <ChallengeModalManage
          key={`manage-${manageModal.challenge.id}`}
          challenge={manageModal.challenge}
          isOpen={manageModal.isOpen}
          onOpenChange={(open) => setManageModal((prev) => ({ ...prev, isOpen: open }))}
        />
      )}
    </>
  );
}
