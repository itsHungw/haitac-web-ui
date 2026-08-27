import type { Metadata } from 'next';
import { LiveOperations } from '@/features/admin/components/LiveOperations';

export const metadata: Metadata = { title: 'Live operations - Hải Tặc Tí Hon' };

export default function LiveOperationsPage() { return <LiveOperations />; }
