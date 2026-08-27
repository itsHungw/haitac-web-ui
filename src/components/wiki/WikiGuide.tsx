'use client';

import { useMemo, useState } from 'react';

interface WikiSection { title: string; paragraphs: string[]; points?: string[] }
interface WikiArticle { id: string; category: string; title: string; summary: string; sections: WikiSection[]; source?: string }

const ARTICLES: WikiArticle[] = [
  {
    id: 'bat-dau', category: 'Tân thủ', title: 'Bắt đầu hành trình', summary: 'Tạo tài khoản, chọn class và chuẩn bị trước khi bước lên tàu.',
    sections: [
      { title: 'Tạo tài khoản', paragraphs: ['Tài khoản sử dụng trực tiếp trên web và trong game. Tên đăng nhập chỉ gồm chữ thường và số, tối đa 30 ký tự.'], points: ['Mật khẩu dài từ 8 đến 30 ký tự.', 'Không chia sẻ mật khẩu hoặc mã đăng nhập.', 'Luôn dùng kênh nạp ruby chính thức.'] },
      { title: 'Chọn class', paragraphs: ['Hải Tặc Tí Hon có năm hướng chiến đấu: Đánh Tay, Kiếm, Súng, Cung và Đao. Mỗi class có nhịp ra đòn và vị trí giao tranh khác nhau.'], points: ['Đánh Tay: áp sát và chống chịu.', 'Kiếm, Đao: sát thương cận chiến.', 'Súng, Cung: kiểm soát từ khoảng cách.'] },
      { title: 'Ba việc nên làm đầu tiên', paragraphs: ['Làm quen điều khiển, đọc mô tả kỹ năng và theo dõi diễn đàn để không bỏ lỡ lịch sự kiện.'] },
    ],
  },
  {
    id: 'cai-dat', category: 'Cài đặt', title: 'Tải và cài đặt game', summary: 'Chọn phiên bản phù hợp cho Android, Windows, iOS hoặc máy Java.',
    source: 'https://haitactihon.com/forum/threads/1579564/Huong-dan-tai-va-cai-dat-game-0.html',
    sections: [
      { title: 'Android', paragraphs: ['Tải APK từ trang Tải game. Nếu thiết bị chặn cài đặt, cấp quyền cài ứng dụng từ nguồn đã tải rồi thử lại.'] },
      { title: 'Windows', paragraphs: ['Bản PC HD được đóng gói riêng cho máy tính. Giải nén đầy đủ trước khi mở và giữ các tệp game trong cùng một thư mục.'] },
      { title: 'iOS', paragraphs: ['Dùng trang cài đặt iOS chính thức hoặc TestFlight khi bản thử nghiệm còn chỗ.'] },
    ],
  },
  {
    id: 'class-ky-nang', category: 'Chiến đấu', title: 'Class và kỹ năng', summary: 'Hiểu vai trò của năm class và cách đọc bộ ba kỹ năng.',
    sections: [
      { title: 'Vai trò chiến đấu', paragraphs: ['Đừng chỉ nhìn sát thương. Khoảng đánh, độ cơ động, khả năng chịu đòn và hiệu ứng khống chế quyết định vị trí của mỗi class trong đội hình.'] },
      { title: 'Đọc một kỹ năng', paragraphs: ['Trước khi nâng kỹ năng, hãy kiểm tra loại mục tiêu, phạm vi, thời gian hồi và tình huống sử dụng. Phần minh họa trên trang chủ giúp nhận biết hướng di chuyển của từng chiêu.'] },
      { title: 'Xây bộ kỹ năng', paragraphs: ['Một bộ kỹ năng cân bằng thường cần chiêu mở giao tranh, chiêu gây sát thương chính và một lựa chọn phòng thủ hoặc kết liễu.'] },
    ],
  },
  {
    id: 'trang-bi', category: 'Phát triển', title: 'Trang bị và cường hóa', summary: 'Đọc chỉ số, chọn món đồ phù hợp và nâng cấp có kế hoạch.',
    source: 'https://haitactihon.com/forum/game/6/Huong-Dan-0.html',
    sections: [
      { title: 'Ưu tiên theo class', paragraphs: ['Chỉ số tốt nhất phụ thuộc vào class và lối đánh. Hãy ưu tiên món đồ hỗ trợ vai trò chính trước khi chạy theo sức mạnh tổng.'] },
      { title: 'Cường hóa', paragraphs: ['Tập trung tài nguyên vào bộ trang bị đang sử dụng lâu dài. Đọc kỹ điều kiện và tỉ lệ trước mỗi lần nâng cấp.'] },
      { title: 'Quản lý hành trang', paragraphs: ['Giữ lại vật phẩm sự kiện và nguyên liệu hiếm, dọn các món không còn sử dụng để tránh đầy túi khi đang làm nhiệm vụ.'] },
    ],
  },
  {
    id: 'hoat-dong', category: 'Hoạt động', title: 'Boss, phó bản và sự kiện', summary: 'Chuẩn bị đội hình và theo dõi lịch hoạt động trên Đại Hải Trình.',
    source: 'https://haitactihon.com/forum/game/6/Huong-Dan-0.html',
    sections: [
      { title: 'Trước khi tham gia', paragraphs: ['Kiểm tra trang bị, vật phẩm hồi phục và thời gian mở hoạt động. Với nội dung tổ đội, thống nhất vai trò trước khi vào.'] },
      { title: 'Boss và phó bản', paragraphs: ['Quan sát chu kỳ ra đòn của boss, giữ kỹ năng cơ động cho thời điểm nguy hiểm và ưu tiên sống sót thay vì đứng yên gây sát thương.'] },
      { title: 'Sự kiện', paragraphs: ['Tin tức chính thức luôn ghi thời gian bắt đầu, kết thúc và điều kiện nhận quà. Đọc toàn bộ thể lệ trước khi đổi vật phẩm.'] },
    ],
  },
  {
    id: 'pvp-bang-hoi', category: 'Cộng đồng', title: 'PvP và bang hội', summary: 'Chuẩn bị cho đối kháng và phối hợp cùng đồng đội.',
    source: 'https://haitactihon.com/forum',
    sections: [
      { title: 'PvP', paragraphs: ['Trong đối kháng, giữ khoảng cách đúng với class quan trọng hơn việc dùng kỹ năng ngay khi hồi xong. Hãy đọc hướng di chuyển của đối thủ.'] },
      { title: 'Bang hội', paragraphs: ['Bang hội giúp tìm đội, chia sẻ kinh nghiệm và tham gia hoạt động cộng đồng. Tôn trọng quy ước của bang và chủ động báo lịch vắng.'] },
      { title: 'An toàn cộng đồng', paragraphs: ['Không đưa mật khẩu cho người tự xưng hỗ trợ viên. Giao dịch và nạp tiền chỉ thực hiện qua kênh chính thức.'] },
    ],
  },
];

