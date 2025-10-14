export type PaginatedResponse<T = unknown> = {
  data: T[];
  page: number;
  totalPages: number;
  totalItems: number;
  hasNext: boolean;
  hasPrev: boolean;
  limit: number;
};

export type ErrorResponse = {
  message: string;
  code?: number;
  details?: Record<string, unknown>;
  timestamp?: string;
  path?: string;
};

export type SuccessResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
  meta?: {
    page?: number;
    total?: number;
    limit?: number;
  };
};

export type ApiResponse<T = unknown> = SuccessResponse<T> | ErrorResponse;

export type QueryParams = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  [key: string]: string | number | boolean | undefined;
};

export type UploadResponse = {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
};