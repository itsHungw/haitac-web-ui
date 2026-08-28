import { getCsrfToken } from '@/lib/utils/cookies';
import { ApiError } from './errors';
import type { ApiErrorResponse } from '@/types/api.types';

const BASE_API_URL = '/api';

export interface RequestOptions extends Omit<RequestInit, 'body'> {
  body?: unknown;
}

/**
 * Executes an HTTP request to the Next.js rewritten /api endpoints.
 * Automatically injects CSRF headers and attaches same-origin session credentials.
 */
async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, headers: customHeaders, ...restOptions } = options;

  const normalizedPath = path.startsWith('/') ? path.slice(1) : path;
  const url = `${BASE_API_URL}/${normalizedPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(customHeaders as Record<string, string>),
  };

  // Inject CSRF token if present
  const csrfToken = getCsrfToken();
  if (csrfToken) {
    headers['X-XSRF-TOKEN'] = csrfToken;
  }

  const fetchOptions: RequestInit = {
    method,
    headers,
    credentials: 'same-origin',
    ...restOptions,
  };

  if (body !== undefined && method !== 'GET' && method !== 'HEAD') {
    fetchOptions.body = JSON.stringify(body);
  }

  const response = await fetch(url, fetchOptions);

  // Handle 204 No Content
  if (response.status === 204) {
    return {} as T;
  }

  let responseData: unknown = {};
  const contentType = response.headers.get('content-type');
  if (contentType && contentType.includes('application/json')) {
    responseData = await response.json().catch(() => ({}));
  } else {
    const text = await response.text().catch(() => '');
    if (text) {
      try {
        responseData = JSON.parse(text);
      } catch {
        responseData = { message: text };
      }
    }
  }

  if (!response.ok) {
    const errorData = responseData as ApiErrorResponse;
    const errorMessage = errorData.error || errorData.message || `Lỗi ${response.status}: Yêu cầu thất bại`;
    throw new ApiError(response.status, errorMessage, errorData);
  }

  return responseData as T;
}

export const apiClient = {
  get: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'GET' }),

  post: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'POST', body }),

  patch: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PATCH', body }),

  put: <T>(path: string, body?: unknown, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'PUT', body }),

  delete: <T>(path: string, options?: RequestOptions) =>
    request<T>(path, { ...options, method: 'DELETE' }),
};
