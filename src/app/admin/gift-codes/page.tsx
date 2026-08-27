import type { Metadata } from 'next';
import { GiftCodeManagement } from '@/features/admin/components/GiftCodeManagement';

export const metadata: Metadata = { title: 'Gift code - Hải Tặc Tí Hon' };

export default function GiftCodesPage() { return <GiftCodeManagement />; }
