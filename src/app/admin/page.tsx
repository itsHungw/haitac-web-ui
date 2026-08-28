import type { Metadata } from 'next';
import { AdminDashboard } from '@/features/admin/components/AdminDashboard';

export const metadata: Metadata = {
  title: 'Đài chỉ huy - Hải Tặc Tí Hon',
  description: 'Trung tâm giám sát và vận hành Hải Tặc Tí Hon.',
};

export default function AdminPage() {
  return <AdminDashboard />;
}
