'use client';

import { useEffect, useMemo, useState } from 'react';
import { extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminFashionItem } from '../types/admin.types';

const EVENT_TAGS = [
  { key: 'ALL', label: 'Tất cả' },
  { key: 'FOR_SALE', label: 'Đang mở bán' },
  { key: 'LOCKED', label: 'Đang khóa' },
  { key: 'TET', label: '🧧 Sự kiện Tết' },
  { key: 'NOEL', label: '🎄 Sự kiện Noel' },
  { key: 'HALLOWEEN', label: '🎃 Halloween' },
  { key: 'HERO_EVENT', label: '⚡ Siêu anh hùng & Lễ hội' },
  { key: 'GERMA66', label: '🧬 Germa 66' },
  { key: 'ANIME_SPECIAL', label: '🏴‍☠️ Tứ Hoàng & Đặc biệt' },
  { key: 'DEFAULT', label: 'Mặc định' },
];

const PRESETS = [
  { tag: 'TET', label: 'Sự kiện Tết', icon: '🧧', defaultPrice: 5000 },
  { tag: 'NOEL', label: 'Giáng Sinh (Noel)', icon: '🎄', defaultPrice: 5000 },
  { tag: 'HALLOWEEN', label: 'Halloween Ma Quái', icon: '🎃', defaultPrice: 5000 },
  { tag: 'HERO_EVENT', label: 'Siêu Anh Hùng & Mini Event', icon: '⚡', defaultPrice: 5000 },
  { tag: 'GERMA66', label: 'Set Germa 66', icon: '🧬', defaultPrice: 8000 },
  { tag: 'ANIME_SPECIAL', label: 'Anime Tứ Hoàng & Kaido/Roger', icon: '🏴‍☠️', defaultPrice: 10000 },
];

