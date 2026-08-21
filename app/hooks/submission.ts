import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubmissionService } from "@/services/submission";
import type {
  Submission,
  SubmissionDetail,
  ChallengeSubmissionsData,
  SubmitRequest,
  UpdateSubmissionRequest,
} from "@/services/submission";
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
 * Hook to get all student submissions for a challenge (admin/instructor)
 */
export function useGetChallengeSubmissions(challengeId: number) {
  return useQuery({
    queryKey: submissionKeys.challengeSubmissions(challengeId),
    queryFn: () => SubmissionService.index(challengeId),
    enabled: !!challengeId,
  });
}

/**
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
 */
export function useMySubmissions(challengeId: number) {
  return useQuery({
    queryKey: submissionKeys.mySubmissions(challengeId),
    queryFn: () => SubmissionService.mySubmissions(challengeId),
    enabled: !!challengeId,
  });
}

/**
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
 * Hook to get all submissions for the authenticated user
 */
export function useAllMySubmissions() {
  return useQuery({
    queryKey: submissionKeys.allMySubmissions(),
    queryFn: () => SubmissionService.getAllMySubmissions(),
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
      toast.error(error.response?.data?.message || "Gagal mengambil file submission");
    },
  });
}
