import { apiClient } from '@/lib/api/api-client';
import type { ForumProfile, ForumRankings } from '../types/forum.types';

export const forumService = {
  getProfile: () => apiClient.get<ForumProfile>('forum/profile'),
  getRankings: () => apiClient.get<ForumRankings>('forum/rankings'),
  activate: () => apiClient.post<ForumProfile>('forum/activate'),
};
