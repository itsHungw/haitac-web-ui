export interface AdminOverview {
  viewer: string;
  generatedAt: string;
  totalAccounts: number;
  onlineAccounts: number;
  lockedAccounts: number;
  adminAccounts: number;
  createdToday: number;
}

export type AdminPlayerRole = 'all' | 'admin' | 'player';
export type AdminPlayerStatus = 'all' | 'online' | 'offline' | 'locked';

export interface AdminPlayer {
  id: number;
  user: string;
  email: string | null;
  phone: string | null;
  characterCount: number;
  online: boolean;
  locked: boolean;
  admin: boolean;
  vip: number;
  createdAt: string | null;
}

export interface AdminPlayerPage {
  query: string;
  role: AdminPlayerRole;
  status: AdminPlayerStatus;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  players: AdminPlayer[];
}

export interface AdminPlayerDetail {
  id: number;
  user: string;
  email: string | null;
  phone: string | null;
  characters: string[];
  online: boolean;
  locked: boolean;
  admin: boolean;
  statusPoints: number;
  coin: number;
  vip: number;
  totalTopUp: number;
  vnd: number;
  activated: boolean;
  active: boolean;
  ipAddress: string | null;
  note: string | null;
  createdAt: string | null;
}

export interface UpdatePlayerLockRequest {
  locked: boolean;
  reason: string;
}

export interface AdminAuditEntry {
  id: number;
  actor: string;
  action: 'ACCOUNT_LOCKED' | 'ACCOUNT_UNLOCKED' | string;
  targetType: string;
  target: string;
  reason: string;
  beforeData: string | null;
  afterData: string | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AdminAuditPage {
  query: string;
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  entries: AdminAuditEntry[];
}

export type AdminTransactionStatus = 'success' | 'pending' | 'failed';

export interface AdminEconomyTransaction {
  id: number;
  source: 'CARD' | 'GATEWAY' | string;
  username: string;
  amount: number;
  provider: string;
  status: AdminTransactionStatus;
  createdAt: string;
}

export interface AdminEconomy {
  generatedAt: string;
  circulatingCoin: number;
  circulatingVnd: number;
  lifetimeTopUp: number;
  topUpToday: number;
  topUpLastSevenDays: number;
  successfulTransactions: number;
  pendingTransactions: number;
  recentTransactions: AdminEconomyTransaction[];
}

export interface AdminGiftReward { type: number; itemId: number; quantity: number; }

export interface AdminGiftCode {
  id: number;
  code: string;
  beri: number;
  ruby: number;
  rewards: AdminGiftReward[];
  message: string;
  usedCount: number;
  maxRedemptions: number;
  eligibleUsers: string;
  active: boolean;
}

export interface GiftCodePayload {
  beri: number;
  ruby: number;
  rewards: AdminGiftReward[];
  message: string;
  maxRedemptions: number;
  eligibleUsers: string;
  reason: string;
}

export type LiveOperationType = 'BROADCAST' | 'MAINTENANCE_ON' | 'MAINTENANCE_OFF';
export type LiveOperationStatus = 'PENDING' | 'PROCESSING' | 'APPLIED' | 'FAILED';

export interface AdminLiveOperation {
  id: number;
  operationType: LiveOperationType;
  message: string;
  requestedBy: string;
  reason: string;
  status: LiveOperationStatus;
  errorMessage: string | null;
  createdAt: string;
  processedAt: string | null;
}

export interface AdminFashionItem {
  id: number;
  icon: number;
  name: string;
  info: string;
  mwear: string;
  op: string;
  price: number;
  isForSale: boolean;
}


export interface UpdatePlayerBalancePayload {
  coin?: number;
  vnd?: number;
  totalTopUp?: number;
  reason: string;
}

