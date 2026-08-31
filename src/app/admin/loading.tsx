export default function AdminLoading() {
  return (
    <div className="admin-page admin-route-loading" role="status" aria-live="polite">
      <span className="sr-only">Đang mở màn hình quản trị…</span>
      <div className="admin-route-loading-hero" />
      <div className="admin-route-loading-grid">
        {Array.from({ length: 4 }).map((_, index) => <span key={index} />)}
      </div>
      <div className="admin-route-loading-body" />
    </div>
  );
}
