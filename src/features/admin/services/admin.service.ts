import { apiClient } from '@/lib/api/api-client';
import type { AdminOverview, AdminPlayerSearchResult } from '../types/admin.types';

export const adminService = {
  getOverview(): Promise<AdminOverview> {
    return apiClient.get<AdminOverview>('admin/overview');
  },

  searchPlayers(query: string): Promise<AdminPlayerSearchResult> {
    return apiClient.get<AdminPlayerSearchResult>(`admin/players?q=${encodeURIComponent(query)}`);
  },
};
