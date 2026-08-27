import type { Metadata } from 'next';
import { AuditLog } from '@/features/admin/components/AuditLog';

export const metadata: Metadata = {
  title: 'Nhật ký quản trị - Hải Tặc Tí Hon',
};

export default function AdminAuditPage() {
  return <AuditLog />;
}
