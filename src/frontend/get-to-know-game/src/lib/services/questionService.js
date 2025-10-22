import { apiService } from './api.js';

export const questionService = {
    async getAllQuestions() {
        return apiService.get('/questions');
    },

    async getQuestion(id) {
        return apiService.get(`/questions/${id}`);
    },

    async createQuestion(question) {
        return apiService.post('/questions', question);
    },

    async updateQuestion(id, question) {
        return apiService.put(`/questions/${id}`, question);
    },

    async deleteQuestion(id) {
        return apiService.delete(`/questions/${id}`);
    }
};
