'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CircleCheck, CircleDollarSign, LogOut, ShieldAlert, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { authService } from '@/features/auth/services/auth.service';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { forumService } from '../services/forum.service';
import type { ForumProfile } from '../types/forum.types';

const number = new Intl.NumberFormat('vi-VN');
const CLASS_PORTRAITS = ['/assets/characters/zoro.jpg', '/assets/characters/usop.jpg', '/assets/characters/luffy.jpg', '/assets/characters/sanji.jpg', '/assets/characters/nami.jpg'];

export function ForumAccountStrip() {
  const { user, isLoading } = useAuth();
  const [profile, setProfile] = useState<ForumProfile | null>(null);

  useEffect(() => {
    if (user) forumService.getProfile().then(setProfile).catch(() => undefined);
    else setProfile(null);
  }, [user]);

  if (isLoading) return <div className="forum-account forum-account--loading"><span /><span /></div>;

  if (!user) return <div className="forum-account forum-account--guest">
    <div><span>CỔNG THUYỀN TRƯỞNG</span><strong>Gia nhập cuộc trò chuyện</strong><p>Đăng nhập để viết bài và quản lý nhân vật.</p></div>
    <nav><Link href="/login">Đăng nhập</Link><Link href="/register">Đăng ký</Link></nav>
  </div>;

  const character = profile?.character;
  return <div className="forum-account forum-account--member">
    <div className={`forum-avatar class-${character?.clazz ?? 0}`}>{character ? <Image src={CLASS_PORTRAITS[character.clazz] || CLASS_PORTRAITS[0]} fill sizes="76px" alt="" /> : <UserRound aria-hidden="true" />}</div>
    <div className="forum-account__identity">
      <span>THẺ THUYỀN VIÊN · {profile?.online ? 'TRỰC TUYẾN' : 'NGOẠI TUYẾN'}</span>
      <strong>{character?.name || user.user}</strong>
      <p>{character ? `${character.className} · Cấp ${character.level}` : `Tài khoản ${user.user} · Chưa tạo nhân vật`}</p>
    </div>
    <div className="forum-account__status">
      <span className={profile?.activated ? 'is-active' : 'is-locked'}>{profile?.activated ? <CircleCheck /> : <ShieldAlert />}{profile?.activated ? 'Đã kích hoạt' : 'Chưa kích hoạt'}</span>
      <b><CircleDollarSign /> {number.format(profile?.coin ?? 0)} Coin</b>
    </div>
    <nav>
      <Link href="/profile">Hồ sơ</Link>
      {!profile?.activated && <Link className="is-accent" href="/profile#kich-hoat">Kích hoạt</Link>}
      <Link href="/nap-the">Nạp Coin</Link>
      <button type="button" onClick={async () => { await authService.logout().catch(() => undefined); window.location.reload(); }}><LogOut /> Thoát</button>
    </nav>
  </div>;
}
