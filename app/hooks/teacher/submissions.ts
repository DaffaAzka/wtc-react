import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  teacherSubmissions,
  teacherSubmission,
  gradeSubmission,
} from "@/services/teacher";
import type {
  TeacherSubmissionFilters,
  GradeSubmissionRequest,
} from "@/types/teacher";
import type { ApiErrorResponse } from "@/types/response";
import { teacherKeys } from "./keys";

// ---------------------------------------------------------------------------
// Submissions
// ---------------------------------------------------------------------------

export function useTeacherSubmissions(filters?: TeacherSubmissionFilters) {
  return useQuery({
    queryKey: teacherKeys.submissions(filters),
    queryFn: () => teacherSubmissions(filters),
  });
}

export function useTeacherSubmission(id: number) {
  return useQuery({
    queryKey: teacherKeys.submission(id),
    queryFn: () => teacherSubmission(id),
    enabled: !!id,
  });
}

export function useGradeSubmission() {
  const queryClient = useQueryClient();
  return useMutation<
    Awaited<ReturnType<typeof gradeSubmission>>,
    ApiErrorResponse,
    { id: number; data: GradeSubmissionRequest }
  >({
    mutationFn: ({ id, data }) => gradeSubmission(id, data),
    onSuccess: (result) => {
      queryClient.invalidateQueries({
        queryKey: teacherKeys.submission(result.id),
      });
      queryClient.invalidateQueries({
        queryKey: ["teacher", "submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: teacherKeys.dashboard(),
      });
    },
  });
}
