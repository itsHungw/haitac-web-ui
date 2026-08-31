'use client';

import { useState } from 'react';
import { Parchment } from '@/components/ui/Parchment';

const NEWS = [
  { category: 'SỰ KIỆN', date: '16.06.2026', title: 'Đấu Trường Rực Lửa 2026', desc: 'Không khí bóng đá đang nóng lên từng ngày trên Đại Hải Trình.', href: 'https://haitactihon.com/news.php?id=170' },
  { category: 'SỰ KIỆN', date: '09.02.2026', title: 'Sự kiện Tết 2026', desc: 'Chào mừng các thuyền trưởng đến với sự kiện Tết Bính Ngọ.', href: 'https://haitactihon.com/news.php?id=168' },
  { category: 'SỰ KIỆN', date: '19.12.2025', title: 'Sự kiện Giáng Sinh 2025', desc: 'Mùa đông tuyết rơi đã đến với Hải Tặc Tí Hon.', href: 'https://haitactihon.com/news.php?id=167' },
  { category: 'THÔNG BÁO', date: '27.11.2025', title: 'Sự kiện Black Friday 2025', desc: 'Các thuyền trưởng đừng bỏ lỡ đợt ưu đãi trên Đại Hải Trình.', href: 'https://haitactihon.com/news.php?id=166' },
];

const GUIDES = [
  { category: 'TÂN THỦ', date: 'CẨM NANG', title: 'Bắt đầu hành trình', desc: 'Các bước đầu tiên dành cho một thuyền trưởng mới.', href: 'https://haitactihon.com/forum/game/6/Huong-Dan-0.html' },
  { category: 'TRANG BỊ', date: 'CẨM NANG', title: 'Nâng cấp sức mạnh', desc: 'Tìm hiểu hệ thống trang bị và cách chuẩn bị trước khi ra khơi.', href: 'https://haitactihon.com/forum/game/6/Huong-Dan-0.html' },
  { category: 'CỘNG ĐỒNG', date: 'DIỄN ĐÀN', title: 'Hỏi đáp cùng thuyền trưởng', desc: 'Trao đổi kinh nghiệm với cộng đồng người chơi.', href: 'https://haitactihon.com/forum' },
];

export function NewsSection() {
  const [activeTab, setActiveTab] = useState<'news' | 'guides'>('news');
  const entries = activeTab === 'news' ? NEWS : GUIDES;

  return (
    <section id="tin-tuc" className="news-section">
      <div className="page-width news-layout">
        <div className="news-main">
          <div className="section-heading section-heading--ink">
            <div>
              <span className="eyebrow eyebrow--dark">NHẬT KÝ HÀNH TRÌNH</span>
              <h2>Tin mới từ biển khơi</h2>
            </div>
            <div className="news-tabs" role="tablist" aria-label="Loại nội dung">
              <button type="button" role="tab" aria-selected={activeTab === 'news'} className={activeTab === 'news' ? 'is-active' : ''} onClick={() => setActiveTab('news')}>Tin mới</button>
              <button type="button" role="tab" aria-selected={activeTab === 'guides'} className={activeTab === 'guides' ? 'is-active' : ''} onClick={() => setActiveTab('guides')}>Cẩm nang</button>
            </div>
          </div>

          <Parchment className="news-scroll">
          <div className="news-ledger">
            {entries.map((entry, index) => (
              <a className="news-row" key={entry.title} href={entry.href} target="_blank" rel="noopener noreferrer">
                <span className="news-row__number">{String(index + 1).padStart(2, '0')}</span>
                <span className="news-row__content">
                  <span className="news-row__meta"><b>{entry.category}</b> · {entry.date}</span>
                  <strong>{entry.title}</strong>
                  <span>{entry.desc}</span>
                </span>
                <span className="news-row__arrow" aria-hidden="true">→</span>
              </a>
            ))}
          </div>
          </Parchment>
        </div>

        <aside className="captain-board" aria-label="Hành trang nhanh">
          <span className="captain-board__pin" aria-hidden="true" />
          <p className="eyebrow eyebrow--dark">HÀNH TRANG NHANH</p>
          <h3>Sẵn sàng ra khơi?</h3>
          <p>Tải game, ghé diễn đàn hoặc bổ sung Coin qua các kênh chính thức.</p>
          <div className="captain-board__links">
            <a href="/tai-game"><span>01</span>Tải game</a>
            <a href="https://haitactihon.com/forum" target="_blank" rel="noopener noreferrer"><span>02</span>Diễn đàn</a>
            <a href="/nap-the"><span>03</span>Nạp Coin</a>
          </div>
        </aside>
      </div>
    </section>
  );
}
