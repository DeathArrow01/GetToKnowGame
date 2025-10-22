import { apiService } from './api.js';

export const playerService = {
    async createPlayer(player) {
        return apiService.post('/players', player);
    },

    async getPlayer(id) {
        return apiService.get(`/players/${id}`);
    },

    async updatePlayer(id, player) {
        return apiService.put(`/players/${id}`, player);
    },

    async deletePlayer(id) {
        return apiService.delete(`/players/${id}`);
    }
};