const CATEGORIES = ['Tất cả', ...Array.from(new Set(ARTICLES.map((article) => article.category)))];

export function WikiGuide() {
  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('Tất cả');
  const [activeId, setActiveId] = useState(ARTICLES[0].id);

  const filtered = useMemo(() => {
    const normalized = query.trim().toLocaleLowerCase('vi');
    return ARTICLES.filter((article) => {
      const inCategory = category === 'Tất cả' || article.category === category;
      const inSearch = !normalized || `${article.title} ${article.summary} ${article.category}`.toLocaleLowerCase('vi').includes(normalized);
      return inCategory && inSearch;
    });
  }, [category, query]);

  const activeArticle = filtered.find((article) => article.id === activeId) ?? filtered[0] ?? ARTICLES[0];

  return (
    <section className="wiki-section">
      <div className="page-width wiki-toolbar">
        <label htmlFor="wiki-search">TÌM TRONG WIKI</label>
        <input id="wiki-search" type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Nhập: cài đặt, class, boss..." />
        <span>{ARTICLES.length} bài hướng dẫn</span>
      </div>

      <div className="page-width wiki-layout">
        <aside className="wiki-sidebar">
          <p>CHUYÊN MỤC</p>
          <div className="wiki-categories">
            {CATEGORIES.map((item) => <button type="button" className={category === item ? 'is-active' : ''} key={item} onClick={() => {
              setCategory(item);
              const firstMatch = item === 'Tất cả' ? ARTICLES[0] : ARTICLES.find((article) => article.category === item);
              if (firstMatch) setActiveId(firstMatch.id);
            }}>{item}</button>)}
          </div>
          <p>BÀI VIẾT</p>
          <div className="wiki-articles">
            {filtered.length ? filtered.map((article, index) => (
              <button type="button" className={activeArticle.id === article.id ? 'is-active' : ''} key={article.id} onClick={() => setActiveId(article.id)}>
                <span>{String(index + 1).padStart(2, '0')}</span>{article.title}
              </button>
            )) : <span className="wiki-empty">Không tìm thấy bài phù hợp.</span>}
          </div>
        </aside>

        <article className="wiki-article">
          <header><span>{activeArticle.category}</span><h2>{activeArticle.title}</h2><p>{activeArticle.summary}</p></header>
          {activeArticle.sections.map((section, index) => (
            <section id={`muc-${index + 1}`} key={section.title}>
              <span className="wiki-article__number">0{index + 1}</span>
              <h3>{section.title}</h3>
              {section.paragraphs.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              {section.points && <ul>{section.points.map((point) => <li key={point}>{point}</li>)}</ul>}
            </section>
          ))}
          {activeArticle.source && <a className="wiki-source" href={activeArticle.source} target="_blank" rel="noopener noreferrer">Đọc bài hướng dẫn chính thức →</a>}
        </article>

        <aside className="wiki-toc">
          <p>TRONG BÀI NÀY</p>
          {activeArticle.sections.map((section, index) => <a key={section.title} href={`#muc-${index + 1}`}><span>0{index + 1}</span>{section.title}</a>)}
          <a className="wiki-toc__forum" href="https://haitactihon.com/forum/game/6/Huong-Dan-0.html" target="_blank" rel="noopener noreferrer">Kho hướng dẫn gốc</a>
        </aside>
      </div>
    </section>
  );
}
