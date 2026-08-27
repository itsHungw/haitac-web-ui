'use client';

import { useEffect, useMemo, useState } from 'react';
import { extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminFashionItem } from '../types/admin.types';
import { Search, Loader2, Edit2, ShieldAlert, CheckCircle2, XCircle, Tag, BookmarkPlus, FolderOpen, Save, Trash2, X, PlusCircle } from 'lucide-react';

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

  // Full Edit Modal State
  const [editItem, setEditItem] = useState<AdminFashionItem | null>(null);
  const [editForm, setEditForm] = useState<Partial<AdminFashionItem>>({});
  const [showEditModal, setShowEditModal] = useState(false);

  // Local Groups State (Drafts)
  const [savedGroups, setSavedGroups] = useState<{name: string, ids: number[]}[]>([]);
  const [showSaveGroupModal, setShowSaveGroupModal] = useState(false);
  const [newGroupName, setNewGroupName] = useState('');
  const [showLoadGroupModal, setShowLoadGroupModal] = useState(false);

  useEffect(() => {
    // Load local groups
    const groups = localStorage.getItem('htth_admin_fashion_groups');
    if (groups) {
      try {
        setSavedGroups(JSON.parse(groups));
      } catch (e) {
        // ignore
      }
    }
  }, []);

  const saveLocalGroups = (groups: {name: string, ids: number[]}[]) => {
    setSavedGroups(groups);
    localStorage.setItem('htth_admin_fashion_groups', JSON.stringify(groups));
  };

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
    const forSale = items.filter((i) => i.price >= 0).length;
    const locked = total - forSale;
    return { total, forSale, locked };
  }, [items]);

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const isForSale = item.price >= 0;
      if (activeTab === 'FOR_SALE' && !isForSale) return false;
      if (activeTab === 'LOCKED' && isForSale) return false;

      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          item.name.toLowerCase().includes(query) ||
          item.id.toString().includes(query)
        );
      }
      return true;
    });
  }, [items, activeTab, searchQuery]);

  const toggleSelectAll = () => {
    if (selectedIds.length === filteredItems.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filteredItems.map(i => i.id));
    }
  };

  const toggleSelect = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const showNotification = (msg: string, isError = false) => {
    if (isError) setError(msg);
    else setSuccess(msg);
    setTimeout(() => {
      setError(null);
      setSuccess(null);
    }, 4000);
  };

  const handleBulkUpdatePrice = async () => {
    if (selectedIds.length === 0) return;
    try {
      setActionLoading('bulk_update');
      await adminService.bulkUpdateFashionPrice({
        itemIds: selectedIds,
        price: bulkPriceInput
      });
      showNotification(`Cập nhật thành công ${selectedIds.length} cải trang!`);
      setShowBulkModal(false);
      setSelectedIds([]);
      await loadData();
    } catch (err) {
      showNotification(extractErrorMessage(err, 'Lỗi cập nhật giá.'), true);
    } finally {
      setActionLoading(null);
    }
  };

  const openEditModal = (item: AdminFashionItem) => {
    setEditItem(item);
    setEditForm({ ...item });
    setShowEditModal(true);
  };

  const handleFullUpdate = async () => {
    if (!editItem) return;
    try {
      setActionLoading('full_update');
      await adminService.updateFashion(editItem.id, editForm);
      showNotification(`Đã lưu thay đổi cho cải trang #${editItem.id}`);
      setShowEditModal(false);
      await loadData();
    } catch (err) {
      showNotification(extractErrorMessage(err, 'Lỗi cập nhật cải trang.'), true);
    } finally {
      setActionLoading(null);
    }
  };

  const handleSaveGroup = () => {
    if (!newGroupName.trim() || selectedIds.length === 0) return;
    const newGroups = [...savedGroups, { name: newGroupName.trim(), ids: selectedIds }];
    saveLocalGroups(newGroups);
    setNewGroupName('');
    setShowSaveGroupModal(false);
    showNotification(`Đã lưu nhóm sự kiện: ${newGroupName}`);
  };

  const handleDeleteGroup = (idx: number) => {
    const newGroups = [...savedGroups];
    newGroups.splice(idx, 1);
    saveLocalGroups(newGroups);
  };

  const handleLoadGroup = (ids: number[]) => {
    setSelectedIds(ids);
    setShowLoadGroupModal(false);
    showNotification(`Đã chọn ${ids.length} cải trang từ nhóm.`);
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-24">
      {/* Header & Stats */}
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Cải trang</h1>
          <p className="text-zinc-400">Quản lý kho cải trang, thiết lập giá bán và phát hành sự kiện.</p>
        </div>
        
        <div className="flex gap-4">
          <div className="rounded-xl border border-white/10 bg-black/40 px-6 py-4 backdrop-blur-md">
            <p className="text-sm font-medium text-zinc-400">Đang mở bán</p>
            <p className="text-2xl font-bold text-emerald-400">{stats.forSale}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 px-6 py-4 backdrop-blur-md">
            <p className="text-sm font-medium text-zinc-400">Đang khóa</p>
            <p className="text-2xl font-bold text-rose-400">{stats.locked}</p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/40 px-6 py-4 backdrop-blur-md">
            <p className="text-sm font-medium text-zinc-400">Tổng cộng</p>
            <p className="text-2xl font-bold text-zinc-100">{stats.total}</p>
          </div>
        </div>
      </div>

      {/* Notifications */}
      {error && (
        <div className="rounded-xl border border-rose-500/20 bg-rose-500/10 p-4 text-rose-400 flex items-center gap-3">
          <ShieldAlert className="h-5 w-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400 flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5" />
          {success}
        </div>
      )}

      {/* Controls: Search, Tabs, Group Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-black/20 p-2 rounded-2xl border border-white/5">
        <div className="flex rounded-xl bg-black/40 p-1">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`rounded-lg px-4 py-2 text-sm font-medium transition-all ${
                activeTab === tab.key
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-white/5'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex gap-2 w-full sm:w-auto">
          <button 
            onClick={() => setShowLoadGroupModal(true)}
            className="flex items-center gap-2 rounded-xl bg-indigo-500/10 px-4 py-2 text-sm font-medium text-indigo-400 transition-colors hover:bg-indigo-500/20"
          >
            <FolderOpen className="h-4 w-4" />
            Tải nhóm ({savedGroups.length})
          </button>
          
          <div className="relative group w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 transition-colors group-focus-within:text-emerald-400" />
            <input
              type="text"
              placeholder="Tìm theo ID hoặc tên..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-10 w-full rounded-xl border border-white/10 bg-black/40 pl-10 pr-4 text-sm text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Data Grid */}
      <div className="rounded-2xl border border-white/10 bg-zinc-950/50 backdrop-blur-xl overflow-hidden shadow-2xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-white/5 text-zinc-400">
              <tr>
                <th className="px-6 py-4 w-12">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={selectedIds.length > 0 && selectedIds.length === filteredItems.length}
                      onChange={toggleSelectAll}
                      className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30 transition-all"
                    />
                  </div>
                </th>
                <th className="px-6 py-4 font-semibold w-24">ID</th>
                <th className="px-6 py-4 font-semibold w-24">Icon</th>
                <th className="px-6 py-4 font-semibold">Tên cải trang</th>
                <th className="px-6 py-4 font-semibold w-32 text-right">Giá bán</th>
                <th className="px-6 py-4 font-semibold w-32 text-center">Trạng thái</th>
                <th className="px-6 py-4 font-semibold w-24 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredItems.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                    Không tìm thấy cải trang nào phù hợp.
                  </td>
                </tr>
              ) : (
                filteredItems.map((item) => {
                  const isSelected = selectedIds.includes(item.id);
                  const isForSale = item.price >= 0;
                  return (
                    <tr 
                      key={item.id} 
                      className={`group transition-colors hover:bg-white/[0.02] ${isSelected ? 'bg-emerald-500/[0.02]' : ''}`}
                    >
                      <td className="px-6 py-4">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelect(item.id)}
                          className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/30 transition-all"
                        />
                      </td>
                      <td className="px-6 py-4 font-mono text-zinc-400">{item.id}</td>
                      <td className="px-6 py-4">
                        <div className="h-8 w-8 rounded bg-white/5 flex items-center justify-center text-xs text-zinc-500 border border-white/10">
                          {item.icon}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-200">{item.name}</div>
                        <div className="text-xs text-zinc-500 truncate max-w-xs" title={item.info}>
                          {item.info || 'Không có mô tả'}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {isForSale ? (
                          <span className="font-mono text-emerald-400">
                            {item.price.toLocaleString('vi-VN')}
                          </span>
                        ) : (
                          <span className="text-zinc-600">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border ${
                          isForSale 
                            ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400' 
                            : 'border-zinc-500/20 bg-zinc-500/10 text-zinc-400'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${isForSale ? 'bg-emerald-400' : 'bg-zinc-500'}`} />
                          {isForSale ? 'Mở bán' : 'Khóa'}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => openEditModal(item)}
                          className="inline-flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-400 hover:bg-white/10 hover:text-white transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                          Sửa
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Sticky Bulk Action Bar */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 animate-in slide-in-from-bottom-8 fade-in duration-300">
          <div className="flex items-center gap-4 rounded-2xl border border-white/10 bg-zinc-900/90 px-6 py-4 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center gap-3 pr-4 border-r border-white/10">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400 font-bold">
                {selectedIds.length}
              </div>
              <span className="text-sm font-medium text-zinc-200">đã chọn</span>
            </div>
            
            <button
              onClick={() => setShowSaveGroupModal(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-medium text-indigo-400 hover:bg-indigo-500/10 transition-colors"
            >
              <BookmarkPlus className="h-4 w-4" />
              Lưu thành nhóm
            </button>
            
            <button
              onClick={() => setShowBulkModal(true)}
              className="flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-all hover:-translate-y-0.5"
            >
              <Tag className="h-4 w-4" />
              Đăng bán sự kiện
            </button>
            
            <button
              onClick={() => setSelectedIds([])}
              className="ml-2 rounded-full p-2 text-zinc-400 hover:bg-white/10 hover:text-white transition-colors"
            >
              <XCircle className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}

      {/* Bulk Update Modal */}
      {showBulkModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Đăng bán hàng loạt</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Bạn đang chọn <strong className="text-emerald-400">{selectedIds.length}</strong> cải trang để cập nhật giá.
              Đặt giá <strong>-1</strong> để khóa.
            </p>
            
            <div className="space-y-2 mb-8">
              <label className="text-sm font-medium text-zinc-300">Giá bán mới</label>
              <div className="relative">
                <input
                  type="number"
                  value={bulkPriceInput}
                  onChange={(e) => setBulkPriceInput(parseInt(e.target.value) || 0)}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white placeholder:text-zinc-600 focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-zinc-500">Đơn vị</span>
              </div>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowBulkModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleBulkUpdatePrice}
                disabled={actionLoading === 'bulk_update'}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'bulk_update' && <Loader2 className="h-4 w-4 animate-spin" />}
                Xác nhận đăng
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Save Group Modal */}
      {showSaveGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-white mb-2">Lưu nhóm sự kiện</h3>
            <p className="text-sm text-zinc-400 mb-6">
              Lưu <strong className="text-indigo-400">{selectedIds.length}</strong> cải trang vào bộ nhớ tạm để tái sử dụng sau này.
            </p>
            
            <div className="space-y-2 mb-8">
              <label className="text-sm font-medium text-zinc-300">Tên nhóm</label>
              <input
                type="text"
                placeholder="VD: Sự kiện Halloween 2026..."
                value={newGroupName}
                onChange={(e) => setNewGroupName(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 transition-all"
              />
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowSaveGroupModal(false)}
                className="rounded-xl px-4 py-2 text-sm font-medium text-zinc-400 hover:bg-white/5 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleSaveGroup}
                disabled={!newGroupName.trim()}
                className="flex items-center gap-2 rounded-xl bg-indigo-500 px-6 py-2 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 hover:bg-indigo-400 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4" />
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Load Group Modal */}
      {showLoadGroupModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl max-h-[80vh] flex flex-col">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-white">Nhóm sự kiện đã lưu</h3>
              <button onClick={() => setShowLoadGroupModal(false)} className="text-zinc-500 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="overflow-y-auto pr-2 space-y-3 flex-1">
              {savedGroups.length === 0 ? (
                <div className="text-center py-8 text-zinc-500">
                  <BookmarkPlus className="h-8 w-8 mx-auto mb-3 opacity-50" />
                  Chưa có nhóm nào được lưu.
                </div>
              ) : (
                savedGroups.map((g, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 rounded-xl border border-white/5 bg-white/[0.02] hover:bg-white/[0.04] transition-colors">
                    <div>
                      <h4 className="font-medium text-white">{g.name}</h4>
                      <p className="text-xs text-zinc-500">{g.ids.length} cải trang</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleDeleteGroup(idx)}
                        className="p-2 rounded-lg text-rose-400 hover:bg-rose-400/10 transition-colors"
                        title="Xóa nhóm"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleLoadGroup(g.ids)}
                        className="px-4 py-2 rounded-lg bg-indigo-500/20 text-indigo-400 font-medium hover:bg-indigo-500/30 transition-colors text-sm"
                      >
                        Tải
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Full Edit Modal */}
      {showEditModal && editItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in p-4">
          <div className="w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-6 md:p-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6">Chỉnh sửa #{editItem.id}</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Tên cải trang</label>
                <input
                  type="text"
                  value={editForm.name || ''}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Icon ID</label>
                <input
                  type="number"
                  value={editForm.icon || 0}
                  onChange={(e) => setEditForm({...editForm, icon: parseInt(e.target.value) || 0})}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono"
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <label className="text-sm font-medium text-zinc-300">Mô tả (Info)</label>
                <textarea
                  value={editForm.info || ''}
                  onChange={(e) => setEditForm({...editForm, info: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-3 text-white focus:border-emerald-500/50 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all resize-y min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">Mwear</label>
                <input
                  type="text"
                  value={editForm.mwear || ''}
                  onChange={(e) => setEditForm({...editForm, mwear: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-zinc-300 font-mono text-sm focus:border-emerald-500/50 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-300">OP (Options)</label>
                <input
                  type="text"
                  value={editForm.op || ''}
                  onChange={(e) => setEditForm({...editForm, op: e.target.value})}
                  className="w-full rounded-xl border border-white/10 bg-black/50 px-4 py-2.5 text-zinc-300 font-mono text-sm focus:border-emerald-500/50 focus:outline-none transition-all"
                />
              </div>
              <div className="space-y-2 md:col-span-2 pt-4 border-t border-white/5">
                <label className="text-sm font-medium text-emerald-400">Giá bán (Nhập -1 để khóa)</label>
                <input
                  type="number"
                  value={editForm.price ?? -1}
                  onChange={(e) => setEditForm({...editForm, price: parseInt(e.target.value)})}
                  className="w-full rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-emerald-300 focus:border-emerald-500 focus:outline-none transition-all font-mono text-lg"
                />
              </div>
            </div>
            
            <div className="flex justify-end gap-3 pt-4 border-t border-white/10">
              <button
                onClick={() => setShowEditModal(false)}
                className="rounded-xl px-5 py-2.5 text-sm font-medium text-zinc-400 hover:bg-white/5 transition-colors"
              >
                Hủy
              </button>
              <button
                onClick={handleFullUpdate}
                disabled={actionLoading === 'full_update'}
                className="flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-2.5 text-sm font-semibold text-zinc-950 shadow-lg shadow-emerald-500/20 hover:bg-emerald-400 transition-colors disabled:opacity-50"
              >
                {actionLoading === 'full_update' && <Loader2 className="h-4 w-4 animate-spin" />}
                Lưu thay đổi
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
