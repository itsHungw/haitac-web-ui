import type { Metadata } from 'next';
import { EconomyDashboard } from '@/features/admin/components/EconomyDashboard';

export const metadata: Metadata = { title: 'Kinh tế game - Hải Tặc Tí Hon' };

export default function EconomyPage() {
  return <EconomyDashboard />;
}
