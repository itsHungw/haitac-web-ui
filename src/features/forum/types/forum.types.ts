export interface ForumCharacter {
  name: string;
  clazz: number;
  className: string;
  level: number;
  exp: number;
  beri: number;
  ruby: number;
  extol: number;
  pvpPoints: number;
  wantedPoints: number;
}

export interface ForumProfile {
  username: string;
  activated: boolean;
  online: boolean;
  coin: number;
  vnd: number;
  totalTopUp: number;
  loyaltyPoints: number;
  activationCost: number;
  vipLevel: number;
  character: ForumCharacter | null;
  characters: ForumCharacter[];
}

export interface RankingEntry {
  rank: number;
  name: string;
  clazz: number;
  className: string;
  level: number;
  score: number;
}

export interface ForumRankings {
  topUp: RankingEntry[];
  level: RankingEntry[];
}

export const CLASS_PORTRAITS: Record<number, string> = {
  1: '/assets/characters/luffy.jpg',  // Võ Sĩ
  2: '/assets/characters/zoro.jpg',   // Kiếm Khách
  3: '/assets/characters/sanji.jpg',  // Đầu Bếp
  4: '/assets/characters/nami.jpg',   // Hoa Tiêu
  5: '/assets/characters/usop.jpg',   // Xạ Thủ
};
