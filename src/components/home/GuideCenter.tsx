import { Parchment } from '@/components/ui/Parchment';

const GUIDE_TOPICS = ['Tân thủ', 'Trang bị', 'Kỹ năng', 'Đồng hành', 'Boss thế giới', 'PvP', 'Bang hội', 'Sự kiện'];

export function GuideCenter() {
  return (
    <section id="huong-dan" className="guide-section">
      <div className="guide-waves" aria-hidden="true" />
      <div className="page-width guide-layout">
        <div>
          <span className="eyebrow">HẢI ĐỒ THUYỀN TRƯỞNG</span>
          <h2>Không lạc hướng giữa biển lớn</h2>
          <p>Từ những nhiệm vụ đầu tiên đến PvP và bang hội, cẩm nang cộng đồng giúp bạn tra cứu đúng thứ cần biết.</p>
          <a className="text-link-light" href="/huong-dan">Mở Wiki hướng dẫn →</a>
        </div>
        <Parchment className="guide-scroll">
          <ol className="guide-topics">
            {GUIDE_TOPICS.map((topic, index) => (
              <li key={topic}><span>{String(index + 1).padStart(2, '0')}</span>{topic}</li>
            ))}
          </ol>
        </Parchment>
      </div>
    </section>
  );
}
