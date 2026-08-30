import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { CertificateService, type AdminCertificateParams } from "@/services/certificate";
import type { Certificate, CertificateTemplate } from "@/types/certificate";
import type { ApiErrorResponse, PaginatedResponse } from "@/types/response";

export const certificateKeys = {
  all: ["certificates"] as const,
  student: () => ["certificates", "student"] as const,
  admin: (params?: AdminCertificateParams) => ["certificates", "admin", params] as const,
  profile: (profileId: string) => ["certificates", "profile", profileId] as const,
  template: () => ["certificates", "template"] as const,
  verify: (code: string) => ["certificates", "verify", code] as const,
};

export function useStudentCertificates() {
  const query = useQuery<Certificate[], ApiErrorResponse>({
    queryKey: certificateKeys.student(),
    queryFn: () => CertificateService.getStudentCertificates(),
  });
  return {
    certificates: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useUpdateCertificate() {
  const queryClient = useQueryClient();
  return useMutation<void, ApiErrorResponse, string>({
    mutationFn: (id) => CertificateService.updateCertificate(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.student() });
    },
  });
}

export function useSubmitFeedback() {
  return useMutation<void, ApiErrorResponse, { id: string; message: string }>({
    mutationFn: ({ id, message }) => CertificateService.submitFeedback(id, message),
  });
}

export function useVerifyCertificate(code: string) {
  const query = useQuery({
    queryKey: certificateKeys.verify(code),
    queryFn: () => CertificateService.verifyCertificate(code),
    enabled: !!code,
    retry: false,
  });
  return {
    result: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
  };
}

export function useCertificateTemplate() {
  const query = useQuery<CertificateTemplate, ApiErrorResponse>({
    queryKey: certificateKeys.template(),
    queryFn: () => CertificateService.getTemplate(),
  });
  return {
    template: query.data ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useSaveTemplate() {
  const queryClient = useQueryClient();
  return useMutation<CertificateTemplate, ApiErrorResponse, CertificateTemplate>({
    mutationFn: (data) => CertificateService.saveTemplate(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: certificateKeys.template() });
    },
  });
}

export function useAdminCertificates(params?: AdminCertificateParams) {
  const query = useQuery<PaginatedResponse<Certificate>, ApiErrorResponse>({
    queryKey: certificateKeys.admin(params),
    queryFn: () => CertificateService.getAdminCertificates(params),
  });
  return {
    certificates: query.data?.data ?? [],
    pagination: query.data?.meta ?? null,
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}

export function useProfileCertificates(profileId: string) {
  const query = useQuery<Certificate[], ApiErrorResponse>({
    queryKey: certificateKeys.profile(profileId),
    queryFn: () => CertificateService.getProfileCertificates(profileId),
    enabled: !!profileId,
  });
  return {
    certificates: query.data ?? [],
    loading: query.isLoading,
    error: query.error ?? null,
    refresh: query.refetch,
  };
}
