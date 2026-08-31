'use client';

import Link from 'next/link';
import Image from 'next/image';
import { CircleCheck, CircleDollarSign, Crown, LogIn, LogOut, ShieldAlert, UserPlus, UserRound } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { forumService } from '../services/forum.service';
import { CLASS_PORTRAITS, type ForumProfile } from '../types/forum.types';
import { CharacterSwitcher, useCharacterSelection } from './CharacterSwitcher';

const number = new Intl.NumberFormat('vi-VN');

export function ForumAccountStrip() {
  const { user, isLoading, logout } = useAuth();
  const [profile, setProfile] = useState<ForumProfile | null>(null);
  const characters = profile?.characters ?? (profile?.character ? [profile.character] : []);
  const { selectedCharacter: character, selectCharacter } = useCharacterSelection(profile?.username, characters);

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

  return <div className="forum-account forum-account--member">
    <div className={`forum-avatar class-${character?.clazz ?? 0}`}>{character && CLASS_PORTRAITS[character.clazz] ? <Image src={CLASS_PORTRAITS[character.clazz]} fill sizes="76px" alt="" /> : <UserRound aria-hidden="true" />}</div>
    <div className="forum-account__identity">
      <span className={`forum-presence ${profile?.online ? 'is-online' : 'is-offline'}`}><i aria-hidden="true" /> TÀI KHOẢN · {profile?.online ? 'ONLINE' : 'OFFLINE'}</span>
      <strong>{user.user}</strong>
      <p>{character ? `Đang xem ${character.name} · ${character.className} · Cấp ${character.level}` : 'Chưa tạo nhân vật'}</p>
    </div>
    <CharacterSwitcher characters={characters} compact selectedName={character?.name} onSelect={selectCharacter} />
    <div className="forum-account__status">
      <span className={profile?.activated ? 'is-active' : 'is-locked'}>{profile?.activated ? <CircleCheck /> : <ShieldAlert />}{profile?.activated ? 'Thành viên' : 'Chưa mở TV'}</span>
      <span className="is-vip"><Crown /> VIP {profile?.vipLevel ?? 0}</span>
      <b><CircleDollarSign /> {number.format(profile?.coin ?? 0)} Coin</b>
    </div>
    <nav>
      <Link className="forum-account-action is-profile" href="/profile"><UserRound aria-hidden="true" /> Hồ sơ</Link>
      {!profile?.activated && <Link className="is-accent" href="/profile#kich-hoat">Mở TV</Link>}
      <Link className="forum-account-action is-recharge" href="/nap-the"><CircleDollarSign aria-hidden="true" /> Nạp Coin</Link>
      <button className="forum-account-action is-logout" type="button" onClick={() => { void logout(); }}><LogOut aria-hidden="true" /> Thoát</button>
    </nav>
  </div>;
}
