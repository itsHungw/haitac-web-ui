import { InnerMasthead } from '@/components/layout/InnerMasthead';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { RechargeForm } from '@/components/recharge/RechargeForm';
import { Parchment } from '@/components/ui/Parchment';

export const metadata = {
  title: 'Nạp Coin - Hải Tặc Tí Hon',
  description: 'Nạp Coin tự động 24/7 bằng mã QR chuyển khoản ngân hàng.',
};

export default function RechargePage() {
  return (
    <PublicPageShell>
      <main>
        <InnerMasthead
          eyebrow="CỔNG NẠP CHÍNH THỨC"
          title="Nạp Coin"
          description="Chọn số tiền, quét mã bằng ứng dụng ngân hàng và nhận Coin vào tài khoản. Coin có thể đổi sang Ruby, Beri hoặc Extol tại NPC Nami."
        />
        <section className="recharge-section">
          <div className="page-width">
            <Parchment className="recharge-scroll">
              <div className="recharge-banner-note">
                <span>NẠP COIN TỰ ĐỘNG 24/7</span>
                <strong>QUÉT MÃ NGÂN HÀNG · NHẬN COIN TRONG ÍT PHÚT</strong>
                <p>Coin dùng chung cho mọi nhân vật trong tài khoản.</p>
              </div>
              <RechargeForm />
            </Parchment>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
