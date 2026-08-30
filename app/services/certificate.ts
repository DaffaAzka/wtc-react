import { api } from "@/lib/axios";
import type { ApiResponse, PaginatedResponse } from "@/types/response";
import type { Certificate, CertificateTemplate, VerifyResponse } from "@/types/certificate";

export type AdminCertificateParams = {
  page?: number;
  per_page?: number;
  track_id?: number;
  profile_search?: string;
};

export const CertificateService = {
  getStudentCertificates: async (): Promise<Certificate[]> => {
    const res = await api.get<{ data: Certificate[] }>("/student/certificates");
    return res.data.data;
  },

  downloadCertificate: async (id: string): Promise<{ url: string }> => {
    const res = await api.get<{ success: boolean; data: { url: string } }>(`/student/certificates/${id}/download`);
    return res.data.data;
  },

  updateCertificate: async (id: string): Promise<void> => {
    await api.post(`/student/certificates/${id}/update`);
  },

  submitFeedback: async (id: string, message: string): Promise<void> => {
    await api.post(`/student/certificates/${id}/feedback`, { message });
  },

  verifyCertificate: async (code: string): Promise<VerifyResponse> => {
    const res = await api.get<VerifyResponse>(`/public/verify/${code}`);
    return res.data;
  },

  getTemplate: async (): Promise<CertificateTemplate> => {
    const res = await api.get<ApiResponse<CertificateTemplate>>("/certificate-template");
    return res.data.data!;
  },

  saveTemplate: async (data: CertificateTemplate): Promise<CertificateTemplate> => {
    const res = await api.post<ApiResponse<CertificateTemplate>>("/admin/certificate-template", data);
    return res.data.data!;
  },

  getAdminCertificates: async (
    params?: AdminCertificateParams,
  ): Promise<PaginatedResponse<Certificate>> => {
    const res = await api.get<PaginatedResponse<Certificate>>("/admin/certificates", { params });
    return res.data;
  },

  getProfileCertificates: async (profileId: string): Promise<Certificate[]> => {
    const res = await api.get<{ data: Certificate[] }>(`/admin/certificates/profile/${profileId}`);
    return res.data.data;
  },
};
