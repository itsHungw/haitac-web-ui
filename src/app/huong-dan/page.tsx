import { WikiGuide } from '@/components/wiki/WikiGuide';
import { InnerMasthead } from '@/components/layout/InnerMasthead';
import { PublicPageShell } from '@/components/layout/PublicPageShell';

export const metadata = {
  title: 'Wiki hướng dẫn - Hải Tặc Tí Hon',
  description: 'Wiki dành cho tân thủ và thuyền trưởng Hải Tặc Tí Hon.',
};

export default function GuidePage() {
  return (
    <PublicPageShell>
      <main>
        <InnerMasthead eyebrow="THƯ VIỆN ĐẠI HẢI TRÌNH" title="Wiki thuyền trưởng" description="Tra cứu cài đặt, class, kỹ năng, trang bị và các hoạt động trong game." />
        <WikiGuide />
      </main>
    </PublicPageShell>
  );
}
