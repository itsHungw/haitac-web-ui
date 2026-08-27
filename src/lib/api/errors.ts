import type { ApiErrorResponse } from '@/types/api.types';

export class ApiError extends Error {
  public readonly status: number;
  public readonly data?: ApiErrorResponse;

  constructor(status: number, message: string, data?: ApiErrorResponse) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
    Object.setPrototypeOf(this, ApiError.prototype);
  }
}

/**
 * Chuẩn hóa việc trích xuất thông báo lỗi hiển thị cho người dùng:
 * Ưu tiên: data.error -> data.message -> error.message -> HTTP status fallback -> fallbackMessage mặc định.
 */
export function extractErrorMessage(error: unknown, fallbackMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại sau.'): string {
  if (error instanceof ApiError) {
    if (error.data?.error && typeof error.data.error === 'string' && error.data.error.trim()) {
      return error.data.error.trim();
    }
    if (error.data?.message && typeof error.data.message === 'string' && error.data.message.trim()) {
      return error.data.message.trim();
    }
    if (error.message && error.message.trim() && !error.message.startsWith('Lỗi ')) {
      return error.message.trim();
    }

    // Status code fallback thân thiện
    switch (error.status) {
      case 400:
        return 'Thông tin gửi lên không hợp lệ. Vui lòng kiểm tra lại.';
      case 401:
        return 'Tên đăng nhập hoặc mật khẩu không chính xác.';
      case 403:
        return 'Tài khoản hiện đang bị khóa hoặc bạn không có quyền thực hiện thao tác này.';
      case 404:
        return 'Không tìm thấy tài nguyên hoặc đường dẫn yêu cầu.';
      case 409:
        return 'Dữ liệu đã tồn tại trong hệ thống.';
      case 429:
        return 'Bạn đã gửi yêu cầu quá nhanh. Vui lòng đợi trong giây lát.';
      case 500:
      case 502:
      case 503:
        return 'Hệ thống đang gặp sự cố gián đoạn. Vui lòng thử lại sau.';
      default:
        return fallbackMessage;
    }
  }

  if (error instanceof Error) {
    return error.message || fallbackMessage;
  }

  if (typeof error === 'string' && error.trim()) {
    return error.trim();
  }

  return fallbackMessage;
}
