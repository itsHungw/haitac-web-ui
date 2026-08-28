import { PublicPageShell } from '@/components/layout/PublicPageShell';
import { ForumHub } from '@/features/forum/components/ForumHub';

export const metadata = {
  title: 'Diễn đàn Đại Hải Trình - Hải Tặc Tí Hon',
  description: 'Tin tức, thảo luận, hướng dẫn và bảng truy nã cộng đồng Hải Tặc Tí Hon.',
};

export default function ForumPage() {
  return <PublicPageShell><main><ForumHub /></main></PublicPageShell>;
}
