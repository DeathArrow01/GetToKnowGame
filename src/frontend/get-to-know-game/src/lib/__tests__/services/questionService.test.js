import { describe, it, expect, vi, beforeEach } from 'vitest';
import { questionService } from '../../services/questionService.js';
import { apiService } from '../../services/api.js';

// Mock the apiService
vi.mock('../../services/api.js', () => ({
    apiService: {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('QuestionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('getAllQuestions', () => {
        it('retrieves all questions', async () => {
            const mockQuestions = [
                { id: '1', section: 'Food', questionText: 'Do you like pizza?' },
                { id: '2', section: 'Entertainment', questionText: 'Do you watch anime?' }
            ];
            apiService.get.mockResolvedValueOnce(mockQuestions);

            const result = await questionService.getAllQuestions();

            expect(apiService.get).toHaveBeenCalledWith('/questions');
            expect(result).toEqual(mockQuestions);
        });

        it('handles empty questions array', async () => {
            apiService.get.mockResolvedValueOnce([]);

            const result = await questionService.getAllQuestions();

            expect(result).toEqual([]);
        });

        it('handles API errors', async () => {
            const error = new Error('Failed to fetch questions');
            apiService.get.mockRejectedValueOnce(error);

            await expect(questionService.getAllQuestions()).rejects.toThrow('Failed to fetch questions');
        });
    });

    describe('getQuestion', () => {
        it('retrieves a specific question by ID', async () => {
            const mockQuestion = { 
                id: '1', 
                section: 'Food', 
                questionText: 'Do you like pizza?' 
            };
            apiService.get.mockResolvedValueOnce(mockQuestion);

            const result = await questionService.getQuestion('1');

            expect(apiService.get).toHaveBeenCalledWith('/questions/1');
            expect(result).toEqual(mockQuestion);
        });

        it('handles question not found', async () => {
            const error = new Error('Question not found');
            apiService.get.mockRejectedValueOnce(error);

            await expect(questionService.getQuestion('999')).rejects.toThrow('Question not found');
        });
    });

    describe('createQuestion', () => {
        it('creates a new question', async () => {
            const newQuestion = {
                section: 'Food',
                questionText: 'Do you like sushi?'
            };
            const mockResponse = { 
                id: '3', 
                ...newQuestion 
            };
            apiService.post.mockResolvedValueOnce(mockResponse);

            const result = await questionService.createQuestion(newQuestion);

            expect(apiService.post).toHaveBeenCalledWith('/questions', newQuestion);
            expect(result).toEqual(mockResponse);
        });

        it('handles validation errors', async () => {
            const invalidQuestion = {
                section: '', // Empty section should fail validation
                questionText: 'Do you like sushi?'
            };
            const error = new Error('Validation failed: section is required');
            apiService.post.mockRejectedValueOnce(error);

            await expect(questionService.createQuestion(invalidQuestion)).rejects.toThrow('Validation failed: section is required');
        });

        it('handles duplicate question errors', async () => {
            const duplicateQuestion = {
                section: 'Food',
                questionText: 'Do you like pizza?' // This might already exist
            };
            const error = new Error('Question already exists');
            apiService.post.mockRejectedValueOnce(error);

            await expect(questionService.createQuestion(duplicateQuestion)).rejects.toThrow('Question already exists');
        });
    });

    describe('updateQuestion', () => {
        it('updates an existing question', async () => {
            const questionId = '1';
            const updatedQuestion = {
                section: 'Food',
                questionText: 'Do you like pizza with pineapple?'
            };
            const mockResponse = { 
                id: questionId, 
                ...updatedQuestion 
            };
            apiService.put.mockResolvedValueOnce(mockResponse);

            const result = await questionService.updateQuestion(questionId, updatedQuestion);

            expect(apiService.put).toHaveBeenCalledWith('/questions/1', updatedQuestion);
            expect(result).toEqual(mockResponse);
        });

        it('handles question not found during update', async () => {
            const error = new Error('Question not found');
            apiService.put.mockRejectedValueOnce(error);

            await expect(questionService.updateQuestion('999', { section: 'Food', questionText: 'Test' })).rejects.toThrow('Question not found');
        });

        it('handles validation errors during update', async () => {
            const invalidUpdate = {
                section: '', // Empty section should fail validation
                questionText: 'Updated question'
            };
            const error = new Error('Validation failed: section is required');
            apiService.put.mockRejectedValueOnce(error);

            await expect(questionService.updateQuestion('1', invalidUpdate)).rejects.toThrow('Validation failed: section is required');
        });
    });

    describe('deleteQuestion', () => {
        it('deletes a question by ID', async () => {
            const mockResponse = { success: true };
            apiService.delete.mockResolvedValueOnce(mockResponse);

            const result = await questionService.deleteQuestion('1');

            expect(apiService.delete).toHaveBeenCalledWith('/questions/1');
            expect(result).toEqual(mockResponse);
        });

        it('handles question not found during deletion', async () => {
            const error = new Error('Question not found');
            apiService.delete.mockRejectedValueOnce(error);

            await expect(questionService.deleteQuestion('999')).rejects.toThrow('Question not found');
        });

        it('handles deletion of question in use', async () => {
            const error = new Error('Cannot delete question that is being used in active sessions');
            apiService.delete.mockRejectedValueOnce(error);

            await expect(questionService.deleteQuestion('1')).rejects.toThrow('Cannot delete question that is being used in active sessions');
        });
    });

    describe('integration scenarios', () => {
        it('handles complete CRUD operations', async () => {
            // Create question
            const newQuestion = {
                section: 'Food',
                questionText: 'Do you like tacos?'
            };
            const createResponse = { id: '4', ...newQuestion };
            apiService.post.mockResolvedValueOnce(createResponse);

            const created = await questionService.createQuestion(newQuestion);
            expect(created).toEqual(createResponse);

            // Get all questions
            const allQuestions = [
                { id: '1', section: 'Food', questionText: 'Do you like pizza?' },
                { id: '2', section: 'Entertainment', questionText: 'Do you watch anime?' },
                { id: '4', section: 'Food', questionText: 'Do you like tacos?' }
            ];
            apiService.get.mockResolvedValueOnce(allQuestions);

            const questions = await questionService.getAllQuestions();
            expect(questions).toEqual(allQuestions);

            // Update question
            const updatedQuestion = {
                section: 'Food',
                questionText: 'Do you like tacos with extra cheese?'
            };
            const updateResponse = { id: '4', ...updatedQuestion };
            apiService.put.mockResolvedValueOnce(updateResponse);

            const updated = await questionService.updateQuestion('4', updatedQuestion);
            expect(updated).toEqual(updateResponse);

            // Delete question
            const deleteResponse = { success: true };
            apiService.delete.mockResolvedValueOnce(deleteResponse);

            const deleted = await questionService.deleteQuestion('4');
            expect(deleted).toEqual(deleteResponse);

            // Verify all API calls were made
            expect(apiService.post).toHaveBeenCalledTimes(1);
            expect(apiService.get).toHaveBeenCalledTimes(1);
            expect(apiService.put).toHaveBeenCalledTimes(1);
            expect(apiService.delete).toHaveBeenCalledTimes(1);
        });

        it('handles questions with different sections', async () => {
            const questions = [
                { id: '1', section: 'Food', questionText: 'Do you like pizza?' },
                { id: '2', section: 'Entertainment', questionText: 'Do you watch anime?' },
                { id: '3', section: 'Lifestyle', questionText: 'Do you exercise regularly?' },
                { id: '4', section: 'Technology', questionText: 'Do you use social media?' }
            ];
            apiService.get.mockResolvedValueOnce(questions);

            const result = await questionService.getAllQuestions();

            expect(result).toEqual(questions);
            expect(result).toHaveLength(4);
            expect(result.map(q => q.section)).toEqual(['Food', 'Entertainment', 'Lifestyle', 'Technology']);
        });
    });
});
