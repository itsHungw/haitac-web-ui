'use client';

import { FormEvent, useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type {
  AdminPlayerDetail,
  AdminPlayerPage,
  AdminPlayerRole,
  AdminPlayerStatus,
} from '../types/admin.types';
import { useAdminWorkspace } from './AdminShell';

const numberFormatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', { dateStyle: 'medium', timeStyle: 'short' });

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : 'Chưa ghi nhận';
}

function playerStatus(player: { locked: boolean; online: boolean }) {
  if (player.locked) return { label: 'Đã khóa', className: 'is-locked' };
  if (player.online) return { label: 'Trực tuyến', className: 'is-online' };
  return { label: 'Ngoại tuyến', className: 'is-offline' };
}

export function UserManagement({ initialQuery = '' }: { initialQuery?: string }) {
  const router = useRouter();
  const { refreshOverview } = useAdminWorkspace();
  const [queryInput, setQueryInput] = useState(initialQuery);
  const [query, setQuery] = useState(initialQuery);
  const [role, setRole] = useState<AdminPlayerRole>('all');
  const [status, setStatus] = useState<AdminPlayerStatus>('all');
  const [page, setPage] = useState(0);
  const [result, setResult] = useState<AdminPlayerPage | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminPlayerDetail | null>(null);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [reason, setReason] = useState('');
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);

  const [editCoin, setEditCoin] = useState<string>('');
  const [editVnd, setEditVnd] = useState<string>('');
  const [balanceReason, setBalanceReason] = useState('');
  const [balanceMessage, setBalanceMessage] = useState<string | null>(null);
  const [balanceError, setBalanceError] = useState<string | null>(null);
  const [isMutatingBalance, setIsMutatingBalance] = useState(false);

  useEffect(() => {
    setQueryInput(initialQuery);
    setQuery(initialQuery);
    setPage(0);
  }, [initialQuery]);

  const handleAuthError = useCallback((caught: unknown) => {
    if (caught instanceof ApiError && caught.status === 401) {
      router.replace('/login');
      return true;
    }
    return false;
  }, [router]);

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    adminService.getPlayers({ q: query, role, status, page, size: 20 })
      .then((data) => { if (active) setResult(data); })
      .catch((caught) => {
        if (!active || handleAuthError(caught)) return;
        setError(extractErrorMessage(caught, 'Không thể tải danh sách người chơi.'));
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [handleAuthError, page, query, reloadKey, role, status]);

  useEffect(() => {
    if (!selectedUser) {
      setDetail(null);
      return;
    }
    let active = true;
    setIsLoadingDetail(true);
    setDetailError(null);
    setActionMessage(null);
    setReason('');
    setBalanceMessage(null);
    setBalanceError(null);
    setBalanceReason('');
    adminService.getPlayer(selectedUser)
      .then((data) => {
        if (active) {
          setDetail(data);
          setEditCoin(String(data.coin));
          setEditVnd(String(data.vnd));
        }
      })
      .catch((caught) => {
        if (!active || handleAuthError(caught)) return;
        setDetailError(extractErrorMessage(caught, 'Không thể tải hồ sơ người chơi.'));
      })
      .finally(() => { if (active) setIsLoadingDetail(false); });
    return () => { active = false; };
  }, [handleAuthError, selectedUser]);


  useEffect(() => {
    if (!selectedUser) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setSelectedUser(null);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [selectedUser]);

  function syncUrl(nextQuery: string) {
    const url = nextQuery ? `/admin/users?q=${encodeURIComponent(nextQuery)}` : '/admin/users';
    window.history.replaceState(null, '', url);
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const nextQuery = queryInput.trim();
    setQuery(nextQuery);
    setPage(0);
    syncUrl(nextQuery);
  }

  async function handleLockAction(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail || reason.trim().length < 3) {
      setDetailError('Lý do cần có ít nhất 3 ký tự.');
      return;
    }
    setIsMutating(true);
    setDetailError(null);
    setActionMessage(null);
    try {
      const updated = await adminService.updatePlayerLock(detail.user, {
        locked: !detail.locked,
        reason: reason.trim(),
      });
      setDetail(updated);
      setReason('');
      setActionMessage(updated.locked ? 'Đã khóa tài khoản và ghi nhật ký.' : 'Đã mở khóa tài khoản và ghi nhật ký.');
      setReloadKey((value) => value + 1);
      await refreshOverview();
    } catch (caught) {
      if (!handleAuthError(caught)) {
        setDetailError(extractErrorMessage(caught, 'Không thể cập nhật trạng thái tài khoản.'));
      }
    } finally {
      setIsMutating(false);
    }
  }

  async function handleBalanceSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!detail) return;
    if (balanceReason.trim().length < 3) {
      setBalanceError('Vui lòng nhập lý do điều chỉnh (ít nhất 3 ký tự).');
      return;
    }
    setIsMutatingBalance(true);
    setBalanceError(null);
    setBalanceMessage(null);
    try {
      const updated = await adminService.updatePlayerBalance(detail.user, {
        coin: Number(editCoin) >= 0 ? Number(editCoin) : undefined,
        vnd: Number(editVnd) >= 0 ? Number(editVnd) : undefined,
        reason: balanceReason.trim(),
      });
      setDetail(updated);
      setBalanceMessage('Đã cập nhật số dư thành công!');
      void refreshOverview();
    } catch (err) {
      setBalanceError(extractErrorMessage(err, 'Không thể cập nhật số dư.'));
    } finally {
      setIsMutatingBalance(false);
    }
  }


  return (
    <div className="admin-page admin-users-page">
      <section className="admin-page-heading admin-users-heading">
        <div>
          <span>NGƯỜI CHƠI / TÀI KHOẢN</span>
          <h1>Quản lý người chơi</h1>
          <p>Tra cứu hồ sơ, kiểm tra trạng thái và xử lý tài khoản có audit.</p>
        </div>
        <div className="admin-heading-count"><strong>{numberFormatter.format(result?.totalElements ?? 0)}</strong><span>kết quả</span></div>
      </section>

      <section className="admin-filter-panel">
        <form onSubmit={handleSearch} className="admin-user-search">
          <label className="sr-only" htmlFor="user-query">Tìm tài khoản hoặc email</label>
          <span aria-hidden="true">⌕</span>
          <input
            id="user-query"
            value={queryInput}
            onChange={(event) => setQueryInput(event.target.value)}
            placeholder="Tìm theo tên tài khoản hoặc email..."
            maxLength={60}
          />
          <button type="submit">Tìm kiếm</button>
        </form>
        <label>
          <span className="sr-only">Lọc theo quyền</span>
          <select value={role} onChange={(event) => { setRole(event.target.value as AdminPlayerRole); setPage(0); }}>
            <option value="all">Tất cả quyền</option>
            <option value="admin">Quản trị viên</option>
            <option value="player">Người chơi</option>
          </select>
        </label>
        <label>
          <span className="sr-only">Lọc theo trạng thái</span>
          <select value={status} onChange={(event) => { setStatus(event.target.value as AdminPlayerStatus); setPage(0); }}>
            <option value="all">Tất cả trạng thái</option>
            <option value="online">Trực tuyến</option>
            <option value="offline">Ngoại tuyến</option>
            <option value="locked">Đã khóa</option>
          </select>
        </label>
      </section>

      <section className="admin-data-panel">
        {error && <div className="admin-inline-error" role="alert">{error}<button onClick={() => setReloadKey((v) => v + 1)}>Thử lại</button></div>}
        <div className="admin-table-scroll">
          <table className="admin-user-table">
            <thead>
              <tr><th>Người chơi</th><th>Nhân vật</th><th>Quyền / VIP</th><th>Trạng thái</th><th>Ngày tạo</th><th><span className="sr-only">Thao tác</span></th></tr>
            </thead>
            <tbody>
              {isLoading ? Array.from({ length: 6 }).map((_, index) => (
                <tr className="admin-table-skeleton" key={index}><td colSpan={6}><span /></td></tr>
              )) : result?.players.length ? result.players.map((player) => {
                const state = playerStatus(player);
                return (
                  <tr key={player.id}>
                    <td>
                      <div className="admin-player-identity">
                        <span>{player.user.slice(0, 1).toUpperCase()}</span>
                        <div><strong>{player.user}</strong><small>{player.email || player.phone || 'Chưa có thông tin liên hệ'}</small></div>
                      </div>
                    </td>
                    <td><strong>{player.characterCount}</strong><small> nhân vật</small></td>
                    <td><span className={`admin-role-badge ${player.admin ? 'is-admin' : ''}`}>{player.admin ? 'ADMIN' : `VIP ${player.vip}`}</span></td>
                    <td><span className={`admin-state-badge ${state.className}`}>{state.label}</span></td>
                    <td>{formatDate(player.createdAt)}</td>
                    <td><button className="admin-manage-link" type="button" onClick={() => setSelectedUser(player.user)}>Quản lý</button></td>
                  </tr>
                );
              }) : (
                <tr><td colSpan={6}><div className="admin-table-empty">Không có tài khoản phù hợp với bộ lọc.</div></td></tr>
              )}
            </tbody>
          </table>
        </div>
        <footer className="admin-pagination">
          <span>Trang {result && result.totalPages > 0 ? result.page + 1 : 0} / {result?.totalPages ?? 0}</span>
          <div>
            <button type="button" disabled={!result || result.page === 0 || isLoading} onClick={() => setPage((value) => Math.max(0, value - 1))}>← Trước</button>
            <button type="button" disabled={!result || result.page + 1 >= result.totalPages || isLoading} onClick={() => setPage((value) => value + 1)}>Sau →</button>
          </div>
        </footer>
      </section>

      {selectedUser && (
        <div className="admin-drawer-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedUser(null); }}>
          <aside className="admin-player-drawer" role="dialog" aria-modal="true" aria-labelledby="player-detail-title">
            <header>
              <div><span>HỒ SƠ NGƯỜI CHƠI</span><h2 id="player-detail-title">{selectedUser}</h2></div>
              <button type="button" onClick={() => setSelectedUser(null)} aria-label="Đóng hồ sơ">×</button>
            </header>

            {isLoadingDetail ? <div className="admin-drawer-loading">Đang tải hồ sơ...</div> : detail ? (
              <div className="admin-drawer-body">
                <section className="admin-profile-lead">
                  <span className="admin-profile-avatar">{detail.user.slice(0, 1).toUpperCase()}</span>
                  <div><strong>{detail.user}</strong><p>{detail.email || 'Chưa cập nhật email'}</p></div>
                  <span className={`admin-state-badge ${playerStatus(detail).className}`}>{playerStatus(detail).label}</span>
                </section>

                <section className="admin-detail-section">
                  <h3>Tài khoản</h3>
                  <dl className="admin-detail-grid">
                    <div><dt>ID</dt><dd>#{detail.id}</dd></div>
                    <div><dt>Điện thoại</dt><dd>{detail.phone || '—'}</dd></div>
                    <div><dt>IP gần nhất</dt><dd>{detail.ipAddress || '—'}</dd></div>
                    <div><dt>Ngày tạo</dt><dd>{formatDate(detail.createdAt)}</dd></div>
                    <div><dt>Kích hoạt</dt><dd>{detail.activated ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</dd></div>
                    <div><dt>Quyền</dt><dd>{detail.admin ? 'Quản trị viên' : 'Người chơi'}</dd></div>
                  </dl>
                </section>

                <section className="admin-detail-section">
                  <h3>Kinh tế & nhân vật</h3>
                  <dl className="admin-detail-grid admin-economy-grid">
                    <div><dt>Coin</dt><dd>{numberFormatter.format(detail.coin)}</dd></div>
                    <div><dt>VIP</dt><dd>{numberFormatter.format(detail.vip)}</dd></div>
                    <div><dt>Tổng nạp</dt><dd>{numberFormatter.format(detail.totalTopUp)}</dd></div>
                    <div><dt>VND</dt><dd>{numberFormatter.format(detail.vnd)}</dd></div>
                  </dl>
                  <div className="admin-character-list">
                    {detail.characters.length ? detail.characters.map((character) => <span key={character}>{character}</span>) : <p>Chưa tạo nhân vật.</p>}
                  </div>
                </section>

                <section className="admin-detail-section" style={{ background: '#f8fafc', padding: '16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <h3 style={{ margin: '0 0 10px', fontSize: '13px', color: '#1e293b' }}>Điều chỉnh số dư (Coin / VND)</h3>
                  <form onSubmit={handleBalanceSubmit} style={{ display: 'grid', gap: '10px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <label style={{ fontSize: '11px', color: '#64748b' }}>
                        Coin (Ruby Web)
                        <input
                          type="number"
                          value={editCoin}
                          onChange={(e) => setEditCoin(e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px' }}
                        />
                      </label>
                      <label style={{ fontSize: '11px', color: '#64748b' }}>
                        VND Số dư
                        <input
                          type="number"
                          value={editVnd}
                          onChange={(e) => setEditVnd(e.target.value)}
                          style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px' }}
                        />
                      </label>
                    </div>
                    <label style={{ fontSize: '11px', color: '#64748b' }}>
                      Lý do điều chỉnh (ghi audit)
                      <input
                        type="text"
                        value={balanceReason}
                        onChange={(e) => setBalanceReason(e.target.value)}
                        placeholder="Ví dụ: Đền bù bảo trì, hỗ trợ người chơi..."
                        style={{ width: '100%', padding: '6px 8px', borderRadius: '6px', border: '1px solid #cbd5e1', fontSize: '12px', marginTop: '2px' }}
                        required
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isMutatingBalance}
                      style={{
                        padding: '8px 12px',
                        background: '#2563eb',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '12px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      {isMutatingBalance ? 'Đang lưu...' : '💾 Cập nhật số dư'}
                    </button>
                    {balanceMessage && <p style={{ margin: 0, fontSize: '11px', color: '#16a34a' }}>✨ {balanceMessage}</p>}
                    {balanceError && <p style={{ margin: 0, fontSize: '11px', color: '#dc2626' }}>⚠️ {balanceError}</p>}
                  </form>
                </section>

                <section className={`admin-account-action ${detail.locked ? 'is-unlock' : 'is-lock'}`}>
                  <div><span>{detail.locked ? 'MỞ LẠI QUYỀN TRUY CẬP' : 'HẠN CHẾ TÀI KHOẢN'}</span><h3>{detail.locked ? 'Mở khóa tài khoản' : 'Khóa tài khoản'}</h3></div>
                  {detail.admin ? <p className="admin-protected-note">Tài khoản quản trị được bảo vệ và không thể thay đổi tại đây.</p> : (
                    <form onSubmit={handleLockAction}>
                      <label htmlFor="lock-reason">Lý do bắt buộc</label>
                      <textarea id="lock-reason" value={reason} onChange={(event) => setReason(event.target.value)} maxLength={240} placeholder={detail.locked ? 'Ví dụ: Đã xác minh khiếu nại...' : 'Ví dụ: Phát hiện gian lận giao dịch...'} />
                      <button type="submit" disabled={isMutating}>{isMutating ? 'Đang xử lý...' : detail.locked ? 'Xác nhận mở khóa' : 'Xác nhận khóa tài khoản'}</button>
                    </form>
                  )}
                  {detailError && <p className="admin-action-error" role="alert">{detailError}</p>}
                  {actionMessage && <p className="admin-action-success" role="status">{actionMessage}</p>}
                </section>
              </div>
            ) : <div className="admin-drawer-loading">{detailError || 'Không thể hiển thị hồ sơ.'}</div>}
          </aside>
        </div>
      )}
    </div>
  );
}
