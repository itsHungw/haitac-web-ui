import Image from 'next/image';
import Link from 'next/link';
import { ClassShowcase } from '@/components/home/ClassShowcase';
import { GuideCenter } from '@/components/home/GuideCenter';
import { NewsSection } from '@/components/home/NewsSection';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

const GAME_URL = 'https://htth.aqueduct.me';

export default function HomePage() {
  return (
    <PublicPageShell>
      <main>
        <section id="top" className="hero-art" aria-labelledby="hero-title">
          <h1 id="hero-title" className="sr-only">Hải Tặc Tí Hon — hành trình chinh phục Đại Hải Trình</h1>
          <Image
            src="/images/hero.png"
            alt="Thế giới Hải Tặc Tí Hon trong đêm hội trên biển"
            fill
            priority
            sizes="100vw"
            className="pixelated hero-art__image"
          />
          <div className="hero-actions">
            <Link className="hero-action-btn hero-action-btn--download" href="/tai-game">
              <span className="hero-action-btn__text">TẢI GAME</span>
              <small className="hero-action-btn__sub">ANDROID • PC • IOS</small>
            </Link>

            <a
              className="hero-action-btn hero-action-btn--play"
              href={GAME_URL}
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="hero-action-badge hero-action-badge--hot">★ CHƠI LIỀN</span>
              <span className="hero-action-btn__text">CHƠI NGAY</span>
              <small className="hero-action-btn__sub">TRÊN TRÌNH DUYỆT</small>
            </a>

            <Link className="hero-action-btn hero-action-btn--recharge" href="/nap-the">
              <span className="hero-action-badge hero-action-badge--promo">+50% KM</span>
              <span className="hero-action-btn__text">NẠP THẺ</span>
              <small className="hero-action-btn__sub">TỰ ĐỘNG 24/7</small>
            </Link>
          </div>
        </section>

        <ClassShowcase />
        <NewsSection />
        <GuideCenter />
      </main>
    </PublicPageShell>
  );
}
