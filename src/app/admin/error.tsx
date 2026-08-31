'use client';

import { useEffect } from 'react';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Admin workspace route error', error);
  }, [error]);

  return (
    <section className="admin-api-error" role="alert">
      <span>LỖI GIAO DIỆN QUẢN TRỊ</span>
      <h1>Không thể mở màn hình này</h1>
      <p>Dữ liệu an toàn, nhưng giao diện vừa gặp lỗi ngoài dự kiến. Hãy thử tải lại màn hình.</p>
      <button type="button" onClick={reset}>Thử lại</button>
    </section>
  );
}
