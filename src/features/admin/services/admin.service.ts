import { apiClient } from '@/lib/api/api-client';
import type {
  AdminAuditPage,
  AdminEconomy,
  AdminGiftCode,
  GiftCodePayload,
  AdminLiveOperation,
  LiveOperationType,
  AdminOverview,
  AdminPlayerDetail,
  AdminPlayerPage,
  AdminPlayerRole,
  AdminPlayerStatus,
  UpdatePlayerLockRequest,
  AdminFashionItem,
  UpdatePlayerBalancePayload,
} from '../types/admin.types';

export interface PlayerQuery {
  q?: string;
  role?: AdminPlayerRole;
  status?: AdminPlayerStatus;
  page?: number;
  size?: number;
}

function params<T extends object>(values: T) {
  const result = new URLSearchParams();
  Object.entries(values as Record<string, string | number | undefined>).forEach(([key, value]) => {
    if (value !== undefined && value !== '') result.set(key, String(value));
  });
  return result.toString();
}

export const adminService = {
  getOverview(): Promise<AdminOverview> {
    return apiClient.get<AdminOverview>('admin/overview');
  },

  getEconomy(): Promise<AdminEconomy> {
    return apiClient.get<AdminEconomy>('admin/economy');
  },

  getGiftCodes(): Promise<AdminGiftCode[]> {
    return apiClient.get<AdminGiftCode[]>('admin/gift-codes');
  },

  createGiftCode(code: string, payload: GiftCodePayload): Promise<AdminGiftCode> {
    return apiClient.post<AdminGiftCode>('admin/gift-codes', { code, ...payload });
  },

  updateGiftCode(code: string, payload: GiftCodePayload): Promise<AdminGiftCode> {
    return apiClient.put<AdminGiftCode>(`admin/gift-codes/${encodeURIComponent(code)}`, payload);
  },

  getLiveOperations(): Promise<AdminLiveOperation[]> {
    return apiClient.get<AdminLiveOperation[]>('admin/live-operations');
  },

  createLiveOperation(operationType: LiveOperationType, message: string, reason: string): Promise<AdminLiveOperation> {
    return apiClient.post<AdminLiveOperation>('admin/live-operations', { operationType, message, reason });
  },

  getPlayers(query: PlayerQuery = {}): Promise<AdminPlayerPage> {
    return apiClient.get<AdminPlayerPage>(`admin/players?${params(query)}`);
  },

  getPlayer(username: string): Promise<AdminPlayerDetail> {
    return apiClient.get<AdminPlayerDetail>(`admin/players/${encodeURIComponent(username)}`);
  },

  updatePlayerLock(username: string, request: UpdatePlayerLockRequest): Promise<AdminPlayerDetail> {
    return apiClient.patch<AdminPlayerDetail>(
      `admin/players/${encodeURIComponent(username)}/lock`,
      request,
    );
  },

  updatePlayerBalance(username: string, payload: UpdatePlayerBalancePayload): Promise<AdminPlayerDetail> {
    return apiClient.put<AdminPlayerDetail>(
      `admin/players/${encodeURIComponent(username)}/balance`,
      payload,
    );
  },

  getFashionItems(): Promise<AdminFashionItem[]> {
    return apiClient.get<AdminFashionItem[]>('admin/fashion');
  },

  updateFashion(id: number, payload: Partial<AdminFashionItem>): Promise<AdminFashionItem> {
    return apiClient.put<AdminFashionItem>(`admin/fashion/${id}`, payload);
  },

  bulkUpdateFashionPrice(payload: { itemIds: number[]; price: number }): Promise<{ affectedCount: number }> {
    return apiClient.post<{ affectedCount: number }>('admin/fashion/bulk-update', payload);
  },

  getAudit(query = '', page = 0, size = 20): Promise<AdminAuditPage> {
    return apiClient.get<AdminAuditPage>(`admin/audit?${params({ q: query, page, size })}`);
  },
};

