'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useCallback, useEffect, useState } from 'react';
import { authService } from '@/features/auth/services/auth.service';
import { ApiError, extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminOverview, AdminPlayerSearchResult } from '../types/admin.types';

const numberFormatter = new Intl.NumberFormat('vi-VN');
const dateFormatter = new Intl.DateTimeFormat('vi-VN', {
  dateStyle: 'short',
  timeStyle: 'short',
});

function formatDate(value: string | null) {
  return value ? dateFormatter.format(new Date(value)) : 'Chưa ghi nhận';
}

export function AdminWorkspace() {
  const router = useRouter();
  const [overview, setOverview] = useState<AdminOverview | null>(null);
  const [overviewError, setOverviewError] = useState<string | null>(null);
  const [isLoadingOverview, setIsLoadingOverview] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [refreshLocked, setRefreshLocked] = useState(false);

  const [query, setQuery] = useState('');
  const [searchResult, setSearchResult] = useState<AdminPlayerSearchResult | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const loadOverview = useCallback(async () => {
    setIsLoadingOverview(true);
    setOverviewError(null);
    setRefreshLocked(true);

    try {
      const data = await adminService.getOverview();
      setOverview(data);
      setAccessDenied(false);
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace('/login');
        return;
      }
      if (error instanceof ApiError && error.status === 403) {
        setAccessDenied(true);
        return;
      }
      setOverviewError(extractErrorMessage(error, 'Không thể tải trung tâm vận hành.'));
    } finally {
      setIsLoadingOverview(false);
      window.setTimeout(() => setRefreshLocked(false), 10_000);
    }
  }, [router]);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = query.trim();
    if (!normalized) {
      setSearchError('Nhập tên tài khoản hoặc email cần tìm.');
      return;
    }

    setIsSearching(true);
    setSearchError(null);
    try {
      setSearchResult(await adminService.searchPlayers(normalized));
    } catch (error) {
      if (error instanceof ApiError && error.status === 401) {
        router.replace('/login');
        return;
      }
      if (error instanceof ApiError && error.status === 403) {
        setAccessDenied(true);
        return;
      }
      setSearchError(extractErrorMessage(error, 'Không thể tìm người chơi lúc này.'));
    } finally {
      setIsSearching(false);
    }
  }

  async function handleLogout() {
    await authService.logout().catch(() => undefined);
    router.replace('/');
    router.refresh();
  }

  if (accessDenied) {
    return (
      <main className="admin-gate">
        <div className="admin-gate__card">
          <span className="admin-kicker">MÃ TRẠNG THÁI 403</span>
          <h1>Khu vực giới hạn</h1>
          <p>Tài khoản hiện tại không có quyền truy cập trung tâm vận hành.</p>
          <Link href="/">Trở về trang chủ</Link>
        </div>
      </main>
    );
  }

  return (
    <div className="admin-workspace">
      <aside className="admin-rail">
        <Link className="admin-brand" href="/" aria-label="Về trang chủ Hải Tặc Tí Hon">
          <Image src="/images/logo.png" alt="" width={42} height={42} className="pixelated" />
          <span><strong>HTTH</strong><small>OPS CONSOLE</small></span>
        </Link>

        <nav className="admin-nav" aria-label="Điều hướng quản trị">
          <a className="is-active" href="#overview"><span>01</span>Tổng quan</a>
          <a href="#player-search"><span>02</span>Người chơi</a>
        </nav>

        <div className="admin-rail__future" aria-label="Các mô-đun dự kiến">
          <span>GIAI ĐOẠN SAU</span>
          <p>Kinh tế game</p>
          <p>Nhật ký thao tác</p>
          <p>Live operations</p>
        </div>

        <Link className="admin-rail__exit" href="/">← Trang game</Link>
      </aside>

      <main className="admin-main">
        <header className="admin-topbar">
          <div>
            <span className="admin-kicker">GAME OPERATIONS / READ ONLY</span>
            <h1>Đài chỉ huy</h1>
          </div>
          <div className="admin-user">
            <span className="admin-user__signal" aria-hidden="true" />
            <div><small>ĐANG ĐĂNG NHẬP</small><strong>{overview?.viewer ?? 'Đang xác minh...'}</strong></div>
            <button type="button" onClick={handleLogout}>Đăng xuất</button>
          </div>
        </header>

        <section id="overview" className="admin-section" aria-labelledby="overview-heading">
          <div className="admin-section__heading">
            <div>
              <span className="admin-kicker">TỔNG QUAN NHANH</span>
              <h2 id="overview-heading">Tình hình hôm nay</h2>
            </div>
            <button
              className="admin-refresh"
              type="button"
              onClick={() => void loadOverview()}
              disabled={isLoadingOverview || refreshLocked}
              title={refreshLocked ? 'Có thể làm mới sau 10 giây' : 'Làm mới số liệu'}
            >
              {isLoadingOverview ? 'Đang đồng bộ...' : refreshLocked ? 'Chờ 10 giây' : '↻ Làm mới'}
            </button>
          </div>

          {overviewError && (
            <div className="admin-alert" role="alert">
              <span>{overviewError}</span>
              <button type="button" onClick={() => void loadOverview()}>Thử lại</button>
            </div>
          )}

          <div className="admin-stat-grid" aria-busy={isLoadingOverview}>
            <article className="admin-stat admin-stat--online">
              <span>Đang trực tuyến</span>
              <strong>{overview ? numberFormatter.format(overview.onlineAccounts) : '—'}</strong>
              <small>Phiên game đang hoạt động</small>
            </article>
            <article className="admin-stat">
              <span>Tổng tài khoản</span>
              <strong>{overview ? numberFormatter.format(overview.totalAccounts) : '—'}</strong>
              <small>{overview ? `${numberFormatter.format(overview.adminAccounts)} quản trị viên` : 'Đang tải dữ liệu'}</small>
            </article>
            <article className="admin-stat admin-stat--new">
              <span>Tạo mới hôm nay</span>
              <strong>{overview ? numberFormatter.format(overview.createdToday) : '—'}</strong>
              <small>Tính từ 00:00 giờ máy chủ</small>
            </article>
            <article className="admin-stat admin-stat--warning">
              <span>Đang bị khóa</span>
              <strong>{overview ? numberFormatter.format(overview.lockedAccounts) : '—'}</strong>
              <small>Cần kiểm tra thủ công</small>
            </article>
          </div>

          <div className="admin-health-grid">
            <article>
              <div><span className="health-dot health-dot--ok" />Web API</div>
              <strong>{overview ? 'Phản hồi tốt' : 'Đang kiểm tra'}</strong>
              <small>Được xác nhận bởi request hiện tại</small>
            </article>
            <article>
              <div><span className="health-dot health-dot--ok" />MySQL</div>
              <strong>{overview ? 'Đã kết nối' : 'Đang kiểm tra'}</strong>
              <small>Chỉ đọc bảng accounts trong MVP</small>
            </article>
            <article>
              <div><span className="health-dot health-dot--idle" />Game server</div>
              <strong>Chưa kết nối probe</strong>
              <small>Sẽ bổ sung khi có nguồn health an toàn</small>
            </article>
          </div>

          {overview && (
            <p className="admin-snapshot-time">
              Snapshot lúc {formatDate(overview.generatedAt)} · không tự động làm mới
            </p>
          )}
        </section>

        <section id="player-search" className="admin-section admin-player-section" aria-labelledby="player-heading">
          <div className="admin-section__heading">
            <div>
              <span className="admin-kicker">TRA CỨU CÓ GIỚI HẠN</span>
              <h2 id="player-heading">Tìm người chơi</h2>
              <p>Chỉ truy vấn khi nhấn tìm và trả tối đa 20 tài khoản theo tiền tố.</p>
            </div>
          </div>

          <form className="admin-search" onSubmit={handleSearch}>
            <label htmlFor="admin-player-query">Tên tài khoản hoặc email</label>
            <div>
              <input
                id="admin-player-query"
                type="search"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Ví dụ: captain"
                maxLength={60}
                pattern="[a-zA-Z0-9@._\\-]+"
                autoComplete="off"
                disabled={isSearching}
              />
              <button type="submit" disabled={isSearching}>{isSearching ? 'Đang tìm...' : 'Tìm tài khoản'}</button>
            </div>
          </form>

          {searchError && <p className="admin-search-error" role="alert">{searchError}</p>}

          {searchResult && (
            <div className="admin-results">
              <div className="admin-results__meta">
                <span>{searchResult.players.length} kết quả cho “{searchResult.query}”</span>
                {searchResult.truncated && <small>Đã giới hạn 20 kết quả — nhập thêm ký tự để thu hẹp.</small>}
              </div>
              {searchResult.players.length === 0 ? (
                <div className="admin-empty">Không tìm thấy tài khoản phù hợp.</div>
              ) : (
                <div className="admin-table-wrap">
                  <table className="admin-table">
                    <thead><tr><th>Tài khoản</th><th>Trạng thái</th><th>Quyền</th><th>Ngày tạo</th></tr></thead>
                    <tbody>
                      {searchResult.players.map((player) => (
                        <tr key={player.user}>
                          <td><strong>{player.user}</strong></td>
                          <td>
                            <span className={`admin-status ${player.locked ? 'is-locked' : player.online ? 'is-online' : ''}`}>
                              {player.locked ? 'Đã khóa' : player.online ? 'Trực tuyến' : 'Ngoại tuyến'}
                            </span>
                          </td>
                          <td>{player.admin ? 'Quản trị viên' : 'Người chơi'}</td>
                          <td>{formatDate(player.createdAt)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
