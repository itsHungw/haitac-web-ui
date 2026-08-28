'use client';

import { BellRing, BookOpenText, Bug, ChevronRight, Compass, Flag, MessageCircleQuestion, UsersRound } from 'lucide-react';
import { useState } from 'react';
import { Parchment } from '@/components/ui/Parchment';
import { ForumAccountStrip } from './ForumAccountStrip';
import { RankingsBoard } from './RankingsBoard';

const TABS = [
  { id: 'events', label: 'Sự kiện', icon: Flag },
  { id: 'guides', label: 'Hướng dẫn', icon: BookOpenText },
  { id: 'discussion', label: 'Thảo luận', icon: Compass },
  { id: 'newbies', label: 'Tân thủ', icon: MessageCircleQuestion },
  { id: 'bugs', label: 'Báo lỗi', icon: Bug },
  { id: 'guilds', label: 'Bang hội', icon: UsersRound },
] as const;

type TabId = (typeof TABS)[number]['id'];
type Topic = { category: string; title: string; description: string; date: string; href?: string; pinned?: boolean };

const TOPICS: Record<TabId, Topic[]> = {
  events: [
    { category: 'SỰ KIỆN', title: 'Đấu Trường Rực Lửa 2026', description: 'Không khí tranh tài đang nóng lên từng ngày trên Đại Hải Trình.', date: '16.06.2026', href: 'https://haitactihon.com/news.php?id=170', pinned: true },
    { category: 'SỰ KIỆN', title: 'Sự kiện Tết 2026', description: 'Chào mừng các thuyền trưởng đến với sự kiện Tết Bính Ngọ.', date: '09.02.2026', href: 'https://haitactihon.com/news.php?id=168' },
    { category: 'SỰ KIỆN', title: 'Sự kiện Giáng Sinh 2025', description: 'Mùa đông tuyết rơi đã đến với Hải Tặc Tí Hon.', date: '19.12.2025', href: 'https://haitactihon.com/news.php?id=167' },
  ],
  guides: [
    { category: 'WIKI', title: 'Bách khoa Đại Hải Trình', description: 'Tra cứu class, kỹ năng, Trái Ác Quỷ, nhiệm vụ và bản đồ từ source game.', date: 'CẬP NHẬT', href: '/huong-dan', pinned: true },
    { category: 'TÂN THỦ', title: 'Chọn class phù hợp', description: 'So sánh vai trò và bộ kỹ năng của năm class nhân vật.', date: 'CẨM NANG', href: '/#classes' },
  ],
  discussion: [],
  newbies: [],
  bugs: [],
  guilds: [],
};

function TopicRow({ topic, index }: { topic: Topic; index: number }) {
  const content = <>
    <span className="forum-topic__number">{String(index + 1).padStart(2, '0')}</span>
    <div><span>{topic.category}{topic.pinned && <b><BellRing size={11} /> GHIM</b>}</span><h3>{topic.title}</h3><p>{topic.description}</p></div>
    <time>{topic.date}</time><ChevronRight aria-hidden="true" />
  </>;
  return topic.href
    ? <a className="forum-topic" href={topic.href} target={topic.href.startsWith('http') ? '_blank' : undefined} rel={topic.href.startsWith('http') ? 'noopener noreferrer' : undefined}>{content}</a>
    : <article className="forum-topic">{content}</article>;
}

export function ForumHub() {
  const [activeTab, setActiveTab] = useState<TabId>('events');
  const active = TABS.find((tab) => tab.id === activeTab) ?? TABS[0];
  const topics = TOPICS[activeTab];

  return <section className="forum-section">
    <div className="page-width forum-heading">
      <div><span>QUẢNG TRƯỜNG HẢI TẶC</span><h1>Diễn đàn Đại Hải Trình</h1></div>
      <p>Nơi thuyền trưởng trao đổi kinh nghiệm, tìm đồng đội và theo dõi tin tức từ máy chủ.</p>
    </div>
    <div className="page-width forum-account-wrap"><ForumAccountStrip /></div>
    <div className="page-width forum-grid">
      <Parchment className="forum-main-scroll">
        <header className="forum-board-heading"><span>BẢNG TIN LIÊN LẠC</span><h2>{active.label}</h2><p>Đọc tự do. Đăng nhập khi bạn muốn tham gia câu chuyện.</p></header>
        <div className="forum-content-tabs" role="tablist" aria-label="Chuyên mục diễn đàn">{TABS.map((tab) => <button type="button" role="tab" aria-selected={activeTab === tab.id} className={activeTab === tab.id ? 'is-active' : ''} key={tab.id} onClick={() => setActiveTab(tab.id)}><tab.icon aria-hidden="true" /><span>{tab.label}</span></button>)}</div>
        <div className="forum-topic-list" role="tabpanel">{topics.length ? topics.map((topic, index) => <TopicRow key={topic.title} topic={topic} index={index} />) : <div className="forum-topic-empty"><active.icon /><strong>Chưa có chủ đề trong mục {active.label}</strong><p>Nội dung mới sẽ xuất hiện tại đây khi diễn đàn chính thức mở bài viết.</p></div>}</div>
        <footer className="forum-board-footer"><span>{topics.length} bài nổi bật</span><b>Giao dịch và chợ mua bán được thực hiện trực tiếp trong game.</b></footer>
      </Parchment>
      <RankingsBoard />
    </div>
  </section>;
}
