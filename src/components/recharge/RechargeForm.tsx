'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface DenomOption {
  value: number;
  label: string;
  ruby: number;
  bonus: number;
}

const TELCOS = [
  { id: 'VIETTEL', label: 'Viettel' },
  { id: 'VINAPHONE', label: 'VinaPhone' },
  { id: 'MOBIFONE', label: 'MobiFone' },
  { id: 'ZING', label: 'Thẻ Zing' },
  { id: 'GATE', label: 'Thẻ Gate' },
];

const DENOMS: DenomOption[] = [
  { value: 10000, label: '10.000 đ', ruby: 100, bonus: 20 },
  { value: 20000, label: '20.000 đ', ruby: 200, bonus: 40 },
  { value: 50000, label: '50.000 đ', ruby: 500, bonus: 120 },
  { value: 100000, label: '100.000 đ', ruby: 1000, bonus: 300 },
  { value: 200000, label: '200.000 đ', ruby: 2000, bonus: 700 },
  { value: 500000, label: '500.000 đ', ruby: 5000, bonus: 2000 },
  { value: 1000000, label: '1.000.000 đ', ruby: 10000, bonus: 5000 },
];

export function RechargeForm() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'card' | 'bank' | 'momo'>('card');
  const [selectedTelco, setSelectedTelco] = useState('VIETTEL');
  const [selectedDenom, setSelectedDenom] = useState<DenomOption>(DENOMS[3]); // 100k
  const [username, setUsername] = useState(user?.user || '');
  const [serial, setSerial] = useState('');
  const [pin, setPin] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleSubmitCard = (e: React.FormEvent) => {
    e.preventDefault();
    const accountName = username.trim() || user?.user;
    if (!accountName) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập tên tài khoản nhận Ruby.' });
      return;
    }
    if (!serial.trim() || !pin.trim()) {
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập đầy đủ Số Seri và Mã Thẻ PIN.' });
      return;
    }

    setIsSubmitting(true);
    setStatusMessage(null);

    // Simulate recharge request
    setTimeout(() => {
      setIsSubmitting(false);
      setStatusMessage({
        type: 'success',
        text: `Đã gửi thẻ ${selectedTelco} mệnh giá ${selectedDenom.label} cho tài khoản "${accountName}". Hệ thống đang xử lý, Ruby sẽ được cộng trong 30s!`,
      });
      setSerial('');
      setPin('');
    }, 900);
  };

  const totalRuby = selectedDenom.ruby + selectedDenom.bonus;

  return (
    <div className="recharge-layout">
      <div className="recharge-box">
        <div className="recharge-tabs">
          <button
            type="button"
            className={`recharge-tab ${activeTab === 'card' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('card')}
          >
            💳 THẺ CÀO
          </button>
          <button
            type="button"
            className={`recharge-tab ${activeTab === 'bank' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('bank')}
          >
            🏦 CHUYỂN KHOẢN QR
          </button>
          <button
            type="button"
            className={`recharge-tab ${activeTab === 'momo' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('momo')}
          >
            📱 VÍ MOMO
          </button>
        </div>

        <div className="recharge-card-body">
          {activeTab === 'card' && (
            <form className="recharge-form" onSubmit={handleSubmitCard}>
              <div className="form-row">
                <label>1. Chọn loại thẻ cào</label>
                <div className="telco-selector">
                  {TELCOS.map((telco) => (
                    <button
                      key={telco.id}
                      type="button"
                      className={`telco-btn ${selectedTelco === telco.id ? 'is-selected' : ''}`}
                      onClick={() => setSelectedTelco(telco.id)}
                    >
                      {telco.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label>2. Chọn mệnh giá</label>
                <div className="denom-grid">
                  {DENOMS.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      className={`denom-btn ${selectedDenom.value === d.value ? 'is-selected' : ''}`}
                      onClick={() => setSelectedDenom(d)}
                    >
                      <strong>{d.label}</strong>
                      <small>+{d.ruby + d.bonus} Ruby</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="rec-username">3. Tên tài khoản nhận Ruby</label>
                <input
                  id="rec-username"
                  type="text"
                  placeholder="Nhập tên đăng nhập nhân vật"
                  value={username || user?.user || ''}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="rec-serial">4. Số Seri</label>
                <input
                  id="rec-serial"
                  type="text"
                  placeholder="Nhập số seri in trên thẻ"
                  value={serial}
                  onChange={(e) => setSerial(e.target.value)}
                  required
                />
              </div>

              <div className="form-row">
                <label htmlFor="rec-pin">5. Mã thẻ (Mã PIN)</label>
                <input
                  id="rec-pin"
                  type="password"
                  placeholder="Nhập mã cào dưới lớp tráng bạc"
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  required
                />
              </div>

              <div className="recharge-summary-box">
                <span>Nhận được (Gốc + KM 20-50%):</span>
                <strong>{totalRuby.toLocaleString('vi-VN')} RUBY</strong>
              </div>

              {statusMessage && (
                <div
                  style={{
                    padding: '12px 14px',
                    border: '2px solid',
                    borderColor: statusMessage.type === 'success' ? '#2e7d32' : '#c62828',
                    backgroundColor: statusMessage.type === 'success' ? '#e8f5e9' : '#ffebee',
                    color: statusMessage.type === 'success' ? '#1b5e20' : '#b71c1c',
                    fontSize: '13px',
                    fontWeight: 600,
                  }}
                >
                  {statusMessage.text}
                </div>
              )}

              <button type="submit" className="recharge-submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'ĐANG XỬ LÝ...' : 'XÁC NHẬN NẠP THẺ'}
              </button>
            </form>
          )}

          {activeTab === 'bank' && (
            <div className="bank-transfer-details">
              <div className="bank-qr-card">
                <div className="bank-qr-mock">
                  <span style={{ fontSize: '28px', marginBottom: '4px' }}>📱</span>
                  <strong>VIETQR 24/7</strong>
                  <span>Quét mã nạp tự động</span>
                </div>
                <div className="bank-info-lines">
                  <p>Ngân hàng: <strong>MB BANK (Quân Đội)</strong></p>
                  <p>Số tài khoản: <strong>999988886666</strong></p>
                  <p>Chủ tài khoản: <strong>HAI TAC TI HON</strong></p>
                  <p>
                    Cú pháp: <strong>HTTH {user?.user || 'TENTAIKHOAN'}</strong>
                  </p>
                  <p style={{ color: '#c62828', fontSize: '11px' }}>
                    * Vui lòng ghi đúng cú pháp tên tài khoản để hệ thống tự động cộng Ruby sau 15-30 giây.
                  </p>
                </div>
              </div>
              <div className="recharge-summary-box">
                <span>Ưu đãi Chuyển khoản QR:</span>
                <strong>+10% RUBY SO VỚI THẺ CÀO</strong>
              </div>
            </div>
          )}

          {activeTab === 'momo' && (
            <div className="bank-transfer-details">
              <div className="bank-qr-card">
                <div className="bank-qr-mock" style={{ background: '#fdf2f8', borderColor: '#be185d' }}>
                  <span style={{ fontSize: '28px', marginBottom: '4px' }}>💖</span>
                  <strong style={{ color: '#be185d' }}>MOMO PAY</strong>
                  <span>Tự động 24/7</span>
                </div>
                <div className="bank-info-lines">
                  <p>Ví điện tử: <strong>MoMo</strong></p>
                  <p>Số điện thoại ví: <strong>0988 888 888</strong></p>
                  <p>Tên người nhận: <strong>HAI TAC TI HON</strong></p>
                  <p>
                    Lời nhắn: <strong>HTTH {user?.user || 'TENTAIKHOAN'}</strong>
                  </p>
                  <p style={{ color: '#be185d', fontSize: '11px' }}>
                    * Hệ thống quét giao dịch MoMo tự động 24/7, cộng Ruby ngay tức thì.
                  </p>
                </div>
              </div>
              <div className="recharge-summary-box">
                <span>Ưu đãi Ví MoMo:</span>
                <strong>KHUYẾN MÃI +25% RUBY</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="recharge-sidebar-box">
        <div className="rate-card">
          <div className="rate-card__head">
            <h3>BẢNG TỶ LỆ RUBY</h3>
            <span>TỶ LỆ CHUẨN</span>
          </div>
          <div className="rate-card__body">
            <table className="rate-table">
              <thead>
                <tr>
                  <th>Mệnh giá</th>
                  <th>Ruby gốc</th>
                  <th>Nhận thực tế</th>
                </tr>
              </thead>
              <tbody>
                {DENOMS.map((d) => (
                  <tr key={d.value}>
                    <td>{d.label}</td>
                    <td>{d.ruby.toLocaleString('vi-VN')}</td>
                    <td>{(d.ruby + d.bonus).toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rate-card">
          <div className="rate-card__head">
            <h3>MỐC VIP & QUÀ TẶNG</h3>
            <span>TÍCH LŨY</span>
          </div>
          <div className="rate-card__body">
            <ul className="vip-perks-list">
              <li>
                <strong>VIP 1 (50k):</strong> Nhận Rương Ác Quỷ Sơ Cấp + 100k Beri.
              </li>
              <li>
                <strong>VIP 3 (200k):</strong> Thú Cưỡi Tuần Lộc + Danh Hiệu Thuyền Trưởng.
              </li>
              <li>
                <strong>VIP 5 (500k):</strong> Rương Đại Ác Quỷ + Set Thời Trang Hải Tặc.
              </li>
              <li>
                <strong>VIP 10 (2tr):</strong> Trái Ác Quỷ Tự Chọn + Hiệu Ứng Hào Quang VIP.
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
