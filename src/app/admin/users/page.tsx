import type { Metadata } from 'next';
import { UserManagement } from '@/features/admin/components/UserManagement';

export const metadata: Metadata = {
  title: 'Quản lý người chơi - Hải Tặc Tí Hon',
};

export default async function AdminUsersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const params = await searchParams;
  return <UserManagement initialQuery={params.q?.slice(0, 60) ?? ''} />;
}
