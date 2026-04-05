import { api } from './client';

export const leaderboardApi = {
    get: () => api.get('/api/leaderboard'),
};

export default leaderboardApi;
