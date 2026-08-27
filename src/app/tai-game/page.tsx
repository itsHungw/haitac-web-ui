import { InnerMasthead } from '@/components/layout/InnerMasthead';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

const DOWNLOADS = [
  {
    platform: 'JAVA', code: 'J2ME', version: '129', size: '0.8 MB', note: 'Dành cho điện thoại Java cấu hình thấp.',
    links: [
      { label: 'TẢI JAD', href: 'https://wap2.gomobi.vn/game2/jad/116/13' },
      { label: 'TẢI JAR', href: 'https://wap2.gomobi.vn/game2/jar/116/13' },
    ],
  },
  {
    platform: 'ANDROID', code: 'APK', version: '129', size: '3.92 MB', note: 'Cài trực tiếp bằng APK hoặc tải từ Google Play.',
    links: [
      { label: 'TẢI APK', href: 'https://dl.teamobi.com/drive/get/j3' },
      { label: 'GOOGLE PLAY', href: 'https://play.google.com/store/apps/details?id=com.silvershield.haitacVN' },
    ],
  },
  {
    platform: 'WINDOWS', code: 'PC HD', version: '129', size: '10.85 MB', note: 'Phiên bản HD dành cho máy tính Windows.',
    links: [
      { label: 'TẢI PC HD', href: 'https://dl.teamobi.com/drive/get/j1' },
      { label: 'CÁCH CÀI ĐẶT', href: 'https://haitactihon.com/forum/threads/1579564/Huong-dan-tai-va-cai-dat-game-0.html' },
    ],
  },
  {
    platform: 'iOS', code: 'APPLE', version: '2.10.2', size: 'App Store', note: 'Cài qua trang iOS chính thức hoặc tham gia TestFlight.',
    links: [
      { label: 'TẢI iOS', href: 'https://ios.gomobi.vn/game-hai-tac-ti-hon' },
      { label: 'TESTFLIGHT', href: 'https://testflight.apple.com/join/fJFCsZmj' },
    ],
  },
];

export const metadata = {
  title: 'Tải game - Hải Tặc Tí Hon',
  description: 'Tải Hải Tặc Tí Hon cho Android, Windows, iOS và điện thoại Java.',
};

export default function DownloadPage() {
  return (
    <PublicPageShell>
      <main>
        <InnerMasthead eyebrow="BẾN TÀU CÀI ĐẶT" title="Tải Hải Tặc Tí Hon" description="Chọn đúng nền tảng, tải bản mới nhất và bắt đầu hành trình." />
        <section className="download-section">
          <div className="page-width">
            <div className="release-note"><span>BẢN HIỆN HÀNH</span><strong>Version 129</strong><p>Cập nhật ngày 21.10.2025</p></div>
            <div className="download-grid">
              {DOWNLOADS.map((item, index) => (
                <article className="download-card" key={item.platform}>
                  <div className="download-card__head"><span>0{index + 1}</span><strong>{item.code}</strong></div>
                  <div className="download-card__body">
                    <p className="download-card__platform">{item.platform}</p>
                    <h2>Phiên bản {item.version}</h2>
                    <p>{item.note}</p>
                    <dl><div><dt>DUNG LƯỢNG</dt><dd>{item.size}</dd></div><div><dt>TRẠNG THÁI</dt><dd>Sẵn sàng</dd></div></dl>
                    <div className="download-card__actions">
                      {item.links.map((link, linkIndex) => (
                        <a className={linkIndex === 0 ? 'is-primary' : ''} key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">{link.label}</a>
                      ))}
                    </div>
                  </div>
                </article>
              ))}
            </div>
            <p className="download-source">Liên kết tải được dẫn trực tiếp tới các kênh phân phối chính thức của Hải Tặc Tí Hon.</p>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
