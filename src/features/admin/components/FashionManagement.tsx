'use client';

import { FormEvent, useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { ApiError, extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminFashionItem } from '../types/admin.types';

const numberFormatter = new Intl.NumberFormat('vi-VN');

interface SavedGroup {
  name: string;
  ids: number[];
  createdAt: string;
}

export function FashionManagement() {
  const router = useRouter();
  const [items, setItems] = useState<AdminFashionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  // Filter & Search
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'for_sale' | 'locked'>('all');

  // Selected for Bulk Action
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [showBulkPriceModal, setShowBulkPriceModal] = useState(false);
  const [bulkPrice, setBulkPrice] = useState<string>('5000');
  const [isBulkSubmitting, setIsBulkSubmitting] = useState(false);

  // Edit Drawer
  const [editingItem, setEditingItem] = useState<AdminFashionItem | null>(null);
  const [editForm, setEditForm] = useState({
    name: '',
    icon: '0',
    info: '',
    mwear: '',
    op: '',
    price: '-1',
  });
  const [isSavingEdit, setIsSavingEdit] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Local Event Groups
  const [savedGroups, setSavedGroups] = useState<SavedGroup[]>([]);
  const [showGroupModal, setShowGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');

  // Load saved event groups from localStorage
  useEffect(() => {
    try {
      const stored = localStorage.getItem('htth_admin_fashion_groups');
      if (stored) {
        setSavedGroups(JSON.parse(stored));
      }
    } catch {
      // ignore
    }
  }, []);

  const saveGroupsToStorage = (groups: SavedGroup[]) => {
    setSavedGroups(groups);
    try {
      localStorage.setItem('htth_admin_fashion_groups', JSON.stringify(groups));
    } catch {
      // ignore
    }
  };

  const handleAuthError = useCallback((caught: unknown) => {
    if (caught instanceof ApiError && caught.status === 401) {
      router.replace('/login');
      return true;
    }
    return false;
  }, [router]);

  // Load Fashion Items from API
  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError(null);
    adminService.getFashionItems()
      .then((data) => {
        if (active) {
          setItems(data);
          setSelectedIds([]);
        }
      })
      .catch((caught) => {
        if (!active || handleAuthError(caught)) return;
        setError(extractErrorMessage(caught, 'Không thể tải danh sách cải trang.'));
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => { active = false; };
  }, [handleAuthError, reloadKey]);

  // Keyboard escape handler for drawers & modals
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setEditingItem(null);
        setShowBulkPriceModal(false);
        setShowGroupModal(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute stats
  const stats = useMemo(() => {
    const total = items.length;
    const forSale = items.filter((i) => i.price >= 0).length;
    const locked = total - forSale;
    return { total, forSale, locked, groupsCount: savedGroups.length };
  }, [items, savedGroups]);

  // Filter items
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const isForSale = item.price >= 0;
      if (statusFilter === 'for_sale' && !isForSale) return false;
      if (statusFilter === 'locked' && isForSale) return false;

      if (query.trim()) {
        const q = query.trim().toLowerCase();
        const matchId = String(item.id).includes(q);
        const matchName = item.name.toLowerCase().includes(q);
        const matchInfo = item.info ? item.info.toLowerCase().includes(q) : false;
        return matchId || matchName || matchInfo;
      }
      return true;
    });
  }, [items, query, statusFilter]);

  // Selection handlers
  const handleToggleAll = () => {
    if (selectedIds.length === filteredItems.length && filteredItems.length > 0) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const handleToggleItem = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Open Edit Drawer
  const handleOpenEdit = (item: AdminFashionItem) => {
    setEditingItem(item);
    setEditError(null);
    setEditForm({
      name: item.name,
      icon: String(item.icon),
      info: item.info || '',
      mwear: item.mwear || '',
      op: item.op || '',
      price: String(item.price),
    });
  };

  // Submit Edit Form
  const handleSubmitEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingItem) return;
    setEditError(null);
    setIsSavingEdit(true);
    try {
      const parsedPrice = parseInt(editForm.price, 10);
      const parsedIcon = parseInt(editForm.icon, 10);
      if (isNaN(parsedPrice) || parsedPrice < -1) {
        throw new Error('Giá bán không hợp lệ (-1: khóa bán, >= 0: giá bán).');
      }
      if (isNaN(parsedIcon) || parsedIcon < 0) {
        throw new Error('Icon ID không hợp lệ.');
      }
      if (!editForm.name.trim()) {
        throw new Error('Tên cải trang không được để trống.');
      }

      await adminService.updateFashion(editingItem.id, {
        name: editForm.name.trim(),
        icon: parsedIcon,
        info: editForm.info.trim(),
        mwear: editForm.mwear.trim(),
        op: editForm.op.trim(),
        price: parsedPrice,
      });

      setSuccessMessage(`Đã cập nhật thông tin cải trang #${editingItem.id} (${editForm.name.trim()}).`);
      setEditingItem(null);
      setReloadKey((k) => k + 1);
    } catch (caught) {
      setEditError(extractErrorMessage(caught, caught instanceof Error ? caught.message : 'Không thể lưu cải trang.'));
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Submit Bulk Update Price
  const handleSubmitBulkPrice = async (e: FormEvent) => {
    e.preventDefault();
    if (selectedIds.length === 0) return;
    setIsBulkSubmitting(true);
    try {
      const parsedPrice = parseInt(bulkPrice, 10);
      if (isNaN(parsedPrice) || parsedPrice < -1) {
        throw new Error('Giá bán không hợp lệ (-1: khóa bán, >= 0: giá bán).');
      }

      const res = await adminService.bulkUpdateFashionPrice({
        itemIds: selectedIds,
        price: parsedPrice,
      });

      setSuccessMessage(`Đã cập nhật giá bán thành công cho ${res.affectedCount} cải trang.`);
      setShowBulkPriceModal(false);
      setSelectedIds([]);
      setReloadKey((k) => k + 1);
    } catch (caught) {
      setError(extractErrorMessage(caught, caught instanceof Error ? caught.message : 'Không thể cập nhật hàng loạt.'));
    } finally {
      setIsBulkSubmitting(false);
    }
  };

  // Save new event group
  const handleSaveGroup = (e: FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim() || selectedIds.length === 0) return;
    const nextGroups: SavedGroup[] = [
      {
        name: newGroupName.trim(),
        ids: [...selectedIds],
        createdAt: new Date().toISOString(),
      },
      ...savedGroups,
    ];
    saveGroupsToStorage(nextGroups);
    setNewGroupName('');
    setSuccessMessage(`Đã lưu nhóm "${newGroupName.trim()}" (${selectedIds.length} cải trang).`);
  };

  // Apply a saved group to selection
  const handleApplyGroup = (group: SavedGroup) => {
    setSelectedIds(group.ids);
    setShowGroupModal(false);
    setSuccessMessage(`Đã chọn ${group.ids.length} cải trang từ nhóm "${group.name}".`);
  };

  // Delete a saved group
  const handleDeleteGroup = (index: number) => {
    const nextGroups = savedGroups.filter((_, i) => i !== index);
    saveGroupsToStorage(nextGroups);
  };

  return (
    <div className="admin-page admin-fashion-page">
      {/* 1. Heading */}
      <section className="admin-page-heading">
        <div>
          <span>LIVE OPS / SỰ KIỆN & VẬT PHẨM</span>
          <h1>Quản lý Cải trang</h1>
          <p>Thiết lập giá bán, điều chỉnh thông số và gom nhóm phát hành theo sự kiện.</p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => setShowGroupModal(true)}
          >
            Nhóm sự kiện ({savedGroups.length})
          </button>
          <button
            type="button"
            className="admin-secondary-button"
            onClick={() => setReloadKey((k) => k + 1)}
            disabled={isLoading}
          >
            {isLoading ? 'Đang đồng bộ…' : 'Làm mới dữ liệu'}
          </button>
        </div>
      </section>

      {/* 2. Metric Strip */}
      <section className="admin-metric-strip" aria-busy={isLoading}>
        <article className="admin-metric is-green">
          <span>ĐANG MỞ BÁN</span>
          <strong>{isLoading ? '—' : numberFormatter.format(stats.forSale)}</strong>
          <small>Có thể mua trong cửa hàng</small>
        </article>
        <article className="admin-metric is-red">
          <span>ĐANG KHÓA BÁN</span>
          <strong>{isLoading ? '—' : numberFormatter.format(stats.locked)}</strong>
          <small>Giá trị -1 (Tạm ngưng)</small>
        </article>
        <article className="admin-metric">
          <span>TỔNG CẢI TRANG</span>
          <strong>{isLoading ? '—' : numberFormatter.format(stats.total)}</strong>
          <small>Toàn bộ kho dữ liệu game</small>
        </article>
        <article className="admin-metric is-amber">
          <span>ĐỢT SỰ KIỆN ĐÃ LƯU</span>
          <strong>{numberFormatter.format(stats.groupsCount)}</strong>
          <small>Gom nhóm sự kiện cục bộ</small>
        </article>
      </section>

      {/* 3. Filter & Search Panel */}
      <section className="admin-filter-panel" style={{ gridTemplateColumns: 'minmax(280px, 1fr) 220px auto' }}>
        <div className="admin-user-search">
          <span aria-hidden="true">⌕</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo ID, tên cải trang hoặc chỉ số..."
            aria-label="Tìm cải trang"
          />
        </div>

        <label>
          <span className="sr-only">Lọc theo trạng thái bán</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'for_sale' | 'locked')}
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="for_sale">Đang mở bán (Giá &gt;= 0)</option>
            <option value="locked">Đang khóa bán (Giá = -1)</option>
          </select>
        </label>

        <button
          type="button"
          className="admin-secondary-button"
          onClick={() => setShowGroupModal(true)}
          style={{ height: '48px' }}
        >
          📂 Đợt sự kiện
        </button>
      </section>

      {/* Inline Feedback Messages */}
      {error && (
        <div className="admin-inline-error" role="alert" style={{ marginTop: '16px' }}>
          <span>{error}</span>
          <button type="button" onClick={() => setReloadKey((k) => k + 1)}>Thử lại</button>
        </div>
      )}
      {successMessage && (
        <div
          style={{
            marginTop: '16px',
            padding: '12px 18px',
            background: '#e4f6ee',
            border: '1px solid #b7ecd7',
            color: '#087455',
            borderRadius: '8px',
            fontSize: '11px',
            fontWeight: '700',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <span>✓ {successMessage}</span>
          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            style={{ border: 0, background: 'transparent', color: 'inherit', cursor: 'pointer', fontWeight: 800 }}
          >
            ×
          </button>
        </div>
      )}

      {/* 4. Data Panel & Table */}
      <section className="admin-data-panel">
        <div className="admin-table-scroll">
          <table className="admin-user-table">
            <thead>
              <tr>
                <th style={{ width: '48px', textAlign: 'center' }}>
                  <input
                    type="checkbox"
                    className="admin-fashion-checkbox"
                    checked={filteredItems.length > 0 && selectedIds.length === filteredItems.length}
                    onChange={handleToggleAll}
                    aria-label="Chọn tất cả"
                  />
                </th>
                <th style={{ width: '80px' }}>ID</th>
                <th style={{ width: '80px' }}>Icon</th>
                <th>Tên &amp; Thuộc tính Cải trang</th>
                <th style={{ width: '160px', textAlign: 'right' }}>Giá bán</th>
                <th style={{ width: '140px', textAlign: 'center' }}>Trạng thái</th>
                <th style={{ width: '100px', textAlign: 'right' }}>Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: 6 }).map((_, index) => (
                  <tr className="admin-table-skeleton" key={index}>
                    <td colSpan={7}><span /></td>
                  </tr>
                ))
              ) : filteredItems.length > 0 ? (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isForSale = item.price >= 0;
                  return (
                    <tr
                      key={item.id}
                      style={{ background: isSelected ? 'rgba(16, 23, 84, 0.03)' : undefined }}
                    >
                      <td style={{ textAlign: 'center' }}>
                        <input
                          type="checkbox"
                          className="admin-fashion-checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleItem(item.id)}
                          aria-label={`Chọn #${item.id}`}
                        />
                      </td>
                      <td>
                        <strong style={{ fontFamily: 'var(--font-mono)', color: 'var(--admin-navy)' }}>
                          #{item.id}
                        </strong>
                      </td>
                      <td>
                        <div className="admin-fashion-icon-badge">
                          {item.icon}
                        </div>
                      </td>
                      <td>
                        <div className="admin-fashion-item-lead">
                          <div>
                            <strong>{item.name}</strong>
                            <p title={item.info}>{item.info || 'Không có mô tả chi tiết'}</p>
                          </div>
                        </div>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        {isForSale ? (
                          <span className="admin-fashion-price is-for-sale">
                            {numberFormatter.format(item.price)} Beri
                          </span>
                        ) : (
                          <span className="admin-fashion-price is-locked">
                            —
                          </span>
                        )}
                      </td>
                      <td style={{ textAlign: 'center' }}>
                        <span className={`admin-state-badge ${isForSale ? 'is-online' : 'is-locked'}`}>
                          {isForSale ? 'Đang mở bán' : 'Đang khóa'}
                        </span>
                      </td>
                      <td style={{ textAlign: 'right' }}>
                        <button
                          type="button"
                          className="admin-manage-link"
                          onClick={() => handleOpenEdit(item)}
                        >
                          Chỉnh sửa
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7}>
                    <div className="admin-table-empty">
                      Không tìm thấy cải trang nào phù hợp với bộ lọc.
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <footer className="admin-pagination">
          <span>Hiển thị <strong>{filteredItems.length}</strong> / {items.length} cải trang</span>
          {selectedIds.length > 0 && (
            <span>Đã chọn <strong>{selectedIds.length}</strong> mục</span>
          )}
        </footer>
      </section>

      {/* 5. Sticky Floating Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="admin-fashion-bulk-bar" role="toolbar" aria-label="Thao tác hàng loạt">
          <div className="admin-fashion-bulk-count">
            <span>{selectedIds.length}</span> đã chọn
          </div>
          <button
            type="button"
            className="admin-fashion-bulk-btn is-primary"
            onClick={() => {
              setBulkPrice('5000');
              setShowBulkPriceModal(true);
            }}
          >
            ⚡ Đăng bán hàng loạt
          </button>
          <button
            type="button"
            className="admin-fashion-bulk-btn is-secondary"
            onClick={() => {
              setBulkPrice('-1');
              setShowBulkPriceModal(true);
            }}
          >
            🔒 Khóa bán ({selectedIds.length})
          </button>
          <button
            type="button"
            className="admin-fashion-bulk-btn is-secondary"
            onClick={() => setShowGroupModal(true)}
          >
            💾 Lưu thành nhóm
          </button>
          <button
            type="button"
            className="admin-fashion-bulk-btn is-danger"
            onClick={() => setSelectedIds([])}
          >
            Bỏ chọn
          </button>
        </div>
      )}

      {/* 6. Edit Item Drawer */}
      {editingItem && (
        <div
          className="admin-drawer-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setEditingItem(null);
          }}
        >
          <aside className="admin-player-drawer" role="dialog" aria-modal="true" aria-labelledby="fashion-edit-title">
            <header>
              <div>
                <span>CHỈNH SỬA CẢI TRANG #{editingItem.id}</span>
                <h2 id="fashion-edit-title">{editingItem.name}</h2>
              </div>
              <button type="button" onClick={() => setEditingItem(null)} aria-label="Đóng">×</button>
            </header>

            <div className="admin-drawer-body">
              <form onSubmit={handleSubmitEdit} style={{ display: 'grid', gap: '16px' }}>
                <label className="admin-account-action-label" style={{ display: 'grid', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--admin-navy)' }}>
                  Tên cải trang
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    required
                    style={{ padding: '10px 12px', border: '1px solid #d3d9e2', borderRadius: '7px', fontSize: '12px' }}
                  />
                </label>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                  <label style={{ display: 'grid', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--admin-navy)' }}>
                    Icon ID
                    <input
                      type="number"
                      min="0"
                      value={editForm.icon}
                      onChange={(e) => setEditForm({ ...editForm, icon: e.target.value })}
                      required
                      style={{ padding: '10px 12px', border: '1px solid #d3d9e2', borderRadius: '7px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    />
                  </label>
                  <label style={{ display: 'grid', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--admin-navy)' }}>
                    Giá bán (Beri) <small style={{ color: '#8895a8', fontWeight: 500 }}>-1 là khóa</small>
                    <input
                      type="number"
                      min="-1"
                      value={editForm.price}
                      onChange={(e) => setEditForm({ ...editForm, price: e.target.value })}
                      required
                      style={{ padding: '10px 12px', border: '1px solid #d3d9e2', borderRadius: '7px', fontSize: '12px', fontFamily: 'var(--font-mono)' }}
                    />
                  </label>
                </div>

                <label style={{ display: 'grid', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--admin-navy)' }}>
                  Mô tả chỉ số (Info)
                  <textarea
                    rows={4}
                    value={editForm.info}
                    onChange={(e) => setEditForm({ ...editForm, info: e.target.value })}
                    style={{ padding: '10px 12px', border: '1px solid #d3d9e2', borderRadius: '7px', fontSize: '12px', lineHeight: '1.5' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--admin-navy)' }}>
                  Mwear (Trang bị / Tọa độ part)
                  <input
                    type="text"
                    value={editForm.mwear}
                    onChange={(e) => setEditForm({ ...editForm, mwear: e.target.value })}
                    placeholder="[-1, 299, -1, 300, ...]"
                    style={{ padding: '10px 12px', border: '1px solid #d3d9e2', borderRadius: '7px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                  />
                </label>

                <label style={{ display: 'grid', gap: '6px', fontSize: '11px', fontWeight: 800, color: 'var(--admin-navy)' }}>
                  OP (Options chỉ số)
                  <input
                    type="text"
                    value={editForm.op}
                    onChange={(e) => setEditForm({ ...editForm, op: e.target.value })}
                    placeholder="[[1, 100], [13, 100], ...]"
                    style={{ padding: '10px 12px', border: '1px solid #d3d9e2', borderRadius: '7px', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                  />
                </label>

                {editError && (
                  <p className="admin-action-error" role="alert">{editError}</p>
                )}

                <div style={{ marginTop: '16px', display: 'flex', gap: '10px' }}>
                  <button
                    type="submit"
                    className="admin-gift-save"
                    style={{ flex: 1 }}
                    disabled={isSavingEdit}
                  >
                    {isSavingEdit ? 'Đang lưu…' : 'Lưu thay đổi'}
                  </button>
                  <button
                    type="button"
                    className="admin-secondary-button"
                    onClick={() => setEditingItem(null)}
                  >
                    Hủy
                  </button>
                </div>
              </form>
            </div>
          </aside>
        </div>
      )}

      {/* 7. Bulk Update Modal */}
      {showBulkPriceModal && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowBulkPriceModal(false);
          }}
        >
          <div className="admin-modal-card" role="dialog" aria-modal="true" aria-labelledby="bulk-price-title">
            <header>
              <span>THAO TÁC HÀNG LOẠT</span>
              <h2 id="bulk-price-title">Thiết lập giá {selectedIds.length} cải trang</h2>
              <p>Nhập số Beri để mở bán, hoặc nhập -1 để khóa toàn bộ danh sách đã chọn.</p>
            </header>
            <form onSubmit={handleSubmitBulkPrice}>
              <label style={{ display: 'grid', gap: '7px', fontSize: '11px', fontWeight: 800, color: 'var(--admin-navy)' }}>
                Giá bán mới (Beri)
                <input
                  type="number"
                  min="-1"
                  value={bulkPrice}
                  onChange={(e) => setBulkPrice(e.target.value)}
                  required
                  autoFocus
                  style={{
                    padding: '12px 14px',
                    border: '1px solid #c8d0da',
                    borderRadius: '8px',
                    fontSize: '15px',
                    fontFamily: 'var(--font-mono)',
                    fontWeight: 800,
                  }}
                />
              </label>

              <div className="admin-modal-actions">
                <button
                  type="button"
                  className="admin-modal-btn-cancel"
                  onClick={() => setShowBulkPriceModal(false)}
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="admin-modal-btn-submit"
                  disabled={isBulkSubmitting}
                >
                  {isBulkSubmitting ? 'Đang cập nhật…' : 'Xác nhận thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. Saved Groups Drawer / Modal */}
      {showGroupModal && (
        <div
          className="admin-modal-backdrop"
          role="presentation"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setShowGroupModal(false);
          }}
        >
          <div className="admin-modal-card" style={{ width: 'min(580px, calc(100% - 32px))' }} role="dialog" aria-modal="true" aria-labelledby="groups-title">
            <header>
              <span>QUẢN LÝ SỰ KIỆN</span>
              <h2 id="groups-title">Đợt phát hành sự kiện</h2>
              <p>Gom nhóm các cải trang theo sự kiện (Noel, Tết, Halloween) để chọn và đăng bán nhanh.</p>
            </header>

            <div style={{ padding: '24px' }}>
              {/* Form save group from current selection */}
              {selectedIds.length > 0 && (
                <form
                  onSubmit={handleSaveGroup}
                  style={{
                    marginBottom: '24px',
                    padding: '16px',
                    background: '#f5f7fb',
                    border: '1px solid #d9e0eb',
                    borderRadius: '10px',
                    display: 'grid',
                    gap: '10px',
                  }}
                >
                  <strong style={{ fontSize: '12px', color: 'var(--admin-navy)' }}>
                    Lưu {selectedIds.length} cải trang đang chọn thành nhóm mới:
                  </strong>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="Ví dụ: Sự kiện Noel 2026"
                      value={newGroupName}
                      onChange={(e) => setNewGroupName(e.target.value)}
                      required
                      style={{
                        flex: 1,
                        padding: '8px 12px',
                        border: '1px solid #cbd4e1',
                        borderRadius: '6px',
                        fontSize: '12px',
                      }}
                    />
                    <button
                      type="submit"
                      className="admin-modal-btn-submit"
                      style={{ padding: '0 16px', borderRadius: '6px' }}
                    >
                      Lưu
                    </button>
                  </div>
                </form>
              )}

              {/* List of saved groups */}
              <div style={{ display: 'grid', gap: '10px', maxHeight: '340px', overflowY: 'auto' }}>
                {savedGroups.length > 0 ? (
                  savedGroups.map((g, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '14px 16px',
                        border: '1px solid #e2e7ef',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <strong style={{ fontSize: '13px', color: 'var(--admin-navy)', display: 'block' }}>
                          {g.name}
                        </strong>
                        <small style={{ color: '#77869a', fontSize: '10px' }}>
                          {g.ids.length} cải trang (ID: {g.ids.slice(0, 5).join(', ')}{g.ids.length > 5 ? '…' : ''})
                        </small>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          type="button"
                          className="admin-secondary-button"
                          style={{ minHeight: '34px', padding: '0 12px', fontSize: '10px' }}
                          onClick={() => handleApplyGroup(g)}
                        >
                          Chọn nhóm này
                        </button>
                        <button
                          type="button"
                          style={{
                            minHeight: '34px',
                            padding: '0 10px',
                            border: '1px solid #f0ccd3',
                            borderRadius: '6px',
                            background: '#fff5f6',
                            color: 'var(--admin-red)',
                            cursor: 'pointer',
                            fontSize: '10px',
                            fontWeight: 700,
                          }}
                          onClick={() => handleDeleteGroup(idx)}
                          aria-label={`Xóa nhóm ${g.name}`}
                        >
                          Xóa
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div style={{ padding: '32px 0', textAlign: 'center', color: '#8896a7', fontSize: '11px' }}>
                    Chưa có nhóm sự kiện nào được lưu. Hãy tick chọn các cải trang ngoài danh sách và lưu thành đợt phát hành!
                  </div>
                )}
              </div>

              <div className="admin-modal-actions" style={{ marginTop: '20px' }}>
                <button
                  type="button"
                  className="admin-modal-btn-cancel"
                  onClick={() => setShowGroupModal(false)}
                >
                  Đóng
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
