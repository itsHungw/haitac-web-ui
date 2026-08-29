'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CircleCheck, CircleDollarSign, LogIn, LogOut, ShieldAlert, UserPlus, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { forumService } from '../services/forum.service';
import { CLASS_PORTRAITS, type ForumProfile } from '../types/forum.types';

const number = new Intl.NumberFormat('vi-VN');

export function ForumAccountStrip() {
  const { user, isLoading, logout } = useAuth();
  const [profile, setProfile] = useState<ForumProfile | null>(null);

  useEffect(() => {
    let cancelled = false;
    setProfile(null);
    if (user) {
      forumService.getProfile()
        .then((nextProfile) => { if (!cancelled) setProfile(nextProfile); })
        .catch(() => undefined);
    }
    return () => { cancelled = true; };
  }, [user]);

  if (isLoading) return <div className="forum-account forum-account--loading"><span /><span /></div>;

  if (!user) return <div className="forum-account forum-account--guest">
    <div><span>CỔNG THUYỀN TRƯỞNG</span><strong>Gia nhập cuộc trò chuyện</strong><p>Đăng nhập để viết bài và quản lý nhân vật.</p></div>
    <nav><Link className="is-login" href="/login"><LogIn aria-hidden="true" /> Đăng nhập</Link><Link className="is-register" href="/register"><UserPlus aria-hidden="true" /> Đăng ký</Link></nav>
  </div>;

  const character = profile?.character;
  return <div className="forum-account forum-account--member">
    <div className={`forum-avatar class-${character?.clazz ?? 0}`}>{character && CLASS_PORTRAITS[character.clazz] ? <Image src={CLASS_PORTRAITS[character.clazz]} fill sizes="76px" alt="" /> : <UserRound aria-hidden="true" />}</div>
    <div className="forum-account__identity">
      <span className={`forum-presence ${profile?.online ? 'is-online' : 'is-offline'}`}><i aria-hidden="true" /> THẺ THUYỀN VIÊN · {profile?.online ? 'ONLINE' : 'OFFLINE'}</span>
      <strong>{character?.name || user.user}</strong>
      <p>{character ? `${character.className} · Cấp ${character.level}` : `Tài khoản ${user.user} · Chưa tạo nhân vật`}</p>
    </div>
    <div className="forum-account__status">
      <span className={profile?.activated ? 'is-active' : 'is-locked'}>{profile?.activated ? <CircleCheck /> : <ShieldAlert />}{profile?.activated ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</span>
      <b><CircleDollarSign /> {number.format(profile?.coin ?? 0)} Coin</b>
    </div>
    <nav>
      <Link className="forum-account-action is-profile" href="/profile"><UserRound aria-hidden="true" /> Hồ sơ</Link>
      {!profile?.activated && <Link className="is-accent" href="/profile#kich-hoat">Kích hoạt</Link>}
      <Link className="forum-account-action is-recharge" href="/nap-the"><CircleDollarSign aria-hidden="true" /> Nạp Coin</Link>
      <button className="forum-account-action is-logout" type="button" onClick={() => { void logout(); }}><LogOut aria-hidden="true" /> Thoát</button>
    </nav>
  </div>;
}
