'use client';

import Link from 'next/link';
import Image from 'next/image';
import {
  CircleCheck,
  Coins,
  Crosshair,
  Crown,
  Gem,
  ShieldAlert,
  Sparkles,
  Swords,
  UserRound,
  UsersRound,
  WalletCards,
} from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { Parchment } from '@/components/ui/Parchment';
import { extractErrorMessage } from '@/lib/api/errors';
import { forumService } from '../services/forum.service';
import { CLASS_PORTRAITS, type ForumProfile } from '../types/forum.types';
import { CharacterSwitcher, useCharacterSelection } from './CharacterSwitcher';

const number = new Intl.NumberFormat('vi-VN');
const money = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 });
const VIP_THRESHOLDS = [100_000, 200_000, 500_000, 1_000_000, 2_000_000, 5_000_000];

function vipTrackProgress(totalTopUp: number) {
  if (totalTopUp < VIP_THRESHOLDS[0]) return 0;
  const lastIndex = VIP_THRESHOLDS.length - 1;
  if (totalTopUp >= VIP_THRESHOLDS[lastIndex]) return 100;
  let reachedIndex = 0;
  while (reachedIndex + 1 < VIP_THRESHOLDS.length && totalTopUp >= VIP_THRESHOLDS[reachedIndex + 1]) {
    reachedIndex++;
  }
  const current = VIP_THRESHOLDS[reachedIndex];
  const next = VIP_THRESHOLDS[reachedIndex + 1];
  const segment = 100 / lastIndex;
  return reachedIndex * segment + ((totalTopUp - current) / (next - current)) * segment;
}

