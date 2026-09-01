'use client';

import Link from 'next/link';
import { QRCodeSVG } from 'qrcode.react';
import {
  ArrowRight, BadgeCheck, Banknote, Check, Clock3, Coins, Copy, Landmark,
  LoaderCircle, LockKeyhole, QrCode, RefreshCcw, ShieldCheck, Smartphone,
  TriangleAlert, UserRound,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { paymentService } from '@/features/payment/services/payment.service';
import type { PaymentConfig, PaymentOrder } from '@/features/payment/types/payment.types';
import { extractErrorMessage } from '@/lib/api/errors';

const number = new Intl.NumberFormat('vi-VN');
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const PRESETS = [10_000, 50_000, 100_000, 200_000, 500_000, 1_000_000];

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
  const [reconciling, setReconciling] = useState(false);
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
            if (['PAID', 'CANCELLED'].includes(savedOrder.status)) {
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
          if (['PAID', 'CANCELLED'].includes(next.status) && pendingOrderStorageKey) {
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
  const formattedAmount = amount && Number.isFinite(parsedAmount) ? number.format(parsedAmount) : '';
  const amountHint = !config
    ? ''
    : !amount
    ? 'Nhập số tiền bạn muốn chuyển.'
    : validAmount
      ? `Bạn sẽ nhận ${number.format(parsedAmount * config.coinPerVnd)} Coin.`
      : `Số tiền phải từ ${money.format(config.minAmountVnd)} đến ${money.format(config.maxAmountVnd)} và là bội số của ${money.format(config.amountStepVnd)}.`;

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

  async function reconcileOrders() {
    if (reconciling) return;
    setReconciling(true);
    setError('');
    try {
      const reconciled = await paymentService.reconcileOrders();
      const current = order
        ? reconciled.find((candidate) => candidate.publicId === order.publicId)
        : reconciled[reconciled.length - 1];
      if (current) {
        setOrder(current);
        if (current.status === 'PAID' && pendingOrderStorageKey) {
          window.localStorage.removeItem(pendingOrderStorageKey);
        }
      }
    } catch (reason) {
      setError(extractErrorMessage(reason));
    } finally {
      setReconciling(false);
    }
  }

  if (authLoading || loadingConfig) {
    return <div className="payment-loading" role="status" aria-live="polite"><LoaderCircle aria-hidden="true" /><span>Đang chuẩn bị trang nạp Coin…</span></div>;
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
      <span>TẠM THỜI GIÁN ĐOẠN</span>
      <h2>Chưa thể mở kênh nạp Coin</h2>
      <p>{error || 'Bạn chưa bị trừ tiền. Vui lòng tải lại trang sau ít phút.'}</p>
      <button type="button" onClick={() => window.location.reload()}><RefreshCcw /> Tải lại trang</button>
    </section>;
  }

  if (!config.enabled && !order) {
    return <section className="payment-gate is-unavailable">
      <TriangleAlert aria-hidden="true" />
      <span>KÊNH NẠP ĐANG TẠM ĐÓNG</span>
      <h2>Chưa thể tạo mã thanh toán</h2>
      <p>{error || 'Bạn chưa bị trừ tiền. Vui lòng quay lại sau.'}</p>
    </section>;
  }

  return <div className="payment-layout">
    <section className="payment-main">
      {!order && <>
        <header className="payment-heading">
          <span><Coins aria-hidden="true" /> BƯỚC 1 TRÊN 3</span>
          <h2>Chọn số tiền muốn nạp</h2>
          <p>Chọn mệnh giá quen thuộc hoặc nhập số tiền khác. Bạn sẽ xem lại số Coin trước khi tạo mã.</p>
        </header>

        <div className="payment-account-chip">
          <UserRound aria-hidden="true" />
          <div><span>Coin sẽ vào tài khoản</span><strong>{user.user}</strong></div>
          <small>Dùng chung cho mọi nhân vật</small>
        </div>

        <div className="payment-presets" role="group" aria-label="Chọn nhanh số tiền nạp">
          {selectablePresets.map((value) => <button
            className={parsedAmount === value ? 'is-selected' : ''}
            key={value}
            onClick={() => setAmount(String(value))}
            type="button"
            aria-pressed={parsedAmount === value}
          ><strong>{money.format(value)}</strong><small>Nhận {number.format(value * config.coinPerVnd)} Coin</small></button>)}
        </div>

        <div className={`payment-custom-amount${amount && !validAmount ? ' is-invalid' : ''}`}>
          <label htmlFor="payment-amount">Hoặc nhập số tiền khác</label>
          <div><Banknote aria-hidden="true" /><input
            id="payment-amount"
            inputMode="numeric"
            autoComplete="off"
            min={config.minAmountVnd}
            max={config.maxAmountVnd}
            step={config.amountStepVnd}
            value={formattedAmount}
            aria-describedby="payment-amount-hint"
            aria-invalid={Boolean(amount && !validAmount)}
            onChange={(event) => setAmount(event.target.value.replace(/\D/g, ''))}
          /><b>VNĐ</b></div>
          <small id="payment-amount-hint">{amountHint}</small>
        </div>

        <div className="payment-order-summary" aria-label="Tóm tắt số tiền và Coin nhận được">
          <div><span>Số tiền chuyển</span><strong>{validAmount ? money.format(parsedAmount) : '—'}</strong></div>
          <ArrowRight aria-hidden="true" />
          <div><span>Coin nhận được</span><strong>{validAmount ? `${number.format(parsedAmount * config.coinPerVnd)} Coin` : '—'}</strong></div>
        </div>
        {error && <p className="payment-error" role="alert">{error}</p>}
        <button className="payment-create-button" disabled={!validAmount || creating} onClick={() => { void createOrder(); }} type="button">
          {creating ? <><LoaderCircle className="is-spinning" /> Đang tạo mã an toàn…</> : <><QrCode /> Tạo mã QR chuyển khoản</>}
        </button>
        <p className="payment-submit-note"><ShieldCheck aria-hidden="true" /> Bạn chưa bị trừ tiền ở bước này.</p>
      </>}

      {order?.status === 'PENDING' && <div className="payment-pending">
        <header>
          <div><span><Smartphone aria-hidden="true" /> BƯỚC 2 TRÊN 3</span><h2>Quét mã bằng ứng dụng ngân hàng</h2><p>Thông tin chuyển khoản đã được điền sẵn trong mã QR.</p></div>
          <time aria-label={`Mã còn hiệu lực ${countdown(order.expiresAt, now)}`}><Clock3 aria-hidden="true" /><small>Mã còn hiệu lực</small><strong>{countdown(order.expiresAt, now)}</strong></time>
        </header>
        <div className="payment-qr-stage">
          <div className="payment-qr-column">
            <div className="payment-qr-frame"><QRCodeSVG value={order.qrCode} size={320} level="M" marginSize={4} title="Mã QR chuyển khoản ngân hàng" /></div>
            <p>Mở ứng dụng ngân hàng và chọn <strong>Quét QR</strong></p>
          </div>
          <div className="payment-bank-details">
            <span><Landmark aria-hidden="true" /> THÔNG TIN CHUYỂN KHOẢN</span>
            <h3>{order.bankAccountName}</h3>
            <dl>
              <div><dt>Ngân hàng</dt><dd>{order.bankCode}</dd></div>
              <div><dt>Số tài khoản nhận</dt><dd>{order.bankAccount}<button type="button" aria-label="Sao chép số tài khoản" onClick={() => { void copy(order.bankAccount, 'account'); }}>{copied === 'account' ? <><Check /> Đã chép</> : <><Copy /> Sao chép</>}</button></dd></div>
              <div className="is-amount"><dt>Số tiền cần chuyển</dt><dd>{money.format(order.amountVnd)}</dd></div>
              <div className="is-content"><dt>Nội dung chuyển khoản</dt><dd>{order.transferContent}<button type="button" aria-label="Sao chép nội dung chuyển khoản" onClick={() => { void copy(order.transferContent, 'content'); }}>{copied === 'content' ? <><Check /> Đã chép</> : <><Copy /> Sao chép</>}</button></dd></div>
            </dl>
            <p><TriangleAlert aria-hidden="true" /> Nếu nhập thủ công, hãy giữ nguyên số tiền và nội dung ở trên.</p>
          </div>
        </div>
        <div className="payment-waiting" role="status" aria-live="polite"><span /><div><strong>Đang chờ giao dịch hoàn tất</strong><small>Sau khi bạn chuyển khoản, Coin thường được cộng trong vài giây. Không cần tạo hoặc thanh toán thêm mã khác.</small></div></div>
        {error && <p className="payment-error" role="alert">{error}</p>}
        <button className="payment-secondary-button" disabled={reconciling} type="button" onClick={() => { void reconcileOrders(); }}>
          {reconciling ? <><LoaderCircle className="is-spinning" /> Đang kiểm tra giao dịch…</> : <><RefreshCcw /> Tôi đã chuyển tiền · Kiểm tra ngay</>}
        </button>
      </div>}

      {order?.status === 'PAID' && <div className="payment-result is-paid">
        <BadgeCheck aria-hidden="true" /><span>HOÀN TẤT · BƯỚC 3 TRÊN 3</span><h2>Nạp Coin thành công</h2>
        <strong className="payment-result-amount">+{number.format(order.expectedCoin)} Coin</strong>
        <p>Coin đã được cộng vào tài khoản <strong>{user.user}</strong>{order.coinBalance !== null ? ` · Số dư hiện tại ${number.format(order.coinBalance)} Coin` : ''}.</p>
        <div><Link href="/profile">Xem Coin trong hồ sơ</Link><button type="button" onClick={() => { if (pendingOrderStorageKey) window.localStorage.removeItem(pendingOrderStorageKey); setOrder(null); }}>Nạp thêm</button></div>
      </div>}

      {order && ['EXPIRED', 'CANCELLED'].includes(order.status) && <div className="payment-result is-expired">
        <Clock3 aria-hidden="true" /><span>MÃ THANH TOÁN ĐÃ HẾT HẠN</span><h2>Bạn đã chuyển tiền chưa?</h2>
        <p>Nếu chưa chuyển, hãy tạo mã mới. Nếu đã chuyển, chọn kiểm tra giao dịch — tuyệt đối không chuyển thêm lần nữa.</p>
        {error && <p className="payment-error" role="alert">{error}</p>}
        {order.status === 'EXPIRED' && <button type="button" disabled={reconciling} onClick={() => { void reconcileOrders(); }}>
          {reconciling ? <><LoaderCircle className="is-spinning" /> Đang kiểm tra giao dịch…</> : <><RefreshCcw /> Tôi đã chuyển tiền · Kiểm tra giao dịch</>}
        </button>}
        <button className="is-quiet" type="button" onClick={() => { if (pendingOrderStorageKey) window.localStorage.removeItem(pendingOrderStorageKey); setOrder(null); }}><QrCode /> Tôi chưa chuyển · Tạo mã mới</button>
      </div>}

      {order?.status === 'REVIEW' && <div className="payment-result is-review">
        <RefreshCcw aria-hidden="true" /><span>ĐANG KIỂM TRA GIAO DỊCH</span><h2>Bạn không cần chuyển thêm</h2>
        <p>Ngân hàng đã ghi nhận giao dịch nhưng hệ thống cần kiểm tra thêm trước khi cộng Coin. Hãy bấm kiểm tra lại sau vài giây.</p>
        {error && <p className="payment-error" role="alert">{error}</p>}
        <button type="button" disabled={reconciling} onClick={() => { void reconcileOrders(); }}>
          {reconciling ? <><LoaderCircle className="is-spinning" /> Đang kiểm tra giao dịch…</> : <><RefreshCcw /> Kiểm tra lại</>}
        </button>
      </div>}
    </section>

    <aside className="payment-assurance">
      <span>CHỈ 3 BƯỚC</span>
      <h3>Nạp Coin dễ như chuyển khoản</h3>
      <ol>
        <li><b>01</b><div><strong>Chọn số tiền</strong><small>Biết trước chính xác số Coin sẽ nhận.</small></div></li>
        <li><b>02</b><div><strong>Quét mã ngân hàng</strong><small>Số tiền và nội dung được điền sẵn.</small></div></li>
        <li><b>03</b><div><strong>Nhận Coin tự động</strong><small>Coin vào tài khoản sau khi thanh toán.</small></div></li>
      </ol>
      <div className="payment-security-note"><ShieldCheck aria-hidden="true" /><p><strong>An toàn cho tài khoản</strong><br />Mỗi giao dịch chỉ được cộng Coin một lần, kể cả khi trang tải lại.</p></div>
      <div className="payment-rate-note"><Coins aria-hidden="true" /><p><span>TỶ LỆ HIỆN TẠI</span><strong>1 VNĐ = {config.coinPerVnd} Coin</strong><small>Không thu thêm phí trên trang nạp.</small></p></div>
    </aside>
  </div>;
}
