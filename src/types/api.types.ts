export interface ApiErrorResponse {
  success?: boolean;
  error?: string;
  message?: string;
  code?: string;
  status?: number;
  timestamp?: number | string;
}

export interface ApiResponse<T = unknown> {
  success?: boolean;
  data?: T;
  message?: string;
  error?: string;
}
