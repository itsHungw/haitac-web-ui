'use client';

import { useEffect, useMemo, useState } from 'react';
import { extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminFashionItem } from '../types/admin.types';

const STATUS_TABS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'FOR_SALE', label: 'Đang mở bán' },
  { key: 'LOCKED', label: 'Đang khóa' },
];

export function FashionManagement() {
  const [items, setItems] = useState<AdminFashionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [bulkPriceInput, setBulkPriceInput] = useState<number>(5000);
  const [showBulkModal, setShowBulkModal] = useState(false);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getFashionItems();
      setItems(data);
      setSelectedIds([]);
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể tải danh sách cải trang.'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadData();
  }, []);

  const stats = useMemo(() => {
    const total = items.length;
    const forSale = items.filter((i) => i.isForSale).length;
    const locked = total - forSale;
    return { total, forSale, locked };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const matchSearch =
        searchQuery.trim() === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.info.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(item.id).includes(searchQuery);

      if (!matchSearch) return false;

      if (activeTab === 'ALL') return true;
      if (activeTab === 'FOR_SALE') return item.isForSale;
      if (activeTab === 'LOCKED') return !item.isForSale;
      return true;
    });
  }, [items, activeTab, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map((i) => i.id));
    }
  };

  const toggleSelect = (id: number) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  async function handleToggleSingle(item: AdminFashionItem) {
    const targetPrice = item.isForSale ? -1 : 5000;
    setActionLoading(`item-${item.id}`);
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminService.updateFashionPrice(item.id, targetPrice);
      setItems((prev) => prev.map((i) => (i.id === item.id ? updated : i)));
      setSuccess(`Đã ${targetPrice >= 0 ? 'mở bán' : 'khóa bán'} trang phục "${item.name}".`);
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể cập nhật trạng thái trang phục.'));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleBulkUpdate(price: number) {
    if (selectedIds.length === 0) return;
    setActionLoading('bulk-update');
    setError(null);
    setSuccess(null);
    try {
      const res = await adminService.bulkUpdateFashionPrice({
        itemIds: selectedIds,
        price: price,
      });
      setSuccess(`Đã cập nhật giá bán thành công cho ${res.affectedCount} trang phục.`);
      setShowBulkModal(false);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể cập nhật hàng loạt.'));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="admin-page admin-fashion-page" style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <section className="admin-page-heading" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ fontSize: '12px', fontWeight: 700, color: '#e11d48', letterSpacing: '1px' }}>LIVE OPERATIONS / CẢI TRANG</span>
          <h1 style={{ margin: '8px 0', fontSize: '28px', color: '#0f172a' }}>Quản lý Cải Trang</h1>
          <p style={{ margin: 0, color: '#64748b', fontSize: '14px' }}>Tìm kiếm, chọn lọc và định giá mở bán các bộ Cải trang trực tiếp trên Game Server.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ padding: '12px 20px', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}>
            <small style={{ color: '#64748b', fontSize: '11px', display: 'block', fontWeight: 700, letterSpacing: '0.5px' }}>TỔNG SỐ</small>
            <strong style={{ fontSize: '24px', color: '#0f172a' }}>{stats.total}</strong>
          </div>
          <div style={{ padding: '12px 20px', background: '#f0fdf4', borderRadius: '16px', border: '1px solid #bbf7d0', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(22, 163, 74, 0.1)' }}>
            <small style={{ color: '#16a34a', fontSize: '11px', display: 'block', fontWeight: 700, letterSpacing: '0.5px' }}>ĐANG MỞ BÁN</small>
            <strong style={{ fontSize: '24px', color: '#15803d' }}>{stats.forSale}</strong>
          </div>
          <div style={{ padding: '12px 20px', background: '#fef2f2', borderRadius: '16px', border: '1px solid #fecaca', textAlign: 'center', boxShadow: '0 4px 6px -1px rgba(220, 38, 38, 0.1)' }}>
            <small style={{ color: '#dc2626', fontSize: '11px', display: 'block', fontWeight: 700, letterSpacing: '0.5px' }}>ĐANG KHÓA</small>
            <strong style={{ fontSize: '24px', color: '#b91c1c' }}>{stats.locked}</strong>
          </div>
        </div>
      </section>

      {error && (
        <div style={{ padding: '16px 20px', background: '#fef2f2', borderLeft: '4px solid #ef4444', borderRadius: '8px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 4px rgba(239, 68, 68, 0.1)' }}>
          <span style={{ fontSize: '20px' }}>⚠️</span>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>Có lỗi xảy ra</strong>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>{error}</span>
          </div>
        </div>
      )}
      {success && (
        <div style={{ padding: '16px 20px', background: '#f0fdf4', borderLeft: '4px solid #22c55e', borderRadius: '8px', color: '#166534', display: 'flex', alignItems: 'center', gap: '12px', boxShadow: '0 2px 4px rgba(34, 197, 94, 0.1)' }}>
          <span style={{ fontSize: '20px' }}>✨</span>
          <div>
            <strong style={{ display: 'block', fontSize: '14px', marginBottom: '2px' }}>Thành công</strong>
            <span style={{ fontSize: '13px', opacity: 0.9 }}>{success}</span>
          </div>
        </div>
      )}

      {/* Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div
          style={{
            position: 'sticky',
            top: '24px',
            zIndex: 50,
            background: '#0f172a',
            color: '#fff',
            padding: '16px 24px',
            borderRadius: '16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3), 0 8px 10px -6px rgba(0, 0, 0, 0.2)',
            border: '1px solid #1e293b',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: '#3b82f6', color: '#fff', width: '32px', height: '32px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '14px' }}>
              {selectedIds.length}
            </div>
            <div>
              <span style={{ fontSize: '15px', fontWeight: 600, display: 'block' }}>Mục đã chọn</span>
              <span style={{ color: '#94a3b8', fontSize: '12px' }}>Có thể thực hiện thao tác hàng loạt</span>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={() => handleBulkUpdate(-1)}
              disabled={actionLoading !== null}
              style={{
                padding: '10px 18px',
                background: '#334155',
                color: '#f87171',
                border: '1px solid #475569',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#475569')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#334155')}
            >
              {actionLoading === 'bulk-update' ? 'Đang xử lý...' : 'Khóa bán tất cả (-1)'}
            </button>
            <button
              onClick={() => setShowBulkModal(true)}
              disabled={actionLoading !== null}
              style={{
                padding: '10px 18px',
                background: '#3b82f6',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 600,
                fontSize: '13px',
                cursor: 'pointer',
                boxShadow: '0 4px 6px -1px rgba(59, 130, 246, 0.3)',
                transition: 'all 0.2s',
              }}
              onMouseOver={(e) => (e.currentTarget.style.background = '#2563eb')}
              onMouseOut={(e) => (e.currentTarget.style.background = '#3b82f6')}
            >
              Thiết lập giá mở bán...
            </button>
          </div>
        </div>
      )}

      <section className="admin-data-panel" style={{ background: '#fff', borderRadius: '16px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <header style={{ padding: '20px 24px', borderBottom: '1px solid #e2e8f0', background: '#f8fafc', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '8px' }}>
            {STATUS_TABS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  background: activeTab === tab.key ? '#0f172a' : 'transparent',
                  color: activeTab === tab.key ? '#fff' : '#475569',
                  fontSize: '13px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = '#f1f5f9' }}
                onMouseOut={(e) => { if (activeTab !== tab.key) e.currentTarget.style.background = 'transparent' }}
              >
                {tab.label}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => void loadData()}
              disabled={loading}
              style={{
                padding: '9px 16px',
                background: '#fff',
                color: '#334155',
                border: '1px solid #cbd5e1',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: '13px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
              }}
            >
              {loading ? 'Đang tải…' : 'Làm mới'}
            </button>
            <input
              type="text"
              placeholder="🔍 Tìm tên, ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '280px',
                padding: '9px 16px',
                borderRadius: '8px',
                border: '1px solid #cbd5e1',
                fontSize: '13px',
                outline: 'none',
                boxShadow: 'inset 0 1px 2px rgba(0,0,0,0.05)',
              }}
              onFocus={(e) => e.currentTarget.style.borderColor = '#3b82f6'}
              onBlur={(e) => e.currentTarget.style.borderColor = '#cbd5e1'}
            />
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ width: '40px', height: '40px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 1s linear infinite', margin: '0 auto 16px' }}></div>
            Đang tải dữ liệu...
          </div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '80px', textAlign: 'center', color: '#64748b' }}>
            <div style={{ fontSize: '48px', marginBottom: '16px', opacity: 0.5 }}>📭</div>
            <h3 style={{ margin: '0 0 8px', color: '#0f172a' }}>Không có dữ liệu</h3>
            <p style={{ margin: 0 }}>Không tìm thấy trang phục nào phù hợp với bộ lọc hiện tại.</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: '#fff', borderBottom: '2px solid #e2e8f0' }}>
                  <th style={{ padding: '16px 24px', width: '40px' }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredItems.length}
                      onChange={toggleSelectAll}
                      style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }}
                    />
                  </th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>ID</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Tên & Chi tiết</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Giá Ruby</th>
                  <th style={{ padding: '16px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Trạng thái</th>
                  <th style={{ padding: '16px 24px', color: '#64748b', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', textAlign: 'right' }}>Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.map((item) => (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid #f1f5f9',
                      background: selectedIds.includes(item.id) ? '#f8fafc' : '#fff',
                      transition: 'background 0.2s ease',
                    }}
                    onMouseOver={(e) => { if (!selectedIds.includes(item.id)) e.currentTarget.style.background = '#f8fafc' }}
                    onMouseOut={(e) => { if (!selectedIds.includes(item.id)) e.currentTarget.style.background = '#fff' }}
                  >
                    <td style={{ padding: '20px 24px' }}>
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(item.id)}
                        onChange={() => toggleSelect(item.id)}
                        style={{ cursor: 'pointer', width: '16px', height: '16px', accentColor: '#3b82f6' }}
                      />
                    </td>
                    <td style={{ padding: '20px 16px', fontSize: '13px', color: '#64748b', fontFamily: 'ui-monospace, monospace' }}>#{item.id}</td>
                    <td style={{ padding: '20px 16px' }}>
                      <div style={{ fontWeight: 700, color: '#0f172a', fontSize: '15px', marginBottom: '6px' }}>
                        {item.name}
                      </div>
                      <div style={{ fontSize: '13px', color: '#64748b', whiteSpace: 'pre-line', maxWidth: '450px', lineHeight: '1.5' }}>
                        {item.info}
                      </div>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <strong style={{ fontSize: '15px', color: item.isForSale ? '#e11d48' : '#94a3b8' }}>
                        {item.isForSale ? `${item.price.toLocaleString('vi-VN')} Ruby` : '---'}
                      </strong>
                    </td>
                    <td style={{ padding: '20px 16px' }}>
                      <span
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '6px 10px',
                          background: item.isForSale ? '#f0fdf4' : '#f1f5f9',
                          color: item.isForSale ? '#15803d' : '#64748b',
                          border: `1px solid ${item.isForSale ? '#bbf7d0' : '#e2e8f0'}`,
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: 600,
                        }}
                      >
                        <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: item.isForSale ? '#22c55e' : '#94a3b8' }}></span>
                        {item.isForSale ? 'ĐANG BÁN' : 'ĐANG KHÓA'}
                      </span>
                    </td>
                    <td style={{ padding: '20px 24px', textAlign: 'right' }}>
                      <button
                        type="button"
                        style={{
                          padding: '8px 16px',
                          background: '#fff',
                          color: item.isForSale ? '#ef4444' : '#10b981',
                          border: `1px solid ${item.isForSale ? '#fca5a5' : '#a7f3d0'}`,
                          borderRadius: '8px',
                          fontSize: '13px',
                          fontWeight: 600,
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
                        }}
                        disabled={actionLoading !== null}
                        onClick={() => void handleToggleSingle(item)}
                        onMouseOver={(e) => {
                          e.currentTarget.style.background = item.isForSale ? '#fef2f2' : '#ecfdf5';
                        }}
                        onMouseOut={(e) => {
                          e.currentTarget.style.background = '#fff';
                        }}
                      >
                        {actionLoading === `item-${item.id}` ? 'Đang xử lý...' : item.isForSale ? 'Khóa bán' : 'Mở bán ngay'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* Bulk Price Setup Modal */}
      {showBulkModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            backdropFilter: 'blur(4px)',
            display: 'grid',
            placeItems: 'center',
            zIndex: 100,
          }}
        >
          <div
            style={{
              background: '#fff',
              borderRadius: '16px',
              padding: '28px',
              width: 'min(420px, 90vw)',
              boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)',
            }}
          >
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>Mở bán hàng loạt</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Bạn đang thiết lập giá cho <strong>{selectedIds.length}</strong> bộ cải trang đã chọn.
            </p>

            <label style={{ display: 'block', marginBottom: '20px' }}>
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '8px' }}>
                Giá Ruby chung cho tất cả:
              </span>
              <input
                type="number"
                value={bulkPriceInput}
                onChange={(e) => setBulkPriceInput(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '15px',
                  fontWeight: 600,
                  color: '#e11d48',
                }}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setShowBulkModal(false)}
                style={{
                  padding: '10px 16px',
                  background: '#f1f5f9',
                  color: '#475569',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 600,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={() => void handleBulkUpdate(bulkPriceInput)}
                disabled={actionLoading !== null}
                style={{
                  padding: '10px 16px',
                  background: '#1e293b',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {actionLoading !== null ? 'Đang lưu…' : 'Mở bán ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
