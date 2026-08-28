import Image from 'next/image';

interface FooterProps { onOpenRegister?: () => void }

const GAME_URL = 'https://htth.aqueduct.me';

export function Footer({ onOpenRegister }: FooterProps) {
  return (
    <footer className="site-footer">
      <div className="footer-beach" aria-hidden="true">
        <Image src="/images/footer.jpg" alt="" fill sizes="100vw" className="pixelated" />
      </div>

      <div className="page-width footer-callout">
        <div><span className="eyebrow">THỜI ĐẠI HẢI TẶC BẮT ĐẦU</span><h2>Con tàu đang đợi bạn.</h2></div>
        <div className="footer-callout__actions">
          <a className="pixel-button pixel-button--gold" href={GAME_URL} target="_blank" rel="noopener noreferrer">RA KHƠI</a>
          {onOpenRegister && <button className="footer-register" type="button" onClick={onOpenRegister}>TẠO TÀI KHOẢN</button>}
        </div>
      </div>

      <div className="page-width footer-grid">
        <div className="footer-brand">
          <div className="footer-brand__lockup">
            <Image src="/images/logo.png" alt="" width={53} height={53} className="pixelated" />
            <strong>HẢI TẶC<br />TÍ HON</strong>
          </div>
          <p>Game Hải Tặc Tí Hon số 222/QĐ-PTTH&amp;TTĐT do Bộ Thông Tin và Truyền Thông cấp ngày 30/05/2025.</p>
        </div>
        <div><h3>Điểm đến</h3><a href="/">Trang chủ</a><a href="/tai-game">Tải game</a><a href="/#tin-tuc">Tin tức</a><a href="/huong-dan">Hướng dẫn</a></div>
        <div><h3>Cộng đồng</h3><a href="/dien-dan">Diễn đàn</a><a href="https://www.facebook.com/ht.teamobi" target="_blank" rel="noopener noreferrer">Fanpage</a><a href="/nap-the">Nạp ruby</a></div>
      </div>
      <p className="footer-health">CHƠI QUÁ 180 PHÚT MỘT NGÀY SẼ ẢNH HƯỞNG ĐẾN SỨC KHỎE</p>
    </footer>
  );
}
