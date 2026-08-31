import { InnerMasthead } from '@/components/layout/InnerMasthead';
import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { RechargeForm } from '@/components/recharge/RechargeForm';
import { Parchment } from '@/components/ui/Parchment';

export const metadata = {
  title: 'Nạp Coin - Hải Tặc Tí Hon',
  description: 'Nạp Coin qua chuyển khoản ngân hàng, ví điện tử hoặc thẻ cào để sử dụng trong Hải Tặc Tí Hon.',
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
                <span>CHUYỂN KHOẢN LÀ KÊNH ƯU TIÊN</span>
                <strong>NẠP TIỀN NHẬN COIN · TỰ CHỌN CÁCH QUY ĐỔI TRONG GAME</strong>
                <p>Thẻ cào được đặt ở kênh dự phòng do chiết khấu đối tác cao.</p>
              </div>
              <RechargeForm />
            </Parchment>
          </div>
        </section>
      </main>
    </PublicPageShell>
  );
}
