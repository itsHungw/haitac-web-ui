'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { extractErrorMessage } from '@/lib/api/errors';
import { adminService } from '../services/admin.service';
import type { AdminGiftCode, AdminGiftReward, GiftCodePayload } from '../types/admin.types';

const number = new Intl.NumberFormat('vi-VN');
const emptyForm = { code: '', beri: '0', ruby: '0', rewards: '', message: '', maxRedemptions: '100', eligibleUsers: '', reason: '' };

function rewardText(rewards: AdminGiftReward[]) {
  return rewards.map((reward) => `${reward.type},${reward.itemId},${reward.quantity}`).join('\n');
}

function parseRewards(value: string): AdminGiftReward[] {
  if (!value.trim()) return [];
  return value.split(/\r?\n/).filter(Boolean).map((line) => {
    const values = line.split(',').map((item) => Number(item.trim()));
    if (values.length !== 3 || values.some((item) => !Number.isInteger(item)) || ![3, 4, 7].includes(values[0]) || values[1] < 0 || values[2] < 1) {
      throw new Error(`Phần thưởng không hợp lệ: "${line}". Dùng định dạng loại,id,số lượng.`);
    }
    return { type: values[0], itemId: values[1], quantity: values[2] };
  });
}

export function GiftCodeManagement() {
  const [codes, setCodes] = useState<AdminGiftCode[]>([]);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<AdminGiftCode | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState<string | null>(null);

  function load() {
    setLoading(true); setError(null);
    adminService.getGiftCodes().then(setCodes).catch((caught) => setError(extractErrorMessage(caught, 'Không thể tải gift code.'))).finally(() => setLoading(false));
  }
  useEffect(load, []);

  const filtered = useMemo(() => codes.filter((item) => item.code.toLowerCase().includes(query.trim().toLowerCase())), [codes, query]);

  function openCreate() { setSelected(null); setForm(emptyForm); setError(null); setSuccess(null); }
  function openEdit(item: AdminGiftCode) {
    setSelected(item); setSuccess(null); setError(null);
    setForm({ code: item.code, beri: String(item.beri), ruby: String(item.ruby), rewards: rewardText(item.rewards), message: item.message, maxRedemptions: String(item.maxRedemptions), eligibleUsers: item.eligibleUsers, reason: '' });
  }
  function field(name: keyof typeof form, value: string) { setForm((current) => ({ ...current, [name]: value })); }

  async function submit(event: FormEvent) {
    event.preventDefault(); setError(null); setSuccess(null);
    try {
      const payload: GiftCodePayload = { beri: Number(form.beri), ruby: Number(form.ruby), rewards: parseRewards(form.rewards), message: form.message.trim(), maxRedemptions: Number(form.maxRedemptions), eligibleUsers: form.eligibleUsers.trim(), reason: form.reason.trim() };
      if (!Number.isInteger(payload.beri) || !Number.isInteger(payload.ruby) || !Number.isInteger(payload.maxRedemptions) || payload.beri < 0 || payload.ruby < 0 || payload.maxRedemptions < 1) throw new Error('Beri, ruby và giới hạn phải là số nguyên hợp lệ.');
      if (payload.reason.length < 3) throw new Error('Lý do cần có ít nhất 3 ký tự.');
      setSaving(true);
      const saved = selected ? await adminService.updateGiftCode(selected.code, payload) : await adminService.createGiftCode(form.code.trim(), payload);
      setCodes((current) => selected ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
      setSelected(saved); setForm((current) => ({ ...current, reason: '' }));
      setSuccess(selected ? 'Đã cập nhật gift code và ghi audit.' : 'Đã tạo gift code và ghi audit.');
    } catch (caught) { setError(extractErrorMessage(caught, caught instanceof Error ? caught.message : 'Không thể lưu gift code.')); }
    finally { setSaving(false); }
  }

  return <div className="admin-page admin-gift-page">
    <section className="admin-page-heading"><div><span>LIVE OPS / PHẦN THƯỞNG</span><h1>Gift code</h1><p>Tạo chiến dịch quà tặng có giới hạn, đối tượng và audit đầy đủ.</p></div><button className="admin-secondary-button" type="button" onClick={openCreate}>+ Tạo mã mới</button></section>
    <div className="admin-gift-layout">
      <section className="admin-data-panel admin-gift-list">
        <header><div><span>KHO MÃ</span><h2>{number.format(codes.length)} gift code</h2></div><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Tìm mã…" aria-label="Tìm gift code" /></header>
        {loading ? <div className="admin-drawer-loading">Đang tải gift code…</div> : <div className="admin-gift-cards">{filtered.map((item) => <button key={item.id} type="button" className={selected?.id === item.id ? 'is-selected' : ''} onClick={() => openEdit(item)}><div><strong>{item.code}</strong><span className={`admin-state-badge ${item.active ? 'is-online' : 'is-locked'}`}>{item.active ? 'Đang dùng' : 'Hết lượt'}</span></div><p>{number.format(item.beri)} beri · {number.format(item.ruby)} ruby · {item.rewards.length} vật phẩm</p><footer><span>{number.format(item.usedCount)} / {number.format(item.maxRedemptions)} lượt</span><span>{item.eligibleUsers ? 'Giới hạn người nhận' : 'Toàn máy chủ'}</span></footer></button>)}</div>}
        {!loading && !filtered.length && <div className="admin-table-empty">Không có gift code phù hợp.</div>}
      </section>

      <section className="admin-gift-editor">
        <header><span>{selected ? 'CHỈNH SỬA CHIẾN DỊCH' : 'CHIẾN DỊCH MỚI'}</span><h2>{selected?.code ?? 'Tạo gift code'}</h2><p>Game server đọc thay đổi trực tiếp từ bảng giftcode.</p></header>
        <form onSubmit={submit}>
          <label>Mã gift code<input value={form.code} disabled={Boolean(selected)} onChange={(event) => field('code', event.target.value)} maxLength={20} pattern="[a-zA-Z0-9]+" required /></label>
          <div className="admin-gift-row"><label>Beri<input type="number" min="0" max="2000000000" value={form.beri} onChange={(event) => field('beri', event.target.value)} /></label><label>Ruby<input type="number" min="0" max="2000000000" value={form.ruby} onChange={(event) => field('ruby', event.target.value)} /></label></div>
          <label>Vật phẩm <small>Mỗi dòng: loại,id,số lượng — loại 3, 4 hoặc 7</small><textarea value={form.rewards} onChange={(event) => field('rewards', event.target.value)} placeholder={'4,427,1\n7,10,5'} rows={4} /></label>
          <label>Thông báo nhận quà<textarea value={form.message} onChange={(event) => field('message', event.target.value)} maxLength={1000} rows={3} /></label>
          <label>Giới hạn lượt nhập<input type="number" min={selected?.usedCount ?? 1} max="1000000" value={form.maxRedemptions} onChange={(event) => field('maxRedemptions', event.target.value)} /></label>
          <label>Tài khoản được nhận <small>Để trống nếu áp dụng toàn máy chủ; phân cách bằng dấu phẩy.</small><textarea value={form.eligibleUsers} onChange={(event) => field('eligibleUsers', event.target.value)} rows={3} /></label>
          <label>Lý do thay đổi<input value={form.reason} onChange={(event) => field('reason', event.target.value)} maxLength={240} placeholder="Bắt buộc để ghi audit" required /></label>
          {error && <p className="admin-action-error" role="alert">{error}</p>}{success && <p className="admin-action-success" role="status">{success}</p>}
          <button className="admin-gift-save" type="submit" disabled={saving}>{saving ? 'Đang lưu…' : selected ? 'Lưu thay đổi' : 'Tạo gift code'}</button>
        </form>
      </section>
    </div>
  </div>;
}
