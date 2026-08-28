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
  character: ForumCharacter | null;
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
