'use client';

import Link from 'next/link';
import { CircleCheck, Coins, Crosshair, Gem, ShieldAlert, Sparkles, Swords, UserRound, WalletCards } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Parchment } from '@/components/ui/Parchment';
import { extractErrorMessage } from '@/lib/api/errors';
import { forumService } from '../services/forum.service';
import type { ForumProfile } from '../types/forum.types';

const number = new Intl.NumberFormat('vi-VN');
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const MILESTONES = [20_000, 50_000, 100_000, 200_000, 500_000, 1_000_000, 2_000_000, 3_000_000, 4_000_000, 5_000_000];

export function ProfileDashboard() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<ForumProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user) { setLoadingProfile(false); return; }
    forumService.getProfile().then(setProfile).catch((error) => setMessage(extractErrorMessage(error))).finally(() => setLoadingProfile(false));
  }, [user]);

  const nextMilestone = useMemo(() => MILESTONES.find((value) => value > (profile?.totalTopUp ?? 0)), [profile?.totalTopUp]);

  if (isLoading || loadingProfile) return <div className="page-width profile-loading"><span /><span /><span /></div>;
  if (!user) return <section className="page-width profile-guest"><ShieldAlert /><h1>Phòng thuyền trưởng</h1><p>Bạn cần đăng nhập để xem thông tin tài khoản và nhân vật.</p><div><Link href="/login">Đăng nhập</Link><Link href="/register">Đăng ký</Link></div></section>;
  if (!profile) return <section className="page-width profile-guest"><ShieldAlert /><h1>Không tải được hồ sơ</h1><p>{message || 'Vui lòng thử lại sau.'}</p></section>;

  const character = profile.character;
  const progressTarget = nextMilestone ?? MILESTONES[MILESTONES.length - 1];
  const progress = Math.min(100, (profile.totalTopUp / progressTarget) * 100);

  async function activate() {
    if (!confirm('Kích hoạt tài khoản với 10.000 Coin? Thao tác này không thể hoàn tác.')) return;
    setActivating(true); setMessage('');
    try { setProfile(await forumService.activate()); setMessage('Kích hoạt tài khoản thành công. Chào mừng thuyền trưởng!'); }
    catch (error) { setMessage(extractErrorMessage(error)); }
    finally { setActivating(false); }
  }

  return <section className="profile-section">
    <div className="page-width profile-title"><span>PHÒNG THUYỀN TRƯỞNG</span><h1>Hồ sơ của {character?.name || profile.username}</h1><p>Thông tin riêng tư chỉ hiển thị với chủ tài khoản.</p></div>

    {!profile.activated && <div id="kich-hoat" className="page-width activation-order">
      <ShieldAlert /><div><span>LỆNH MỞ THÀNH VIÊN</span><h2>Tài khoản chưa kích hoạt</h2><p>Kênh Thế Giới, giao dịch, Chợ và quy đổi Coin đang bị khóa trong game.</p></div>
      <div><small>Số dư {number.format(profile.coin)} Coin</small><button type="button" disabled={activating || profile.coin < profile.activationCost} onClick={activate}>{activating ? 'Đang kích hoạt…' : `Kích hoạt · ${number.format(profile.activationCost)} Coin`}</button>{profile.coin < profile.activationCost && <Link href="/nap-the">Nạp thêm Coin</Link>}</div>
    </div>}
    {profile.activated && <div className="page-width activation-order is-active"><CircleCheck /><div><span>THÀNH VIÊN CHÍNH THỨC</span><h2>Tài khoản đã kích hoạt</h2><p>Các quyền lợi thành viên trong game đã được mở.</p></div></div>}
    {message && <p className="page-width profile-message" role="status">{message}</p>}

    <div className="page-width profile-grid">
      <Parchment className="profile-character-scroll">
        <header className="profile-card-heading"><span>HỒ SƠ NHÂN VẬT</span><h2>{character?.name || 'Chưa tạo nhân vật'}</h2></header>
        <div className="profile-character">
          <div className={`profile-character__avatar class-${character?.clazz ?? 0}`}><UserRound /></div>
          {character ? <><div className="profile-character__identity"><span>{character.className}</span><strong>Cấp {character.level}</strong><small>{profile.online ? 'Đang trực tuyến' : 'Đang ngoại tuyến'}</small></div>
          <dl><div><dt><Sparkles /> Kinh nghiệm</dt><dd>{number.format(character.exp)}</dd></div><div><dt><Crosshair /> Tiền truy nã</dt><dd>{number.format(character.wantedPoints)}</dd></div><div><dt><Swords /> Điểm PVP</dt><dd>{number.format(character.pvpPoints)}</dd></div></dl></> : <p>Hãy tạo nhân vật trong game để hồ sơ xuất hiện tại đây.</p>}
        </div>
      </Parchment>

      <Parchment className="profile-wallet-scroll">
        <header className="profile-card-heading"><span>KHO BẠC TÀI KHOẢN</span><h2>Tài sản của bạn</h2></header>
        <div className="profile-wallet-grid">
          <div><Coins /><span>Coin</span><strong>{number.format(profile.coin)}</strong><small>Dùng để kích hoạt và quy đổi</small></div>
          <div><WalletCards /><span>Tổng nạp</span><strong>{money.format(profile.totalTopUp)}</strong><small>Tích lũy toàn thời gian</small></div>
          <div><Gem /><span>Điểm tích lũy</span><strong>{number.format(profile.loyaltyPoints)}</strong><small>Đổi quà tại shop tích lũy</small></div>
        </div>
        {character && <div className="profile-game-wallet"><span>TRONG NHÂN VẬT</span><b>{number.format(character.ruby)} Ruby</b><b>{number.format(character.beri)} Beri</b><b>{number.format(character.extol)} Extol</b></div>}
        <Link className="profile-recharge-link" href="/nap-the">Nạp Coin</Link>
      </Parchment>
    </div>

    <div className="page-width profile-lower-grid">
      <section className="profile-milestones"><header><span>HÀNH TRÌNH TÍCH LŨY</span><h2>Mốc nạp kho báu</h2><p>{nextMilestone ? `Còn ${money.format(nextMilestone - profile.totalTopUp)} tới mốc tiếp theo.` : 'Bạn đã chinh phục toàn bộ mốc hiện có.'}</p></header><div className="milestone-track"><i style={{ width: `${progress}%` }} />{MILESTONES.map((value) => <span className={profile.totalTopUp >= value ? 'is-reached' : ''} key={value}><b>{value >= 1_000_000 ? `${value / 1_000_000}M` : `${value / 1_000}K`}</b></span>)}</div></section>
      <section className="profile-exchange"><header><span>TỶ LỆ TRONG GAME</span><h2>Bản đồ quy đổi</h2></header><div><p><b>10 Coin</b><span>→</span><strong>2 Ruby</strong></p><p><b>1 Coin</b><span>→</span><strong>5.000 Beri</strong></p><p><b>1.000 Ruby</b><span>→</span><strong>750.000 Extol</strong></p></div><small>Thực hiện trong game tại NPC Nami hoặc Rita.</small></section>
    </div>
  </section>;
}
