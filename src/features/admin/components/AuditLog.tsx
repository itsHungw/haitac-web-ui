'use client';

import { FormEvent, useEffect, useState } from 'react';
import { extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminAuditPage } from '../types/admin.types';
import { useAdminWorkspace } from './AdminShell';

const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'medium' });

function actionLabel(action: string) {
  if (action === 'ACCOUNT_LOCKED') return 'Khóa tài khoản';
  if (action === 'ACCOUNT_UNLOCKED') return 'Mở khóa tài khoản';
  if (action === 'GIFT_CODE_CREATED') return 'Tạo gift code';
  if (action === 'GIFT_CODE_UPDATED') return 'Cập nhật gift code';
  if (action === 'LIVE_OPERATION_QUEUED') return 'Gửi lệnh vận hành';
  if (action === 'UPDATE_PLAYER_BALANCE') return 'Điều chỉnh số dư';
  if (action === 'UPDATE_FASHION') return 'Cập nhật cải trang';
  if (action === 'BULK_UPDATE_FASHION') return 'Cập nhật cải trang hàng loạt';
  return action;
}

function actionIsDangerous(action: string) {
  return ['ACCOUNT_LOCKED', 'UPDATE_PLAYER_BALANCE', 'BULK_UPDATE_FASHION', 'MAINTENANCE_ON'].some((value) => action.includes(value));
}

function formatAuditData(value: string | null) {
  if (!value) return 'Không có dữ liệu';
  try {
    return JSON.stringify(JSON.parse(value), null, 2);
  } catch {
    return value;
  }
}

export function AuditLog() {
  const { handleAdminError } = useAdminWorkspace();
  const [queryInput, setQueryInput] = useState('');
  const [query, setQuery] = useState('');
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<AdminAuditPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    adminService.getAudit(query, page, 20)
      .then((data) => { if (active) setResult(data); })
      .catch((caught) => {
        if (!active || handleAdminError(caught)) return;
        setError(extractErrorMessage(caught, 'Không thể tải nhật ký quản trị.'));
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [handleAdminError, page, query, reloadKey]);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setQuery(queryInput.trim());
    setPage(0);
  }

  return (
    <div className="admin-page admin-audit-page">
      <section className="admin-page-heading">
        <div>
          <span>AN TOÀN / TRUY VẾT</span>
          <h1>Nhật ký quản trị</h1>
          <p>Lịch sử bất biến của thay đổi tài khoản, gift code và lệnh vận hành.</p>
        </div>
      </section>

      <section className="admin-filter-panel admin-audit-filter">
        <form onSubmit={handleSearch} className="admin-user-search">
          <label className="sr-only" htmlFor="audit-query">Tìm nhật ký</label>
          <span aria-hidden="true">⌕</span>
          <input id="audit-query" value={queryInput} onChange={(event) => setQueryInput(event.target.value)} placeholder="Tìm theo admin, tài khoản hoặc hành động..." maxLength={60} />
          <button type="submit">Tra cứu</button>
        </form>
      </section>

      <section className="admin-data-panel">
        {error && <div className="admin-inline-error" role="alert">{error}<button onClick={() => setReloadKey((v) => v + 1)}>Thử lại</button></div>}
        <div className="admin-audit-list">
          {isLoading ? Array.from({ length: 6 }).map((_, index) => <div className="admin-audit-skeleton" key={index}><span /></div>) : result?.entries.length ? result.entries.map((entry) => (
            <article className="admin-audit-entry" key={entry.id}>
              <div className={`admin-audit-mark ${actionIsDangerous(entry.action) ? 'is-danger' : 'is-success'}`} />
              <div className="admin-audit-event">
                <span>{actionLabel(entry.action)}</span>
                <h2>{entry.target}<small> · {entry.targetType}</small></h2>
                <p>{entry.reason}</p>
              </div>
              <dl>
                <div><dt>Thực hiện bởi</dt><dd>{entry.actor}</dd></div>
                <div><dt>Địa chỉ IP</dt><dd>{entry.ipAddress || '—'}</dd></div>
                <div><dt>Thời gian</dt><dd>{dateFormatter.format(new Date(entry.createdAt))}</dd></div>
              </dl>
              {(entry.beforeData || entry.afterData) && (
                <details className="admin-audit-payload">
                  <summary>Xem dữ liệu thay đổi</summary>
                  <div>
                    <section><h3>Trước</h3><pre>{formatAuditData(entry.beforeData)}</pre></section>
                    <section><h3>Sau</h3><pre>{formatAuditData(entry.afterData)}</pre></section>
                  </div>
                </details>
              )}
              <span className="admin-audit-id">#{entry.id}</span>
            </article>
          )) : <div className="admin-table-empty">Chưa có thao tác quản trị nào được ghi nhận.</div>}
        </div>
        <footer className="admin-pagination">
          <span>{result?.totalElements ?? 0} sự kiện · Trang {result && result.totalPages > 0 ? result.page + 1 : 0} / {result?.totalPages ?? 0}</span>
          <div>
            <button type="button" disabled={!result || result.page === 0 || isLoading} onClick={() => setPage((value) => Math.max(0, value - 1))}>← Trước</button>
            <button type="button" disabled={!result || result.page + 1 >= result.totalPages || isLoading} onClick={() => setPage((value) => value + 1)}>Sau →</button>
          </div>
        </footer>
      </section>
    </div>
  );
}
