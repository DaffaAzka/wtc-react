export type ApiResponse<T> = {
  data?: T;
  message?: string;
  errors?: Record<string, string[]>;
};

export type ApiListResponse<T> = {
  data: T[];
  message?: string;
};

export type PaginatedResponse<T> = {
  data: T[];
  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
  meta: {
    current_page: number;
    last_page: number;
    from: number | null;
    to: number | null;
    total: number;
    per_page: number;
  };
};

export type ApiErrorResponse = {
  message?: string;
  errors?: Record<string, string[]> | null;
};