export function ProfileDashboard() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<ForumProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [activating, setActivating] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    setMessage('');
    if (!user) {
      setLoadingProfile(false);
      return () => { cancelled = true; };
    }
    setLoadingProfile(true);
    forumService.getProfile()
      .then((nextProfile) => { if (!cancelled) setProfile(nextProfile); })
      .catch((error) => { if (!cancelled) setMessage(extractErrorMessage(error)); })
      .finally(() => { if (!cancelled) setLoadingProfile(false); });
    return () => { cancelled = true; };
  }, [user]);

  const characters = useMemo(
    () => profile?.characters ?? (profile?.character ? [profile.character] : []),
    [profile],
  );
  const { selectedCharacter: character, selectCharacter } = useCharacterSelection(profile?.username, characters);
  const nextVipThreshold = profile && profile.vipLevel < VIP_THRESHOLDS.length
    ? VIP_THRESHOLDS[profile.vipLevel]
    : undefined;
  const vipProgress = profile ? vipTrackProgress(profile.totalTopUp) : 0;

  if (isLoading || loadingProfile) return <div className="page-width profile-loading"><span /><span /><span /></div>;
  if (!user) return <section className="page-width profile-guest"><ShieldAlert /><h1>Phòng thuyền trưởng</h1><p>Bạn cần đăng nhập để xem thông tin tài khoản và nhân vật.</p><div><Link href="/login">Đăng nhập</Link><Link href="/register">Đăng ký</Link></div></section>;
  if (!profile) return <section className="page-width profile-guest"><ShieldAlert /><h1>Không tải được hồ sơ</h1><p>{message || 'Vui lòng thử lại sau.'}</p></section>;

  async function activate() {
    if (!confirm('Mở Thành viên với 10.000 Coin? Quyền lợi áp dụng cho cả tài khoản và không thể hoàn tác.')) return;
    setActivating(true);
    setMessage('');
    try {
      setProfile(await forumService.activate());
      setMessage('Mở Thành viên thành công cho toàn bộ tài khoản.');
    } catch (error) {
      setMessage(extractErrorMessage(error));
    } finally {
      setActivating(false);
    }
  }

  return <section className="profile-section">
    <div className="page-width profile-title">
      <span>HỒ SƠ TÀI KHOẢN</span>
      <h1>Thuyền trưởng {profile.username}</h1>
      <p>Coin, VIP và Thành viên dùng chung cho tài khoản. Chọn nhân vật để xem tiến trình và tài sản riêng.</p>
    </div>

    <section className="page-width profile-account-summary" aria-label="Tổng quan tài khoản">
      <div className="profile-account-summary__identity">
        <span className={`profile-account-summary__seal${profile.activated ? ' is-member' : ''}`}><Crown aria-hidden="true" /></span>
        <div><small>TÀI KHOẢN ĐĂNG NHẬP</small><strong>{profile.username}</strong><span>{profile.online ? 'Đang trực tuyến trong game' : 'Hiện không ở trong game'}</span></div>
      </div>
      <dl>
        <div><dt>Hạng hiện tại</dt><dd>VIP {profile.vipLevel}</dd></div>
        <div><dt>Ví tài khoản</dt><dd>{number.format(profile.coin)} Coin</dd></div>
        <div><dt>Nhân vật</dt><dd>{characters.length}/3</dd></div>
        <div><dt>Quyền kinh tế</dt><dd className={profile.activated ? 'is-member' : 'is-locked'}>{profile.activated ? 'Thành viên' : 'Chưa mở'}</dd></div>
      </dl>
      <Link href="/nap-the"><Coins aria-hidden="true" /> Nạp Coin</Link>
    </section>

    <div className="page-width profile-character-switcher-wrap">
      <CharacterSwitcher characters={characters} selectedName={character?.name} onSelect={selectCharacter} />
    </div>

    {!profile.activated && <div id="kich-hoat" className="page-width activation-order">
      <ShieldAlert /><div><span>MỞ THÀNH VIÊN KINH TẾ</span><h2>Một lần cho cả tài khoản</h2><p>Mở giao dịch, Chợ và quy đổi Coin cho cả ba nhân vật. Điểm danh thường vẫn miễn phí.</p></div>
      <div><small>Số dư {number.format(profile.coin)} Coin</small><button type="button" disabled={activating || profile.coin < profile.activationCost} onClick={activate}>{activating ? 'Đang mở…' : `Mở Thành viên · ${number.format(profile.activationCost)} Coin`}</button>{profile.coin < profile.activationCost && <Link href="/nap-the">Nạp thêm Coin</Link>}</div>
    </div>}
    {profile.activated && <div className="page-width activation-order is-active"><CircleCheck /><div><span>THÀNH VIÊN KINH TẾ</span><h2>Đã mở cho toàn bộ tài khoản</h2><p>Mọi nhân vật trong tài khoản đều có quyền sử dụng giao dịch, Chợ và quy đổi Coin.</p></div></div>}
    {message && <p className="page-width profile-message" role="status">{message}</p>}

    <div className="page-width profile-grid">
      <Parchment className="profile-character-scroll">
        <header className="profile-card-heading"><span>NHÂN VẬT ĐANG XEM</span><h2>{character?.name || 'Chưa tạo nhân vật'}</h2></header>
        <div className="profile-character">
          <div className={`profile-character__avatar class-${character?.clazz ?? 0}`}>
            {character && CLASS_PORTRAITS[character.clazz]
              ? <Image src={CLASS_PORTRAITS[character.clazz]} fill sizes="118px" alt="" />
              : <UserRound aria-hidden="true" />}
          </div>
          {character ? <>
            <div className="profile-character__identity"><span>{character.className}</span><strong>Cấp {character.level}</strong><small>Slot nhân vật riêng · Tài khoản {profile.username}</small></div>
            <dl><div><dt><Sparkles /> Kinh nghiệm</dt><dd>{number.format(character.exp)}</dd></div><div><dt><Crosshair /> Tiền truy nã</dt><dd>{number.format(character.wantedPoints)}</dd></div><div><dt><Swords /> Điểm PVP</dt><dd>{number.format(character.pvpPoints)}</dd></div></dl>
          </> : <p>Hãy tạo nhân vật trong game để hồ sơ xuất hiện tại đây.</p>}
        </div>
      </Parchment>

      <Parchment className="profile-wallet-scroll">
        <header className="profile-card-heading"><span>KHO BẠC TÀI KHOẢN</span><h2>Tài sản dùng chung</h2></header>
        <div className="profile-wallet-grid">
          <div><Coins /><span>Coin tài khoản</span><strong>{number.format(profile.coin)}</strong><small>Dùng chung khi mở Thành viên và quy đổi</small></div>
          <div><WalletCards /><span>Tổng nạp</span><strong>{money.format(profile.totalTopUp)}</strong><small>Tự động quyết định cấp VIP</small></div>
          <div><Gem /><span>Điểm tích lũy</span><strong>{number.format(profile.loyaltyPoints)}</strong><small>Dùng chung tại shop tích lũy</small></div>
        </div>
        {character && <div className="profile-game-wallet"><span>RIÊNG CỦA {character.name.toUpperCase()}</span><b>{number.format(character.ruby)} Ruby</b><b>{number.format(character.beri)} Beri</b><b>{number.format(character.extol)} Extol</b></div>}
        <p className="profile-wallet-note"><UsersRound aria-hidden="true" /> Khi đổi Coin trong game, Ruby/Beri/Extol được chuyển vào nhân vật đang đăng nhập.</p>
        <Link className="profile-recharge-link" href="/nap-the">Nạp Coin vào tài khoản</Link>
      </Parchment>
    </div>

    <div className="page-width profile-lower-grid">
      <section className="profile-milestones"><header><span>HÀNH TRÌNH VIP</span><h2>VIP theo tổng nạp</h2><p>{nextVipThreshold ? `Còn ${money.format(nextVipThreshold - profile.totalTopUp)} để lên VIP ${profile.vipLevel + 1}.` : 'Bạn đã đạt VIP cao nhất hiện có.'}</p></header><div className="milestone-track"><i style={{ width: `${vipProgress}%` }} />{VIP_THRESHOLDS.map((value, index) => <span className={profile.totalTopUp >= value ? 'is-reached' : ''} key={value}><b>VIP {index + 1}</b><small>{value >= 1_000_000 ? `${value / 1_000_000}M` : `${value / 1_000}K`}</small></span>)}</div></section>
      <section className="profile-exchange"><header><span>TỶ LỆ TRONG GAME</span><h2>Bản đồ quy đổi</h2></header><div><p><b>10 Coin</b><span>→</span><strong>2 Ruby</strong></p><p><b>1 Coin</b><span>→</span><strong>5.000 Beri</strong></p><p><b>1.000 Ruby</b><span>→</span><strong>750.000 Extol</strong></p></div><small>Coin thuộc tài khoản; kết quả quy đổi thuộc nhân vật thực hiện tại NPC Nami hoặc Rita.</small></section>
    </div>
  </section>;
}
