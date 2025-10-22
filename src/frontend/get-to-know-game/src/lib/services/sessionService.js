import { apiService } from './api.js';

export const sessionService = {
    async createSession(player1Name, player2Name) {
        return apiService.post('/sessions', {
            player1Name,
            player2Name
        });
    },

    async getSession(sessionId) {
        return apiService.get(`/sessions/${sessionId}`);
    },

    async submitAnswers(sessionId, playerId, answers) {
        return apiService.put(`/sessions/${sessionId}/answers`, {
            playerId,
            answers
        });
    },

    async deleteSession(sessionId) {
        return apiService.delete(`/sessions/${sessionId}`);
    }
};
