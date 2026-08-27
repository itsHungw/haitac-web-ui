'use client';

import { useEffect, useMemo, useState } from 'react';
import { extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminEconomy, AdminTransactionStatus } from '../types/admin.types';

const integer = new Intl.NumberFormat('vi-VN');
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const date = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'short' });

const statusLabel: Record<AdminTransactionStatus, string> = {
  success: 'Thành công', pending: 'Đang chờ', failed: 'Thất bại',
};

export function EconomyDashboard() {
  const [data, setData] = useState<AdminEconomy | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AdminTransactionStatus | 'all'>('all');

  function load() {
    setLoading(true); setError(null);
    adminService.getEconomy()
      .then(setData)
      .catch((caught) => setError(extractErrorMessage(caught, 'Không thể tải dữ liệu kinh tế.')))
      .finally(() => setLoading(false));
  }

  useEffect(load, []);
  const transactions = useMemo(() => data?.recentTransactions.filter((item) => filter === 'all' || item.status === filter) ?? [], [data, filter]);

  return (
    <div className="admin-page admin-economy-page">
      <section className="admin-page-heading">
        <div><span>KINH TẾ / DÒNG TIỀN</span><h1>Kinh tế game</h1><p>Theo dõi tiền trong game và giao dịch nạp từ dữ liệu gốc.</p></div>
        <button className="admin-secondary-button" type="button" onClick={load} disabled={loading}>{loading ? 'Đang tải…' : 'Làm mới dữ liệu'}</button>
      </section>

      {error && <div className="admin-inline-error" role="alert">{error}<button onClick={load}>Thử lại</button></div>}
      <section className="admin-economy-ledger" aria-label="Chỉ số kinh tế">
        <article><span>Coin lưu hành</span><strong>{data ? integer.format(data.circulatingCoin) : '—'}</strong><small>Tổng số dư tài khoản</small></article>
        <article><span>VND trong ví</span><strong>{data ? integer.format(data.circulatingVnd) : '—'}</strong><small>Số dư chưa sử dụng</small></article>
        <article><span>Nạp hôm nay</span><strong>{data ? money.format(data.topUpToday) : '—'}</strong><small>Giao dịch thành công</small></article>
        <article><span>7 ngày gần nhất</span><strong>{data ? money.format(data.topUpLastSevenDays) : '—'}</strong><small>{integer.format(data?.successfulTransactions ?? 0)} giao dịch thành công</small></article>
      </section>

      <section className="admin-data-panel admin-economy-history">
        <header>
          <div><span>ĐỐI SOÁT</span><h2>Giao dịch gần đây</h2></div>
          <label><span className="sr-only">Lọc trạng thái giao dịch</span><select value={filter} onChange={(event) => setFilter(event.target.value as typeof filter)}><option value="all">Tất cả trạng thái</option><option value="success">Thành công</option><option value="pending">Đang chờ</option><option value="failed">Thất bại</option></select></label>
        </header>
        <div className="admin-table-scroll"><table className="admin-user-table admin-economy-table">
          <thead><tr><th>Mã</th><th>Tài khoản</th><th>Kênh nạp</th><th>Số tiền</th><th>Trạng thái</th><th>Thời gian</th></tr></thead>
          <tbody>{loading ? Array.from({ length: 6 }).map((_, i) => <tr className="admin-table-skeleton" key={i}><td colSpan={6}><span /></td></tr>) : transactions.length ? transactions.map((item) => <tr key={`${item.source}-${item.id}`}><td><strong>#{item.id}</strong></td><td><strong>{item.username}</strong></td><td><span className="admin-source-badge">{item.provider || item.source}</span></td><td><strong>{money.format(item.amount)}</strong></td><td><span className={`admin-transaction-state is-${item.status}`}>{statusLabel[item.status]}</span></td><td>{date.format(new Date(item.createdAt))}</td></tr>) : <tr><td colSpan={6}><div className="admin-table-empty">Chưa có giao dịch phù hợp.</div></td></tr>}</tbody>
        </table></div>
        <footer className="admin-economy-foot"><span>{integer.format(data?.pendingTransactions ?? 0)} giao dịch đang chờ</span><small>Dữ liệu từ napthe và trans_log · Không hiển thị serial hoặc mã thẻ</small></footer>
      </section>
    </div>
  );
}
