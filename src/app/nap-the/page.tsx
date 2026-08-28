import { InnerMasthead } from '@/components/layout/InnerMasthead';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { RechargeForm } from '@/components/recharge/RechargeForm';
import { Parchment } from '@/components/ui/Parchment';

export const metadata = {
  title: 'Nạp thẻ & Ruby - Hải Tặc Tí Hon',
  description: 'Cổng nạp thẻ cào, chuyển khoản QR và ví điện tử tự động 24/7 game Hải Tặc Tí Hon.',
};

export default function RechargePage() {
  return (
    <PublicPageShell>
      <main>
        <InnerMasthead
          eyebrow="CỔNG NẠP CHÍNH THỨC"
          title="Nạp Thẻ & Ruby"
          description="Nạp Ruby tự động 24/7 qua Thẻ cào, Ví MoMo, Ngân hàng (VietQR) với tỷ lệ ưu đãi tốt nhất."
        />
        <section className="recharge-section">
          <div className="page-width">
            <Parchment className="recharge-scroll">
              <div className="recharge-banner-note">
                <span>SỰ KIỆN ƯU ĐÃI NẠP</span>
                <strong>KHUYẾN MÃI +20% ĐẾN +50% GIÁ TRỊ RUBY</strong>
                <p>Tự động xử lý &amp; cộng Ruby trong 30 giây</p>
              </div>
              <RechargeForm />
            </Parchment>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
