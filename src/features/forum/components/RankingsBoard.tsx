'use client';

import { Crown, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Parchment } from '@/components/ui/Parchment';
import { forumService } from '../services/forum.service';
import type { ForumRankings, RankingEntry } from '../types/forum.types';
import { PirateMark } from './PirateMark';

const number = new Intl.NumberFormat('vi-VN');

function RankingList({ entries, kind }: { entries: RankingEntry[]; kind: 'topUp' | 'level' }) {
  if (!entries.length) return <p className="wanted-empty">Chưa có hải tặc trên bảng.</p>;
  return <ol className="wanted-list">{entries.map((entry) => <li key={`${kind}-${entry.name}`}>
    <b>{String(entry.rank).padStart(2, '0')}</b>
    <span><strong>{entry.name}</strong><small>{entry.className} · Cấp {entry.level}</small></span>
    <em>{kind === 'topUp' ? `${number.format(entry.score)}đ` : `Cấp ${entry.level}`}</em>
  </li>)}</ol>;
}

export function RankingsBoard() {
  const [rankings, setRankings] = useState<ForumRankings>({ topUp: [], level: [] });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    forumService.getRankings().then(setRankings).catch(() => undefined).finally(() => setLoading(false));
  }, []);

  return <aside className="forum-rankings">
    <PirateMark />
    <Parchment className="wanted-scroll wanted-scroll--topup">
      <header className="wanted-heading"><span><TrendingUp size={13} /> DANH DỰ HẠM ĐỘI</span><h2>Top nạp</h2></header>
      {loading ? <div className="wanted-loading"><span /><span /><span /></div> : <RankingList entries={rankings.topUp} kind="topUp" />}
      <p className="wanted-footnote">Xếp theo tổng nạp tích lũy.</p>
    </Parchment>
    <Parchment className="wanted-scroll wanted-scroll--level">
      <header className="wanted-heading"><span><Crown size={13} /> CAO THỦ ĐẠI HẢI TRÌNH</span><h2>Top cấp độ</h2></header>
      {loading ? <div className="wanted-loading"><span /><span /><span /></div> : <RankingList entries={rankings.level} kind="level" />}
      <p className="wanted-footnote">Xếp theo kinh nghiệm nhân vật.</p>
    </Parchment>
  </aside>;
}
