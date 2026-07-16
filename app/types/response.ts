export type ApiResponse<T> = {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};

export type ApiListResponse<T> = {
  data: T[];
  message?: string;
};

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]> | null;
};
