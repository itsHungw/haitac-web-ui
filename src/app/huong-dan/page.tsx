import { WikiGuide } from '@/components/wiki/WikiGuide';
import { InnerMasthead } from '@/components/layout/InnerMasthead';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

export const metadata = {
  title: 'Wiki Đại Hải Trình - Hải Tặc Tí Hon',
  description: 'Tra cứu dữ liệu NPC, bản đồ, nhiệm vụ, trái ác quỷ, kỹ năng và vật phẩm Hải Tặc Tí Hon.',
};

export default function GuidePage() {
  return (
    <PublicPageShell>
      <main>
        <InnerMasthead eyebrow="THƯ VIỆN ĐẠI HẢI TRÌNH" title="Wiki thuyền trưởng" description="Bách khoa dữ liệu được đối chiếu trực tiếp từ source game và máy chủ." />
        <WikiGuide />
      </main>
    </PublicPageShell>
  );
}
