import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { ProfileDashboard } from '@/features/forum/components/ProfileDashboard';

export const metadata = {
  title: 'Hồ sơ thuyền trưởng - Hải Tặc Tí Hon',
  description: 'Xem nhân vật, tài sản, trạng thái kích hoạt và hành trình tích lũy.',
};

export default function ProfilePage() {
  return <PublicPageShell><main><ProfileDashboard /></main></PublicPageShell>;
}