export function FashionManagement() {
  const [items, setItems] = useState<AdminFashionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Modal edit price state
  const [editingItem, setEditingItem] = useState<AdminFashionItem | null>(null);
  const [newPrice, setNewPrice] = useState<number>(5000);

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const data = await adminService.getFashionItems();
      setItems(data);
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
      return item.eventTag === activeTab;
    });
  }, [items, activeTab, searchQuery]);

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

  async function handleSavePrice() {
    if (!editingItem) return;
    setActionLoading(`save-${editingItem.id}`);
    setError(null);
    setSuccess(null);
    try {
      const updated = await adminService.updateFashionPrice(editingItem.id, newPrice);
      setItems((prev) => prev.map((i) => (i.id === editingItem.id ? updated : i)));
      setSuccess(`Đã cập nhật giá bán "${editingItem.name}" thành ${newPrice >= 0 ? newPrice.toLocaleString('vi-VN') + ' Ruby' : 'Khóa bán'}.`);
      setEditingItem(null);
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể cập nhật giá bán.'));
    } finally {
      setActionLoading(null);
    }
  }

  async function handleToggleEvent(tag: string, active: boolean, price: number) {
    setActionLoading(`event-${tag}-${active}`);
    setError(null);
    setSuccess(null);
    try {
      const res = await adminService.toggleFashionEvent({
        eventTag: tag,
        active,
        defaultPrice: price,
      });
      setSuccess(`Đã ${active ? 'mở bán' : 'khóa bán'} thành công ${res.affectedCount} bộ trang phục thuộc sự kiện ${tag}!`);
      await loadData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể cập nhật sự kiện.'));
    } finally {
      setActionLoading(null);
    }
  }

  return (
    <div className="admin-page admin-fashion-page">
      {/* Heading */}
      <section className="admin-page-heading">
        <div>
          <span>LIVE OPERATIONS / SỰ KIỆN & THỜI TRANG</span>
          <h1>Quản lý Cải Trang & Sự Kiện</h1>
          <p>Điều khiển mở/đóng bán và định giá các bộ Cải trang (Fashion) theo mùa trực tiếp trên Game Server.</p>
        </div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <div style={{ padding: '10px 18px', background: '#fff', borderRadius: '12px', border: '1px solid #dce1e8', textAlign: 'center' }}>
            <small style={{ color: '#66758f', fontSize: '11px', display: 'block', fontWeight: 600 }}>TỔNG CẢI TRANG</small>
            <strong style={{ fontSize: '20px', color: '#101754' }}>{stats.total}</strong>
          </div>
          <div style={{ padding: '10px 18px', background: '#f0fdf4', borderRadius: '12px', border: '1px solid #bbf7d0', textAlign: 'center' }}>
            <small style={{ color: '#15803d', fontSize: '11px', display: 'block', fontWeight: 600 }}>ĐANG MỞ BÁN</small>
            <strong style={{ fontSize: '20px', color: '#16a34a' }}>{stats.forSale}</strong>
          </div>
          <div style={{ padding: '10px 18px', background: '#fef2f2', borderRadius: '12px', border: '1px solid #fecaca', textAlign: 'center' }}>
            <small style={{ color: '#b91c1c', fontSize: '11px', display: 'block', fontWeight: 600 }}>ĐANG KHÓA</small>
            <strong style={{ fontSize: '20px', color: '#dc2626' }}>{stats.locked}</strong>
          </div>
        </div>
      </section>

      {/* Notifications */}
      {error && (
        <div style={{ padding: '14px 18px', background: '#fef2f2', border: '1px solid #f87171', borderRadius: '10px', color: '#991b1b', marginBottom: '20px' }}>
          ⚠️ {error}
        </div>
      )}
      {success && (
        <div style={{ padding: '14px 18px', background: '#f0fdf4', border: '1px solid #4ade80', borderRadius: '10px', color: '#166534', marginBottom: '20px' }}>
          ✨ {success}
        </div>
      )}

      {/* Quick 1-Click Event Presets */}
      <section className="admin-data-panel" style={{ marginBottom: '28px' }}>
        <header>
          <div>
            <span>1-CLICK EVENT PRESETS</span>
            <h2>Kích hoạt Sự kiện Nhanh (Preset Mở/Đóng Hàng Loạt)</h2>
          </div>
          <button type="button" onClick={() => void loadData()} disabled={loading}>
            {loading ? 'Đang tải…' : 'Làm mới'}
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px', padding: '20px' }}>
          {PRESETS.map((preset) => (
            <div
              key={preset.tag}
              style={{
                background: '#f8f9fb',
                border: '1px solid #e2e6eb',
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '12px',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>{preset.icon}</span>
                <div>
                  <strong style={{ fontSize: '14px', color: '#1e293b' }}>{preset.label}</strong>
                  <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>
                    Giá mở bán: {preset.defaultPrice.toLocaleString('vi-VN')} Ruby
                  </p>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#16a34a',
                    color: '#fff',
                    border: 'none',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  disabled={actionLoading !== null}
                  onClick={() => void handleToggleEvent(preset.tag, true, preset.defaultPrice)}
                >
                  {actionLoading === `event-${preset.tag}-true` ? 'Đang bật…' : 'Bật Sự Kiện'}
                </button>
                <button
                  type="button"
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    background: '#fee2e2',
                    color: '#b91c1c',
                    border: '1px solid #fca5a5',
                    borderRadius: '8px',
                    fontSize: '12px',
                    fontWeight: 700,
                    cursor: 'pointer',
                  }}
                  disabled={actionLoading !== null}
                  onClick={() => void handleToggleEvent(preset.tag, false, -1)}
                >
                  {actionLoading === `event-${preset.tag}-false` ? 'Đang tắt…' : 'Khóa Bán'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div style={{ padding: '0 20px 20px', display: 'flex', gap: '12px', borderTop: '1px solid #edf2f7', paddingTop: '16px' }}>
          <button
            type="button"
            style={{
              padding: '10px 18px',
              background: '#2563eb',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
            disabled={actionLoading !== null}
            onClick={() => void handleToggleEvent('ALL', true, 5000)}
          >
            🔓 Mở bán TẤT CẢ cải trang (Đồng giá 5.000 Ruby)
          </button>
          <button
            type="button"
            style={{
              padding: '10px 18px',
              background: '#ef4444',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '13px',
              cursor: 'pointer',
            }}
            disabled={actionLoading !== null}
            onClick={() => void handleToggleEvent('ALL', false, -1)}
          >
            🔒 Khóa bán TẤT CẢ (Đưa về mặc định)
          </button>
        </div>
      </section>

      {/* Filter and Search */}
      <section className="admin-data-panel">
        <header style={{ flexDirection: 'column', alignItems: 'stretch', gap: '14px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <span>FASHION INVENTORY</span>
              <h2>Danh sách Cải Trang ({filteredItems.length} bộ)</h2>
            </div>
            <div style={{ width: '320px' }}>
              <input
                type="text"
                placeholder="🔍 Tìm tên cải trang, chỉ số..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 14px',
                  borderRadius: '20px',
                  border: '1px solid #cbd5e1',
                  fontSize: '13px',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {EVENT_TAGS.map((tab) => (
              <button
                type="button"
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: activeTab === tab.key ? '1px solid #bd2040' : '1px solid #e2e8f0',
                  background: activeTab === tab.key ? '#bd2040' : '#fff',
                  color: activeTab === tab.key ? '#fff' : '#475569',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 150ms ease',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </header>

        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Đang tải danh sách cải trang…</div>
        ) : filteredItems.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center', color: '#64748b' }}>Không tìm thấy trang phục nào phù hợp.</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '16px', padding: '20px' }}>
            {filteredItems.map((item) => (
              <div
                key={item.id}
                style={{
                  background: item.isForSale ? '#fff' : '#f8fafc',
                  border: item.isForSale ? '1px solid #cbd5e1' : '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  gap: '12px',
                  opacity: item.isForSale ? 1 : 0.85,
                  boxShadow: item.isForSale ? '0 2px 4px rgba(0,0,0,0.03)' : 'none',
                }}
              >
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        background: item.isForSale ? '#dcfce7' : '#fee2e2',
                        color: item.isForSale ? '#15803d' : '#b91c1c',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                      }}
                    >
                      {item.isForSale ? 'ĐANG BÁN' : 'KHÓA BÁN'}
                    </span>
                    <span style={{ fontSize: '11px', color: '#94a3b8', fontFamily: 'monospace' }}>ID: #{item.id}</span>
                  </div>

                  <h3 style={{ fontSize: '15px', color: '#0f172a', margin: '8px 0 4px', fontWeight: 700 }}>
                    {item.name}
                  </h3>

                  <p
                    style={{
                      fontSize: '11px',
                      color: '#64748b',
                      whiteSpace: 'pre-line',
                      maxHeight: '75px',
                      overflowY: 'auto',
                      lineHeight: '1.4',
                    }}
                  >
                    {item.info}
                  </p>
                </div>

                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#64748b' }}>Giá bán:</span>
                    <strong style={{ fontSize: '13px', color: item.isForSale ? '#e11d48' : '#94a3b8' }}>
                      {item.isForSale ? `${item.price.toLocaleString('vi-VN')} Ruby` : 'Chưa mở bán (-1)'}
                    </strong>
                  </div>

                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      type="button"
                      style={{
                        flex: 1,
                        padding: '7px 10px',
                        background: item.isForSale ? '#fecaca' : '#bbf7d0',
                        color: item.isForSale ? '#991b1b' : '#166534',
                        border: 'none',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                      disabled={actionLoading !== null}
                      onClick={() => void handleToggleSingle(item)}
                    >
                      {actionLoading === `item-${item.id}` ? '…' : item.isForSale ? '🔒 Tắt bán' : '🔓 Mở bán'}
                    </button>
                    <button
                      type="button"
                      style={{
                        padding: '7px 10px',
                        background: '#f1f5f9',
                        color: '#334155',
                        border: '1px solid #cbd5e1',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setEditingItem(item);
                        setNewPrice(item.price >= 0 ? item.price : 5000);
                      }}
                    >
                      ✏️ Đổi giá
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Edit Modal */}
      {editingItem && (
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
            <h3 style={{ margin: '0 0 8px', fontSize: '18px', color: '#0f172a' }}>Chỉnh sửa giá bán</h3>
            <p style={{ margin: '0 0 16px', fontSize: '13px', color: '#64748b' }}>
              Trang phục: <strong>{editingItem.name}</strong> (ID: #{editingItem.id})
            </p>

            <label style={{ display: 'block', marginBottom: '16px' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: '#334155', display: 'block', marginBottom: '6px' }}>
                Giá Ruby (nhập -1 nếu muốn khóa bán):
              </span>
              <input
                type="number"
                value={newPrice}
                onChange={(e) => setNewPrice(parseInt(e.target.value, 10) || 0)}
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '14px',
                }}
              />
            </label>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <button
                type="button"
                onClick={() => setEditingItem(null)}
                style={{
                  padding: '8px 16px',
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
                onClick={() => void handleSavePrice()}
                disabled={actionLoading !== null}
                style={{
                  padding: '8px 16px',
                  background: '#bd2040',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '13px',
                  cursor: 'pointer',
                }}
              >
                {actionLoading !== null ? 'Đang lưu…' : 'Lưu thay đổi'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
