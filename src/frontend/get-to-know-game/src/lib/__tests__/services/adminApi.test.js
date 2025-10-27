import { describe, test, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch globally
global.fetch = vi.fn();

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock import.meta.env
Object.defineProperty(import.meta, 'env', {
  value: {
    VITE_API_URL: undefined
  },
  writable: true
});

// Import the real adminApi instance
import { adminApi } from '$lib/services/adminApi';

describe('AdminApiService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset adminApi state
    adminApi.setAdminKey(null);
    localStorageMock.getItem.mockReturnValue(null);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('constructor and configuration', () => {
    test('initializes with default base URL', () => {
      expect(adminApi.baseUrl).toBe('http://localhost:5012/api');
    });

    test('initializes with null admin key', () => {
      expect(adminApi.adminKey).toBe(null);
    });
  });

  describe('admin key management', () => {
    test('sets admin key and stores in localStorage', () => {
      const testKey = 'test-admin-key';
      adminApi.setAdminKey(testKey);
      
      expect(adminApi.adminKey).toBe(testKey);
      expect(localStorageMock.setItem).toHaveBeenCalledWith('admin_key', testKey);
    });

    test('removes admin key from localStorage when set to null', () => {
      adminApi.setAdminKey('test-key');
      adminApi.setAdminKey(null);
      
      expect(adminApi.adminKey).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_key');
    });

    test('gets admin key from localStorage when not set', () => {
      const testKey = 'stored-key';
      localStorageMock.getItem.mockReturnValue(testKey);
      
      const result = adminApi.getAdminKey();
      
      expect(result).toBe(testKey);
      expect(adminApi.adminKey).toBe(testKey);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('admin_key');
    });

    test('returns cached admin key when already set', () => {
      const testKey = 'cached-key';
      adminApi.adminKey = testKey;
      
      const result = adminApi.getAdminKey();
      
      expect(result).toBe(testKey);
      expect(localStorageMock.getItem).not.toHaveBeenCalled();
    });
  });

  describe('authentication headers', () => {
    test('returns empty object when no admin key', () => {
      const headers = adminApi.getAuthHeaders();
      
      expect(headers).toEqual({});
    });

    test('returns proper headers when admin key is set', () => {
      const testKey = 'test-key';
      adminApi.setAdminKey(testKey);
      
      const headers = adminApi.getAuthHeaders();
      
      expect(headers).toEqual({
        'Authorization': `Bearer ${testKey}`,
        'X-Admin-Key': testKey,
        'Content-Type': 'application/json'
      });
    });
  });

  describe('request method', () => {
    test('makes successful request with proper headers', async () => {
      const testKey = 'test-key';
      adminApi.setAdminKey(testKey);
      
      const mockResponse = {
        ok: true,
        status: 200,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.request('/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/test',
        expect.objectContaining({
          headers: {
            'Authorization': `Bearer ${testKey}`,
            'X-Admin-Key': testKey,
            'Content-Type': 'application/json'
          }
        })
      );
      expect(result).toBe(mockResponse);
    });

    test('merges custom headers with auth headers', async () => {
      adminApi.setAdminKey('test-key');
      
      const mockResponse = { ok: true, status: 200 };
      fetch.mockResolvedValue(mockResponse);

      await adminApi.request('/test', {
        headers: { 'Custom-Header': 'value' }
      });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/test',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Custom-Header': 'value'
          })
        })
      );
      
      // Verify the call was made with the correct URL and method
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/test',
        expect.any(Object)
      );
    });

    test('handles 401 authentication failure', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      adminApi.setAdminKey('invalid-key');
      
      const mockResponse = {
        ok: false,
        status: 401,
        statusText: 'Unauthorized'
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(adminApi.request('/test')).rejects.toThrow('Authentication failed. Please check your admin key.');
      expect(adminApi.adminKey).toBe(null);
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('admin_key');
      expect(consoleSpy).toHaveBeenCalledWith('Admin API Error:', expect.any(Error));
      
      consoleSpy.mockRestore();
    });

    test('handles network errors', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const networkError = new Error('Network error');
      fetch.mockRejectedValue(networkError);

      await expect(adminApi.request('/test')).rejects.toThrow('Network error');
      expect(consoleSpy).toHaveBeenCalledWith('Admin API Error:', networkError);
      
      consoleSpy.mockRestore();
    });

    test('logs requests to console', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      const mockResponse = { ok: true, status: 200 };
      fetch.mockResolvedValue(mockResponse);

      await adminApi.request('/test', { method: 'POST' });

      expect(consoleSpy).toHaveBeenCalledWith('Admin API Request:', 'http://localhost:5012/api/test', 'POST');
      
      consoleSpy.mockRestore();
    });
  });

  describe('HTTP methods', () => {
    beforeEach(() => {
      adminApi.setAdminKey('test-key');
    });

    test('GET method with query parameters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ data: 'test' })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.get('/test', { page: 1, limit: 10 });

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/test?page=1&limit=10',
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );
      expect(result).toEqual({ data: 'test' });
    });

    test('POST method with data', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '123' })
      };
      fetch.mockResolvedValue(mockResponse);

      const testData = { name: 'Test Question' };
      const result = await adminApi.post('/test', testData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/test',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(testData),
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-key'
          })
        })
      );
      expect(result).toEqual({ id: '123' });
    });

    test('PUT method with data', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ updated: true })
      };
      fetch.mockResolvedValue(mockResponse);

      const testData = { name: 'Updated Question' };
      const result = await adminApi.put('/test', testData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/test',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(testData)
        })
      );
      expect(result).toEqual({ updated: true });
    });

    test('DELETE method', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ deleted: true })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.delete('/test');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/test',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(result).toEqual({ deleted: true });
    });

    test('handles HTTP errors in GET', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found'
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(adminApi.get('/test')).rejects.toThrow('HTTP 404: Not Found');
    });

    test('handles HTTP errors in POST', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        statusText: 'Bad Request'
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(adminApi.post('/test', {})).rejects.toThrow('HTTP 400: Bad Request');
    });

    test('handles HTTP errors in PUT', async () => {
      const mockResponse = {
        ok: false,
        status: 500,
        statusText: 'Internal Server Error'
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(adminApi.put('/test', {})).rejects.toThrow('HTTP 500: Internal Server Error');
    });

    test('handles HTTP errors in DELETE', async () => {
      const mockResponse = {
        ok: false,
        status: 403,
        statusText: 'Forbidden'
      };
      fetch.mockResolvedValue(mockResponse);

      await expect(adminApi.delete('/test')).rejects.toThrow('HTTP 403: Forbidden');
    });
  });

  describe('admin-specific API methods', () => {
    beforeEach(() => {
      adminApi.setAdminKey('test-key');
    });

    test('getStats calls correct endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ totalPlayers: 100 })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.getStats();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/stats',
        expect.any(Object)
      );
      expect(result).toEqual({ totalPlayers: 100 });
    });

    test('getVisitorStats with period parameter', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ visitors: [] })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.getVisitorStats('month');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/stats/visitors?period=month',
        expect.any(Object)
      );
      expect(result).toEqual({ visitors: [] });
    });

    test('getSessions with pagination', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ sessions: [] })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.getSessions(2, 10);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/sessions?page=2&limit=10',
        expect.any(Object)
      );
      expect(result).toEqual({ sessions: [] });
    });

    test('getQuestions calls correct endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ questions: [] })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.getQuestions();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/questions',
        expect.any(Object)
      );
      expect(result).toEqual({ questions: [] });
    });

    test('createQuestion with data', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ id: '123' })
      };
      fetch.mockResolvedValue(mockResponse);

      const questionData = { section: 'Test', questionText: 'Test question?' };
      const result = await adminApi.createQuestion(questionData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/questions',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(questionData)
        })
      );
      expect(result).toEqual({ id: '123' });
    });

    test('updateQuestion with ID and data', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ updated: true })
      };
      fetch.mockResolvedValue(mockResponse);

      const questionData = { section: 'Updated', questionText: 'Updated question?' };
      const result = await adminApi.updateQuestion('123', questionData);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/questions/123',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify(questionData)
        })
      );
      expect(result).toEqual({ updated: true });
    });

    test('deleteQuestion with ID', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ deleted: true })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.deleteQuestion('123');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/questions/123',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(result).toEqual({ deleted: true });
    });

    test('getSections calls correct endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ sections: {} })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.getSections();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/sections',
        expect.any(Object)
      );
      expect(result).toEqual({ sections: {} });
    });

    test('createSection with name', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ created: true })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.createSection('New Section');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/sections',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ name: 'New Section' })
        })
      );
      expect(result).toEqual({ created: true });
    });

    test('renameSection with old and new names', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ renamed: true })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.renameSection('Old Name', 'New Name');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/sections/Old%20Name',
        expect.objectContaining({
          method: 'PUT',
          body: JSON.stringify({ newName: 'New Name' })
        })
      );
      expect(result).toEqual({ renamed: true });
    });

    test('deleteSection with name', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ deleted: true })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.deleteSection('Section Name');

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/sections/Section%20Name',
        expect.objectContaining({
          method: 'DELETE'
        })
      );
      expect(result).toEqual({ deleted: true });
    });

    test('bulkCreateQuestions with array', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ created: 5 })
      };
      fetch.mockResolvedValue(mockResponse);

      const questions = [
        { section: 'Test', questionText: 'Question 1?' },
        { section: 'Test', questionText: 'Question 2?' }
      ];
      const result = await adminApi.bulkCreateQuestions(questions);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/questions/bulk',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ questions })
        })
      );
      expect(result).toEqual({ created: 5 });
    });

    test('getFilteredAnalytics with filters', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ analytics: [] })
      };
      fetch.mockResolvedValue(mockResponse);

      const filters = { startDate: '2024-01-01', endDate: '2024-12-31' };
      const result = await adminApi.getFilteredAnalytics(filters);

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/analytics/filtered',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(filters)
        })
      );
      expect(result).toEqual({ analytics: [] });
    });

    test('getGeographicAnalytics calls correct endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ countries: [] })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.getGeographicAnalytics();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/analytics/geographic',
        expect.any(Object)
      );
      expect(result).toEqual({ countries: [] });
    });

    test('getPerformanceMetrics calls correct endpoint', async () => {
      const mockResponse = {
        ok: true,
        json: vi.fn().mockResolvedValue({ metrics: {} })
      };
      fetch.mockResolvedValue(mockResponse);

      const result = await adminApi.getPerformanceMetrics();

      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:5012/api/admin/performance',
        expect.any(Object)
      );
      expect(result).toEqual({ metrics: {} });
    });
  });

  describe('error handling', () => {
    test('logs errors to console', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const error = new Error('Test error');
      fetch.mockRejectedValue(error);

      await expect(adminApi.request('/test')).rejects.toThrow('Test error');
      expect(consoleSpy).toHaveBeenCalledWith('Admin API Error:', error);
      
      consoleSpy.mockRestore();
    });
  });
});
