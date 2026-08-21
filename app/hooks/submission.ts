import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmissionService } from "@/services/submission";
import type {
  Submission,
  SubmissionDetail,
  SubmissionCreateRequest,
  SubmissionUpdateRequest,
} from "@/types/submission";
import { toast } from "sonner";

// Query keys
export const submissionKeys = {
  all: ["submission"] as const,
  challengeSubmissions: (challengeId: number) => [...submissionKeys.all, "challenge", challengeId] as const,
  mySubmissions: (challengeId: number) => [...submissionKeys.all, "my", challengeId] as const,
  allMySubmissions: () => [...submissionKeys.all, "all-my"] as const,
  detail: (submissionId: number) => [...submissionKeys.all, "detail", submissionId] as const,
};

/**
 * Hook to get all submissions for a challenge (admin/instructor view)
 */
export function useSubmissions(challengeId: number) {
  return useQuery({
    queryKey: submissionKeys.challengeSubmissions(challengeId),
    queryFn: () => SubmissionService.getAll(challengeId),
    enabled: !!challengeId,
  });
}

/**
 * Hook to get student's own submissions for a specific challenge
 */
export function useMySubmissions(challengeId: number) {
  return useQuery({
    queryKey: submissionKeys.mySubmissions(challengeId),
    queryFn: () => SubmissionService.mySubmissions(challengeId),
    enabled: !!challengeId,
  });
}

/**
 * Hook to get all submissions for the authenticated user
 */
export function useAllMySubmissions() {
  return useQuery({
    queryKey: submissionKeys.allMySubmissions(),
    queryFn: () => SubmissionService.getAllMySubmissions(),
  });
}

/**
 * Hook to get a single submission by ID
 */
export function useSubmission(submissionId: number) {
  return useQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: () => SubmissionService.getById(submissionId),
    enabled: !!submissionId,
  });
}

/**
 * Hook to submit to a challenge
 */
export function useSubmitChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      challengeId,
      data,
    }: {
      challengeId: number;
      data: SubmissionCreateRequest;
    }) => SubmissionService.submit(challengeId, data),
    onSuccess: (_, variables) => {
      // Invalidate queries to refetch updated data
      queryClient.invalidateQueries({
        queryKey: submissionKeys.mySubmissions(variables.challengeId),
      });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.allMySubmissions(),
      });

      toast.success("Submission berhasil dikirim", {
        description: "Tugas Anda telah berhasil dikirim untuk dinilai.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal mengirim submission", {
        description: error.response?.data?.message || "Terjadi kesalahan saat mengirim tugas.",
      });
    },
  });
}

/**
 * Hook to update a submission (admin/instructor)
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      data,
    }: {
      submissionId: number;
      data: SubmissionUpdateRequest;
    }) => SubmissionService.update(submissionId, data),
    onSuccess: (data, variables) => {
      // Invalidate and refetch relevant queries
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detail(variables.submissionId),
      });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.allMySubmissions(),
      });

      toast.success("Submission berhasil diperbarui", {
        description: "Data submission telah diperbarui.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal memperbarui submission", {
        description: error.response?.data?.message || "Terjadi kesalahan saat memperbarui submission.",
      });
    },
  });
}

/**
 * Hook to delete a submission
 */
export function useDeleteSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (submissionId: number) => SubmissionService.delete(submissionId),
    onSuccess: () => {
      // Invalidate all submission queries
      queryClient.invalidateQueries({
        queryKey: submissionKeys.all,
      });

      toast.success("Submission berhasil dihapus", {
        description: "Submission telah dihapus dari sistem.",
      });
    },
    onError: (error: any) => {
      toast.error("Gagal menghapus submission", {
        description: error.response?.data?.message || "Terjadi kesalahan saat menghapus submission.",
      });
    },
  });
}

/**
 * Hook to get submission file download URL
 */
export function useGetSubmissionFile() {
  return useMutation({
    mutationFn: (submissionId: number) => SubmissionService.file(submissionId),
    onSuccess: (data) => {
      // Open the file URL in a new tab
      window.open(data.url, "_blank");
    },
    onError: (error: any) => {
      toast.error("Gagal mengambil file submission", {
        description: error.response?.data?.message || "Terjadi kesalahan saat mengambil file.",
      });
    },
  });
}
