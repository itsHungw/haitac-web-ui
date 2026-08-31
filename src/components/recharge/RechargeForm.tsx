'use client';

import { useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';

interface DenomOption {
  value: number;
  label: string;
  coin: number;
}

const TELCOS = [
  { id: 'VIETTEL', label: 'Viettel' },
  { id: 'VINAPHONE', label: 'VinaPhone' },
  { id: 'MOBIFONE', label: 'MobiFone' },
  { id: 'ZING', label: 'Thẻ Zing' },
  { id: 'GATE', label: 'Thẻ Gate' },
];

const DENOMS: DenomOption[] = [
  { value: 10000, label: '10.000 đ', coin: 10000 },
  { value: 20000, label: '20.000 đ', coin: 20000 },
  { value: 50000, label: '50.000 đ', coin: 50000 },
  { value: 100000, label: '100.000 đ', coin: 100000 },
  { value: 200000, label: '200.000 đ', coin: 200000 },
  { value: 500000, label: '500.000 đ', coin: 500000 },
  { value: 1000000, label: '1.000.000 đ', coin: 1000000 },
];

export function RechargeForm() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'bank' | 'momo' | 'card'>('bank');
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
      setStatusMessage({ type: 'error', text: 'Vui lòng nhập tên tài khoản nhận Coin.' });
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
        text: `Đã gửi thẻ ${selectedTelco} mệnh giá ${selectedDenom.label} cho tài khoản "${accountName}". Coin sẽ được cộng sau khi đối tác xác nhận thẻ.`,
      });
      setSerial('');
      setPin('');
    }, 900);
  };

  return (
    <div className="recharge-layout">
      <div className="recharge-box">
        <div className="recharge-tabs">
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
          <button
            type="button"
            className={`recharge-tab ${activeTab === 'card' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('card')}
          >
            💳 THẺ CÀO
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
                      <small>{d.coin.toLocaleString('vi-VN')} Coin</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className="form-row">
                <label htmlFor="rec-username">3. Tên tài khoản nhận Coin</label>
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
                <span>Coin dự kiến sau khi thẻ được xác nhận:</span>
                <strong>{selectedDenom.coin.toLocaleString('vi-VN')} COIN</strong>
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
                  <span>Kênh nạp ưu tiên</span>
                </div>
                <div className="bank-info-lines">
                  <p>Ngân hàng: <strong>MB BANK (Quân Đội)</strong></p>
                  <p>Số tài khoản: <strong>999988886666</strong></p>
                  <p>Chủ tài khoản: <strong>HAI TAC TI HON</strong></p>
                  <p>
                    Cú pháp: <strong>HTTH {user?.user || 'TENTAIKHOAN'}</strong>
                  </p>
                  <p style={{ color: '#c62828', fontSize: '11px' }}>
                    * Ghi đúng nội dung để Coin được cộng vào đúng tài khoản sau khi giao dịch được xác nhận.
                  </p>
                </div>
              </div>
              <div className="recharge-summary-box">
                <span>Chuyển khoản ngân hàng:</span>
                <strong>1 VNĐ = 1 COIN</strong>
              </div>
            </div>
          )}

          {activeTab === 'momo' && (
            <div className="bank-transfer-details">
              <div className="bank-qr-card">
                <div className="bank-qr-mock" style={{ background: '#fdf2f8', borderColor: '#be185d' }}>
                  <span style={{ fontSize: '28px', marginBottom: '4px' }}>💖</span>
                  <strong style={{ color: '#be185d' }}>MOMO PAY</strong>
                  <span>Nạp Coin bằng ví</span>
                </div>
                <div className="bank-info-lines">
                  <p>Ví điện tử: <strong>MoMo</strong></p>
                  <p>Số điện thoại ví: <strong>0988 888 888</strong></p>
                  <p>Tên người nhận: <strong>HAI TAC TI HON</strong></p>
                  <p>
                    Lời nhắn: <strong>HTTH {user?.user || 'TENTAIKHOAN'}</strong>
                  </p>
                  <p style={{ color: '#be185d', fontSize: '11px' }}>
                    * Ghi đúng lời nhắn để Coin được cộng vào đúng tài khoản sau khi giao dịch được xác nhận.
                  </p>
                </div>
              </div>
              <div className="recharge-summary-box">
                <span>Nạp qua Ví MoMo:</span>
                <strong>1 VNĐ = 1 COIN</strong>
              </div>
            </div>
          )}
        </div>
      </div>

      <aside className="recharge-sidebar-box">
        <div className="rate-card">
          <div className="rate-card__head">
            <h3>BẢNG NẠP COIN</h3>
            <span>CHUYỂN KHOẢN / VÍ</span>
          </div>
          <div className="rate-card__body">
            <table className="rate-table">
              <thead>
                <tr>
                  <th>Mệnh giá</th>
                  <th>Coin nhận</th>
                </tr>
              </thead>
              <tbody>
                {DENOMS.map((d) => (
                  <tr key={d.value}>
                    <td>{d.label}</td>
                    <td>{d.coin.toLocaleString('vi-VN')}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rate-card">
          <div className="rate-card__head">
            <h3>COIN DÙNG ĐỂ LÀM GÌ?</h3>
            <span>NPC NAMI</span>
          </div>
          <div className="rate-card__body">
            <ul className="coin-use-list">
              <li>
                <strong>Mở thành viên:</strong> 10.000 Coin để mở giao dịch, chợ và chat thế giới.
              </li>
              <li>
                <strong>Đổi Ruby:</strong> 10 Coin nhận 2 Ruby tại NPC Nami.
              </li>
              <li>
                <strong>Đổi Beri:</strong> 1 Coin nhận 5.000 Beri tại NPC Nami.
              </li>
              <li>
                <strong>Đổi Extol:</strong> 1.000 Ruby nhận 750.000 Extol tại NPC Nami.
              </li>
            </ul>
          </div>
        </div>
      </aside>
    </div>
  );
}
