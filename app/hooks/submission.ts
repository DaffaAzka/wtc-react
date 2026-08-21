import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmissionService } from "@/services/submission";
import type {
  Submission,
  SubmissionDetail,
<<<<<<< Updated upstream
  SubmissionCreateRequest,
  SubmissionUpdateRequest,
} from "@/types/submission";
=======
  ChallengeSubmissionsData,
  SubmitRequest,
  UpdateSubmissionRequest,
} from "@/services/submission";
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
 * Hook to get all submissions for a challenge (admin/instructor view)
 */
export function useSubmissions(challengeId: number) {
  return useQuery({
    queryKey: submissionKeys.challengeSubmissions(challengeId),
    queryFn: () => SubmissionService.getAll(challengeId),
=======
 * Hook to get all student submissions for a challenge (admin/instructor)
 */
export function useGetChallengeSubmissions(challengeId: number) {
  return useQuery({
    queryKey: submissionKeys.challengeSubmissions(challengeId),
    queryFn: () => SubmissionService.index(challengeId),
>>>>>>> Stashed changes
    enabled: !!challengeId,
  });
}

/**
<<<<<<< Updated upstream
 * Hook to get student's own submissions for a specific challenge
=======
 * Hook to submit a challenge
 */
export function useSubmitChallenge() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ challengeId, request }: { challengeId: number; request: SubmitRequest }) =>
      SubmissionService.store(challengeId, request),
    onSuccess: (data, variables) => {
      toast.success("Submission berhasil dikirim!");

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: submissionKeys.mySubmissions(variables.challengeId),
      });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.challengeSubmissions(variables.challengeId),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mengirim submission");
    },
  });
}

/**
 * Hook to get authenticated user's submissions for a challenge
>>>>>>> Stashed changes
 */
export function useMySubmissions(challengeId: number) {
  return useQuery({
    queryKey: submissionKeys.mySubmissions(challengeId),
    queryFn: () => SubmissionService.mySubmissions(challengeId),
    enabled: !!challengeId,
  });
}

/**
<<<<<<< Updated upstream
=======
 * Hook to get a single submission detail
 */
export function useGetSubmission(submissionId: number) {
  return useQuery({
    queryKey: submissionKeys.detail(submissionId),
    queryFn: () => SubmissionService.show(submissionId),
    enabled: !!submissionId,
  });
}

/**
 * Hook to update a submission (for grading/feedback)
 */
export function useUpdateSubmission() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      submissionId,
      request,
    }: {
      submissionId: number;
      request: UpdateSubmissionRequest;
    }) => SubmissionService.update(submissionId, request),
    onSuccess: (data) => {
      toast.success("Submission berhasil diupdate!");

      // Invalidate relevant queries
      queryClient.invalidateQueries({
        queryKey: submissionKeys.detail(data.id),
      });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.challengeSubmissions(data.challenge_id),
      });
      queryClient.invalidateQueries({
        queryKey: submissionKeys.mySubmissions(data.challenge_id),
      });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Gagal mengupdate submission");
    },
  });
}

/**
>>>>>>> Stashed changes
 * Hook to get all submissions for the authenticated user
 */
export function useAllMySubmissions() {
  return useQuery({
    queryKey: submissionKeys.allMySubmissions(),
    queryFn: () => SubmissionService.getAllMySubmissions(),
  });
}

/**
<<<<<<< Updated upstream
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
=======
>>>>>>> Stashed changes
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
<<<<<<< Updated upstream
      toast.error("Gagal mengambil file submission", {
        description: error.response?.data?.message || "Terjadi kesalahan saat mengambil file.",
      });
=======
      toast.error(error.response?.data?.message || "Gagal mengambil file submission");
>>>>>>> Stashed changes
    },
  });
}
