import { InnerMasthead } from '@/components/layout/InnerMasthead';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { RechargeForm } from '@/components/recharge/RechargeForm';
import { Parchment } from '@/components/ui/Parchment';

export const metadata = {
  title: 'Nạp Coin - Hải Tặc Tí Hon',
  description: 'Nạp Coin tự động 24/7 qua chuyển khoản VietQR và payOS.',
};

export default function RechargePage() {
  return (
    <PublicPageShell>
      <main>
        <InnerMasthead
          eyebrow="CỔNG NẠP CHÍNH THỨC"
          title="Nạp Coin"
          description="Coin là đơn vị nạp chính. Sau khi nhận Coin, bạn có thể đổi sang Ruby, Beri hoặc Extol tại NPC Nami trong game."
        />
        <section className="recharge-section">
          <div className="page-width">
            <Parchment className="recharge-scroll">
              <div className="recharge-banner-note">
                <span>MỘT KÊNH NẠP DUY NHẤT</span>
                <strong>VIETQR 24/7 · TIỀN VÀO THẲNG NGÂN HÀNG</strong>
                <p>payOS tự xác nhận và Coin được cộng vào tài khoản đang đăng nhập.</p>
              </div>
              <RechargeForm />
            </Parchment>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
