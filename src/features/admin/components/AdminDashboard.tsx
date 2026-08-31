'use client';

import Link from 'next/link';
import { useAdminWorkspace } from './AdminShell';

const formatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

export function AdminDashboard() {
  const { overview, isLoading, refreshOverview } = useAdminWorkspace();

  const metrics = [
    { label: 'Đang trực tuyến', value: overview?.onlineAccounts, tone: 'green', note: 'phiên game hoạt động' },
    { label: 'Tổng tài khoản', value: overview?.totalAccounts, tone: 'navy', note: `${overview?.adminAccounts ?? 0} quản trị viên` },
    { label: 'Tạo mới hôm nay', value: overview?.createdToday, tone: 'amber', note: 'từ 00:00 giờ máy chủ' },
    { label: 'Đang bị khóa', value: overview?.lockedAccounts, tone: 'red', note: 'tài khoản cần xem xét' },
  ];

  return (
    <div className="admin-page admin-dashboard-page">
      <section className="admin-page-heading">
        <div>
          <span>TRUNG TÂM ĐIỀU HÀNH</span>
          <h1>Tổng quan hệ thống</h1>
          <p>Những chỉ số cần thiết để bắt đầu một ca vận hành.</p>
        </div>
        <button type="button" className="admin-secondary-button" onClick={() => void refreshOverview()} disabled={isLoading}>
          {isLoading ? 'Đang đồng bộ' : 'Làm mới dữ liệu'}
        </button>
      </section>

      <section className="admin-metric-strip" aria-busy={isLoading}>
        {metrics.map((metric) => (
          <article key={metric.label} className={`admin-metric is-${metric.tone}`}>
            <span>{metric.label}</span>
            <strong>{metric.value === undefined ? '—' : formatter.format(metric.value)}</strong>
            <small>{metric.note}</small>
          </article>
        ))}
      </section>

      <div className="admin-dashboard-grid">
        <section className="admin-panel admin-operations-panel">
          <div className="admin-panel-heading">
            <div><span>THAO TÁC NHANH</span><h2>Bắt đầu điều hành</h2></div>
          </div>
          <div className="admin-operation-list">
            <Link href="/admin/users">
              <span className="admin-operation-number">01</span>
              <div><strong>Quản lý người chơi</strong><p>Tìm kiếm, xem hồ sơ và xử lý trạng thái tài khoản.</p></div>
              <b>→</b>
            </Link>
            <Link href="/admin/audit">
              <span className="admin-operation-number">02</span>
              <div><strong>Kiểm tra nhật ký</strong><p>Đối soát thay đổi tài khoản, gift code và live operations.</p></div>
              <b>→</b>
            </Link>
            <Link href="/admin/economy">
              <span className="admin-operation-number">03</span>
              <div><strong>Đối soát kinh tế</strong><p>Theo dõi số dư và giao dịch nạp gần đây.</p></div>
              <b>→</b>
            </Link>
            <Link href="/admin/gift-codes">
              <span className="admin-operation-number">04</span>
              <div><strong>Điều hành gift code</strong><p>Tạo chiến dịch quà tặng và giới hạn người nhận.</p></div>
              <b>→</b>
            </Link>
            <Link href="/admin/live-operations">
              <span className="admin-operation-number">05</span>
              <div><strong>Live operations</strong><p>Phát thông báo hoặc chuyển chế độ bảo trì.</p></div>
              <b>→</b>
            </Link>
          </div>
        </section>

        <aside className="admin-panel admin-system-panel">
          <div className="admin-panel-heading">
            <div><span>KẾT NỐI</span><h2>Trạng thái nguồn dữ liệu</h2></div>
          </div>
          <dl>
            <div><dt><i className="is-ok" />Admin API</dt><dd>Phản hồi</dd></div>
            <div><dt><i className="is-ok" />Dữ liệu tài khoản</dt><dd>Đã tạo snapshot</dd></div>
            <div><dt><i className="is-wait" />Game server</dt><dd>Kiểm tra tại Live ops</dd></div>
          </dl>
          <p className="admin-system-time">
            Snapshot: {overview ? dateFormatter.format(new Date(overview.generatedAt)) : 'đang tải'}
          </p>
        </aside>
      </div>
    </div>
  );
}
