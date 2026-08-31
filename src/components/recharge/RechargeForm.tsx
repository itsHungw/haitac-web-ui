'use client';

import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  BadgeCheck, Check, Clock3, Coins, Copy, Landmark, LoaderCircle, LockKeyhole,
  QrCode, RefreshCcw, ShieldCheck, TriangleAlert,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paymentService } from '@/features/payment/services/payment.service';
import type { PaymentConfig, PaymentOrder } from '@/features/payment/types/payment.types';
import { extractErrorMessage } from '@/lib/api/errors';

const number = new Intl.NumberFormat('vi-VN');
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const PRESETS = [10_000, 20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000, 10_000_000];

function countdown(expiresAt: string, now: number) {
  const remaining = Math.max(0, Math.ceil((new Date(expiresAt).getTime() - now) / 1000));
  return `${String(Math.floor(remaining / 60)).padStart(2, '0')}:${String(remaining % 60).padStart(2, '0')}`;
}

export function RechargeForm() {
  const { user, isLoading: authLoading } = useAuth();
  const [config, setConfig] = useState<PaymentConfig | null>(null);
  const [amount, setAmount] = useState('100000');
  const [order, setOrder] = useState<PaymentOrder | null>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState<'account' | 'content' | null>(null);
  const [now, setNow] = useState(Date.now());
  const pendingOrderStorageKey = user ? `htth:pending-payment:${user.user}` : '';

  useEffect(() => {
    if (authLoading) return;
    if (!user) {
      setLoadingConfig(false);
      return;
    }
    let cancelled = false;
    setLoadingConfig(true);
    paymentService.getConfig()
      .then(async (next) => {
        if (cancelled) return;
        setConfig(next);
        setAmount(String(Math.max(next.minAmountVnd, 100_000)));
        const savedOrderId = window.localStorage.getItem(`htth:pending-payment:${user.user}`);
        if (savedOrderId) {
          try {
            const savedOrder = await paymentService.getOrder(savedOrderId);
            if (!cancelled) setOrder(savedOrder);
            if (savedOrder.status !== 'PENDING') {
              window.localStorage.removeItem(`htth:pending-payment:${user.user}`);
            }
          } catch {
            window.localStorage.removeItem(`htth:pending-payment:${user.user}`);
          }
        }
      })
      .catch((reason) => { if (!cancelled) setError(extractErrorMessage(reason)); })
      .finally(() => { if (!cancelled) setLoadingConfig(false); });
    return () => { cancelled = true; };
  }, [authLoading, user]);

  useEffect(() => {
    if (!order || order.status !== 'PENDING') return;
    let cancelled = false;
    const poll = async () => {
      try {
        const next = await paymentService.getOrder(order.publicId);
        if (!cancelled) {
          setOrder(next);
          if (next.status !== 'PENDING' && pendingOrderStorageKey) {
            window.localStorage.removeItem(pendingOrderStorageKey);
          }
        }
      } catch {
        // Giữ QR hiện tại khi mạng chập chờn; lần polling sau sẽ tự thử lại.
      }
    };
    const interval = window.setInterval(() => { void poll(); }, 3_000);
    return () => { cancelled = true; window.clearInterval(interval); };
  }, [order?.publicId, order?.status, pendingOrderStorageKey]);

  useEffect(() => {
    if (!order || order.status !== 'PENDING') return;
    const interval = window.setInterval(() => setNow(Date.now()), 1_000);
    return () => window.clearInterval(interval);
  }, [order?.publicId, order?.status]);

  const parsedAmount = Number(amount);
  const selectablePresets = useMemo(
    () => config ? PRESETS.filter((value) => value >= config.minAmountVnd && value <= config.maxAmountVnd) : PRESETS,
    [config],
  );
  const validAmount = Boolean(config)
    && Number.isSafeInteger(parsedAmount)
    && parsedAmount >= config!.minAmountVnd
    && parsedAmount <= config!.maxAmountVnd
    && parsedAmount % config!.amountStepVnd === 0;

  async function createOrder() {
    if (!validAmount || creating) return;
    setCreating(true);
    setError('');
    try {
      const next = await paymentService.createOrder(parsedAmount);
      setOrder(next);
      if (pendingOrderStorageKey) window.localStorage.setItem(pendingOrderStorageKey, next.publicId);
      setNow(Date.now());
    } catch (reason) {
      setError(extractErrorMessage(reason));
    } finally {
      setCreating(false);
    }
  }

  async function copy(value: string, field: 'account' | 'content') {
    await navigator.clipboard.writeText(value);
    setCopied(field);
    window.setTimeout(() => setCopied(null), 1_500);
  }

  if (authLoading || loadingConfig) {
    return <div className="payment-loading" aria-label="Đang tải cổng nạp"><LoaderCircle aria-hidden="true" /><span>Đang kết nối cổng nạp an toàn…</span></div>;
  }

  if (!user) {
    return <section className="payment-gate">
      <LockKeyhole aria-hidden="true" />
      <span>TÀI KHOẢN BẮT BUỘC</span>
      <h2>Đăng nhập trước khi tạo QR</h2>
      <p>Coin được cộng thẳng vào tài khoản đang đăng nhập, không cần chọn nhân vật.</p>
      <Link href="/login">Đăng nhập để nạp Coin</Link>
    </section>;
  }

  if (!config) {
    return <section className="payment-gate is-unavailable">
      <TriangleAlert aria-hidden="true" />
      <span>KHÔNG TẢI ĐƯỢC CỔNG NẠP</span>
      <h2>Chưa thể lấy cấu hình payOS</h2>
      <p>{error || 'Vui lòng tải lại trang hoặc quay lại sau.'}</p>
    </section>;
  }

  if (!config.enabled && !order) {
    return <section className="payment-gate is-unavailable">
      <TriangleAlert aria-hidden="true" />
      <span>PAYOS CHƯA SẴN SÀNG</span>
      <h2>Kênh nạp đang được cấu hình</h2>
      <p>{error || 'Quản trị viên cần tạo Kênh thanh toán payOS và xác nhận webhook trước khi nhận giao dịch thật.'}</p>
    </section>;
  }

  return <div className="payment-layout">
    <section className="payment-main">
      {!order && <>
        <header className="payment-heading">
          <span><QrCode aria-hidden="true" /> VIETQR TỰ ĐỘNG 24/7</span>
          <h2>Chọn số Coin muốn nạp</h2>
          <p>Đơn thuộc tài khoản <strong>{user.user}</strong>. Tiền chuyển thẳng vào ngân hàng của máy chủ.</p>
        </header>

        <div className="payment-presets" aria-label="Mệnh giá nạp nhanh">
          {selectablePresets.map((value) => <button
            className={parsedAmount === value ? 'is-selected' : ''}
            key={value}
            onClick={() => setAmount(String(value))}
            type="button"
          ><strong>{value >= 1_000_000 ? `${value / 1_000_000} triệu` : `${number.format(value / 1_000)}K`}</strong><small>{number.format(value * config.coinPerVnd)} Coin</small></button>)}
        </div>

        <label className="payment-custom-amount" htmlFor="payment-amount">
          <span>SỐ TIỀN KHÁC</span>
          <div><input
            id="payment-amount"
            inputMode="numeric"
            min={config.minAmountVnd}
            max={config.maxAmountVnd}
            step={config.amountStepVnd}
            value={amount}
            onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))}
          /><b>VNĐ</b></div>
          <small>Từ {money.format(config.minAmountVnd)} đến {money.format(config.maxAmountVnd)}, bước {money.format(config.amountStepVnd)}.</small>
        </label>

        <div className="payment-order-summary">
          <div><span>Bạn chuyển</span><strong>{Number.isFinite(parsedAmount) ? money.format(parsedAmount) : '—'}</strong></div>
          <i aria-hidden="true">→</i>
          <div><span>Tài khoản nhận</span><strong>{validAmount ? `${number.format(parsedAmount * config.coinPerVnd)} Coin` : '—'}</strong></div>
        </div>
        {error && <p className="payment-error" role="alert">{error}</p>}
        <button className="payment-create-button" disabled={!validAmount || creating} onClick={() => { void createOrder(); }} type="button">
          {creating ? <><LoaderCircle className="is-spinning" /> Đang tạo QR…</> : <><QrCode /> Tạo mã VietQR</>}
        </button>
      </>}

      {order?.status === 'PENDING' && <div className="payment-pending">
        <header><div><span>ĐƠN NẠP ĐANG CHỜ</span><h2>Quét QR để hoàn tất</h2></div><time><Clock3 /> {countdown(order.expiresAt, now)}</time></header>
        <div className="payment-qr-stage">
          <div className="payment-qr-frame"><QRCodeSVG value={order.qrCode} size={320} level="M" marginSize={4} title={`Mã VietQR cho đơn ${order.publicId}`} /></div>
          <div className="payment-bank-details">
            <span><Landmark /> {order.bankCode}</span>
            <h3>{order.bankAccountName}</h3>
            <dl>
              <div><dt>Số tài khoản</dt><dd>{order.bankAccount}<button type="button" aria-label="Sao chép số tài khoản" onClick={() => { void copy(order.bankAccount, 'account'); }}>{copied === 'account' ? <Check /> : <Copy />}</button></dd></div>
              <div><dt>Số tiền chính xác</dt><dd>{money.format(order.amountVnd)}</dd></div>
              <div className="is-content"><dt>Nội dung bắt buộc</dt><dd>{order.transferContent}<button type="button" aria-label="Sao chép nội dung chuyển khoản" onClick={() => { void copy(order.transferContent, 'content'); }}>{copied === 'content' ? <Check /> : <Copy />}</button></dd></div>
            </dl>
            <p><TriangleAlert /> Không sửa số tiền hoặc nội dung. Hệ thống chỉ cộng Coin khi khớp hoàn toàn.</p>
          </div>
        </div>
        <div className="payment-waiting"><span /><div><strong>Đang chờ ngân hàng xác nhận</strong><small>Trang tự kiểm tra mỗi 3 giây, bạn không cần tải lại.</small></div></div>
        <button className="payment-secondary-button" type="button" onClick={() => { if (pendingOrderStorageKey) window.localStorage.removeItem(pendingOrderStorageKey); setOrder(null); }}>Tạo đơn khác</button>
      </div>}

      {order?.status === 'PAID' && <div className="payment-result is-paid">
        <BadgeCheck aria-hidden="true" /><span>GIAO DỊCH THÀNH CÔNG</span><h2>Đã cộng {number.format(order.expectedCoin)} Coin</h2>
        <p>Coin đã vào tài khoản <strong>{user.user}</strong>{order.coinBalance !== null ? ` · Số dư mới ${number.format(order.coinBalance)} Coin` : ''}.</p>
        <div><Link href="/profile">Xem hồ sơ</Link><button type="button" onClick={() => { if (pendingOrderStorageKey) window.localStorage.removeItem(pendingOrderStorageKey); setOrder(null); }}>Nạp thêm</button></div>
      </div>}

      {order && ['EXPIRED', 'CANCELLED'].includes(order.status) && <div className="payment-result is-expired">
        <Clock3 aria-hidden="true" /><span>ĐƠN ĐÃ HẾT HẠN</span><h2>Tạo QR mới để tiếp tục</h2>
        <p>Không chuyển tiền bằng QR cũ. Giao dịch đến muộn sẽ được đưa vào đối soát thủ công.</p>
        <button type="button" onClick={() => { if (pendingOrderStorageKey) window.localStorage.removeItem(pendingOrderStorageKey); setOrder(null); }}><RefreshCcw /> Tạo đơn mới</button>
      </div>}

      {order?.status === 'REVIEW' && <div className="payment-result is-review">
        <TriangleAlert aria-hidden="true" /><span>ĐANG ĐỐI SOÁT</span><h2>Giao dịch chưa khớp hoàn toàn</h2>
        <p>Hệ thống đã ghi nhận tiền vào nhưng số tiền hoặc thông tin đơn chưa đúng. Quản trị viên sẽ kiểm tra, không cần chuyển thêm.</p>
      </div>}
    </section>

    <aside className="payment-assurance">
      <span>LUỒNG TIỀN MINH BẠCH</span>
      <h3>Tiền vào thẳng ngân hàng</h3>
      <ol><li><b>01</b><div><strong>Tạo đơn riêng</strong><small>Mỗi QR có mã không trùng.</small></div></li><li><b>02</b><div><strong>Chuyển khoản VietQR</strong><small>Tiền vào thẳng ngân hàng.</small></div></li><li><b>03</b><div><strong>payOS xác nhận</strong><small>Webhook được kiểm tra chữ ký.</small></div></li><li><b>04</b><div><strong>Coin được cộng</strong><small>Một giao dịch chỉ được cộng một lần.</small></div></li></ol>
      <div className="payment-security-note"><ShieldCheck /><p><strong>Bảo vệ tự động</strong><br />Đúng tài khoản nhận · đúng số tiền · đúng mã đơn.</p></div>
      <div className="payment-rate-note"><Coins /><p><span>TỶ LỆ HIỆN TẠI</span><strong>1 VNĐ = {config.coinPerVnd} Coin</strong></p></div>
    </aside>
  </div>;
}
