export type ApiResponse<T> = {
  data?: T;
  message?: string;
  error?: Record<string, string[]>;
};

export type ApiListResponse<T> = {
  data: T[];
  message?: string;
};
