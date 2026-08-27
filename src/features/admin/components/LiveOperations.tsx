'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminLiveOperation, LiveOperationStatus, LiveOperationType } from '../types/admin.types';

const date = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'short', timeStyle: 'medium' });
const typeLabel: Record<LiveOperationType, string> = { BROADCAST: 'Thông báo toàn server', MAINTENANCE_ON: 'Bật bảo trì', MAINTENANCE_OFF: 'Tắt bảo trì' };
const statusLabel: Record<LiveOperationStatus, string> = { PENDING: 'Đang chờ', PROCESSING: 'Đang xử lý', APPLIED: 'Đã áp dụng', FAILED: 'Thất bại' };

export function LiveOperations() {
  const [operations, setOperations] = useState<AdminLiveOperation[]>([]);
  const [type, setType] = useState<LiveOperationType>('BROADCAST');
  const [message, setMessage] = useState('');
  const [reason, setReason] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  async function load(silent = false) {
    if (!silent) setLoading(true);
    try { setOperations(await adminService.getLiveOperations()); setError(null); }
    catch (caught) { if (!silent) setError(extractErrorMessage(caught, 'Không thể tải hàng đợi vận hành.')); }
    finally { if (!silent) setLoading(false); }
  }
  useEffect(() => { void load(); const timer = window.setInterval(() => void load(true), 3000); return () => window.clearInterval(timer); }, []);

  const maintenanceState = useMemo(() => operations.find((item) => item.status === 'APPLIED' && (item.operationType === 'MAINTENANCE_ON' || item.operationType === 'MAINTENANCE_OFF'))?.operationType === 'MAINTENANCE_ON', [operations]);
  const dangerous = type !== 'BROADCAST';

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null); setSuccess(null);
    if (message.trim().length < 3 || reason.trim().length < 3) { setError('Thông báo và lý do cần có ít nhất 3 ký tự.'); return; }
    if (dangerous && confirmation !== 'XAC NHAN') { setError('Nhập XAC NHAN để thực hiện thay đổi chế độ truy cập.'); return; }
    setSaving(true);
    try {
      const created = await adminService.createLiveOperation(type, message.trim(), reason.trim());
      setOperations((current) => [created, ...current]); setReason(''); setConfirmation('');
      setSuccess(`Lệnh #${created.id} đã vào hàng đợi game server.`);
    } catch (caught) { setError(extractErrorMessage(caught, 'Không thể gửi lệnh vận hành.')); }
    finally { setSaving(false); }
  }

  return <div className="admin-page admin-live-page">
    <section className="admin-page-heading"><div><span>ĐIỀU HÀNH / THỜI GIAN THỰC</span><h1>Live operations</h1><p>Gửi lệnh có xác nhận đến tiến trình game server và theo dõi kết quả.</p></div><div className={`admin-live-signal ${maintenanceState ? 'is-maintenance' : ''}`}><span /> <strong>{maintenanceState ? 'ĐANG BẢO TRÌ' : 'ĐANG MỞ CỬA'}</strong></div></section>

    <section className="admin-live-command">
      <div className="admin-live-selector" role="group" aria-label="Loại lệnh">
        {(['BROADCAST', 'MAINTENANCE_ON', 'MAINTENANCE_OFF'] as LiveOperationType[]).map((item) => <button type="button" key={item} className={type === item ? 'is-active' : ''} onClick={() => { setType(item); setMessage(''); setConfirmation(''); setSuccess(null); setError(null); }}>{typeLabel[item]}<small>{item === 'BROADCAST' ? 'Gửi tới người đang online' : item === 'MAINTENANCE_ON' ? 'Chặn đăng nhập thường' : 'Cho phép đăng nhập lại'}</small></button>)}
      </div>
      <form onSubmit={submit} className={dangerous ? 'is-dangerous' : ''}>
        <div><span>LỆNH ĐANG SOẠN</span><h2>{typeLabel[type]}</h2><p>{dangerous ? 'Thay đổi này tác động đến quyền đăng nhập. Người đang online không bị ngắt kết nối.' : 'Thông báo được game server phát tới toàn bộ người chơi đang online.'}</p></div>
        <label>Nội dung gửi đến game<textarea value={message} onChange={(event) => setMessage(event.target.value)} maxLength={500} rows={4} placeholder={type === 'BROADCAST' ? 'Ví dụ: Sự kiện săn boss bắt đầu sau 10 phút.' : 'Ví dụ: Máy chủ tạm đóng đăng nhập để bảo trì.'} required /></label>
        <label>Lý do nội bộ<input value={reason} onChange={(event) => setReason(event.target.value)} maxLength={240} placeholder="Dùng cho nhật ký audit" required /></label>
        {dangerous && <label className="admin-live-confirm">Xác nhận thao tác nguy hiểm <small>Nhập chính xác XAC NHAN</small><input value={confirmation} onChange={(event) => setConfirmation(event.target.value)} placeholder="XAC NHAN" /></label>}
        {error && <p className="admin-action-error" role="alert">{error}</p>}{success && <p className="admin-action-success" role="status">{success}</p>}
        <button type="submit" disabled={saving}>{saving ? 'Đang gửi…' : 'Đưa lệnh vào hàng đợi'}</button>
      </form>
    </section>

    <section className="admin-data-panel admin-live-history">
      <header><div><span>GAME SERVER ACKNOWLEDGEMENT</span><h2>Lịch sử lệnh</h2></div><button type="button" onClick={() => void load()}>Làm mới</button></header>
      {loading ? <div className="admin-drawer-loading">Đang đọc hàng đợi…</div> : operations.length ? <div className="admin-live-timeline">{operations.map((item) => <article key={item.id}><span className={`admin-live-status is-${item.status.toLowerCase()}`}>{statusLabel[item.status]}</span><div><strong>#{item.id} · {typeLabel[item.operationType]}</strong><p>{item.message}</p><small>{item.requestedBy} · {date.format(new Date(item.createdAt))} · {item.reason}</small>{item.errorMessage && <em>{item.errorMessage}</em>}</div></article>)}</div> : <div className="admin-table-empty">Chưa có lệnh vận hành nào.</div>}
    </section>
  </div>;
}
