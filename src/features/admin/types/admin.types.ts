export interface AdminOverview {
  viewer: string;
  generatedAt: string;
  totalAccounts: number;
  onlineAccounts: number;
  lockedAccounts: number;
  adminAccounts: number;
  createdToday: number;
}

export interface AdminPlayer {
  user: string;
  online: boolean;
  locked: boolean;
  admin: boolean;
  createdAt: string | null;
}

export interface AdminPlayerSearchResult {
  query: string;
  limit: number;
  truncated: boolean;
  players: AdminPlayer[];
}
