import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sessionService } from '../../services/sessionService.js';
import { apiService } from '../../services/api.js';

// Mock the apiService
vi.mock('../../services/api.js', () => ({
    apiService: {
        post: vi.fn(),
        get: vi.fn(),
        put: vi.fn(),
        delete: vi.fn()
    }
}));

describe('SessionService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('createSession', () => {
        it('creates a session with player names', async () => {
            const mockResponse = { 
                sessionId: '123', 
                player1Id: 'player1', 
                player2Name: 'Bob' 
            };
            apiService.post.mockResolvedValueOnce(mockResponse);

            const result = await sessionService.createSession('Alice', 'Bob');

            expect(apiService.post).toHaveBeenCalledWith('/sessions', {
                player1Name: 'Alice',
                player2Name: 'Bob'
            });
            expect(result).toEqual(mockResponse);
        });

        it('handles API errors', async () => {
            const error = new Error('API Error');
            apiService.post.mockRejectedValueOnce(error);

            await expect(sessionService.createSession('Alice', 'Bob')).rejects.toThrow('API Error');
        });
    });

    describe('getSession', () => {
        it('retrieves a session by ID', async () => {
            const mockResponse = { 
                sessionId: '123', 
                player1Name: 'Alice', 
                player2Name: 'Bob' 
            };
            apiService.get.mockResolvedValueOnce(mockResponse);

            const result = await sessionService.getSession('123');

            expect(apiService.get).toHaveBeenCalledWith('/sessions/123');
            expect(result).toEqual(mockResponse);
        });

        it('handles API errors', async () => {
            const error = new Error('Session not found');
            apiService.get.mockRejectedValueOnce(error);

            await expect(sessionService.getSession('123')).rejects.toThrow('Session not found');
        });
    });

    describe('joinSession', () => {
        it('joins a session with player2 name', async () => {
            const mockResponse = { 
                sessionId: '123', 
                player2Id: 'player2' 
            };
            apiService.post.mockResolvedValueOnce(mockResponse);

            const result = await sessionService.joinSession('123', 'Bob');

            expect(apiService.post).toHaveBeenCalledWith('/sessions/123/join', {
                player2Name: 'Bob'
            });
            expect(result).toEqual(mockResponse);
        });

        it('handles API errors', async () => {
            const error = new Error('Session not found');
            apiService.post.mockRejectedValueOnce(error);

            await expect(sessionService.joinSession('123', 'Bob')).rejects.toThrow('Session not found');
        });
    });

    describe('submitAnswers', () => {
        it('submits answers for a session', async () => {
            const mockAnswers = ['Yay!', 'Nay!', "I don't care!"];
            const mockResponse = { success: true };
            apiService.put.mockResolvedValueOnce(mockResponse);

            const result = await sessionService.submitAnswers('123', 'player1', mockAnswers);

            expect(apiService.put).toHaveBeenCalledWith('/sessions/123/answers', {
                playerId: 'player1',
                answers: mockAnswers
            });
            expect(result).toEqual(mockResponse);
        });

        it('handles empty answers array', async () => {
            const mockResponse = { success: true };
            apiService.put.mockResolvedValueOnce(mockResponse);

            const result = await sessionService.submitAnswers('123', 'player1', []);

            expect(apiService.put).toHaveBeenCalledWith('/sessions/123/answers', {
                playerId: 'player1',
                answers: []
            });
            expect(result).toEqual(mockResponse);
        });

        it('handles API errors', async () => {
            const error = new Error('Invalid answers');
            apiService.put.mockRejectedValueOnce(error);

            await expect(sessionService.submitAnswers('123', 'player1', ['Yay!'])).rejects.toThrow('Invalid answers');
        });
    });

    describe('deleteSession', () => {
        it('deletes a session by ID', async () => {
            const mockResponse = { success: true };
            apiService.delete.mockResolvedValueOnce(mockResponse);

            const result = await sessionService.deleteSession('123');

            expect(apiService.delete).toHaveBeenCalledWith('/sessions/123');
            expect(result).toEqual(mockResponse);
        });

        it('handles API errors', async () => {
            const error = new Error('Session not found');
            apiService.delete.mockRejectedValueOnce(error);

            await expect(sessionService.deleteSession('123')).rejects.toThrow('Session not found');
        });
    });

    describe('integration scenarios', () => {
        it('handles complete session flow', async () => {
            // Create session
            const createResponse = { sessionId: '123', player1Id: 'player1' };
            apiService.post.mockResolvedValueOnce(createResponse);

            const session = await sessionService.createSession('Alice', 'Bob');
            expect(session).toEqual(createResponse);

            // Join session
            const joinResponse = { sessionId: '123', player2Id: 'player2' };
            apiService.post.mockResolvedValueOnce(joinResponse);

            const joinedSession = await sessionService.joinSession('123', 'Bob');
            expect(joinedSession).toEqual(joinResponse);

            // Submit answers
            const answers = ['Yay!', 'Nay!'];
            const submitResponse = { success: true };
            apiService.put.mockResolvedValueOnce(submitResponse);

            const result = await sessionService.submitAnswers('123', 'player1', answers);
            expect(result).toEqual(submitResponse);

            // Verify all API calls were made
            expect(apiService.post).toHaveBeenCalledTimes(2);
            expect(apiService.put).toHaveBeenCalledTimes(1);
        });

        it('handles different answer types', async () => {
            const answers = ['Yay!', 'Nay!', "I don't care!", 'Yay!', 'Nay!'];
            const mockResponse = { success: true };
            apiService.put.mockResolvedValueOnce(mockResponse);

            const result = await sessionService.submitAnswers('123', 'player1', answers);

            expect(apiService.put).toHaveBeenCalledWith('/sessions/123/answers', {
                playerId: 'player1',
                answers: answers
            });
            expect(result).toEqual(mockResponse);
        });
    });
});
