/**
 * Admin API Service
 * Handles authenticated requests to admin endpoints using headers
 */

class AdminApiService {
    constructor() {
        this.baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5012/api';
        this.adminKey = null;
    }

    /**
     * Set the admin key for authentication
     * @param {string} key - The admin authentication key
     */
    setAdminKey(key) {
        this.adminKey = key;
        // Store in localStorage for persistence
        if (key) {
            localStorage.setItem('admin_key', key);
        } else {
            localStorage.removeItem('admin_key');
        }
    }

    /**
     * Get the admin key from localStorage
     * @returns {string|null} The admin key or null if not set
     */
    getAdminKey() {
        if (!this.adminKey) {
            this.adminKey = localStorage.getItem('admin_key');
        }
        return this.adminKey;
    }

    /**
     * Get authentication headers
     * @returns {Object} Headers object with admin authentication
     */
    getAuthHeaders() {
        const key = this.getAdminKey();
        if (!key) {
            return {};
        }

        return {
            'Authorization': `Bearer ${key}`,
            'X-Admin-Key': key, // Fallback header
            'Content-Type': 'application/json'
        };
    }

    /**
     * Make an authenticated request to admin endpoints
     * @param {string} endpoint - The API endpoint
     * @param {Object} options - Fetch options
     * @returns {Promise<Response>} The fetch response
     */
    async request(endpoint, options = {}) {
        const url = `${this.baseUrl}${endpoint}`;
        
        const defaultOptions = {
            headers: this.getAuthHeaders(),
            ...options
        };

        // Merge headers if provided
        if (options.headers) {
            defaultOptions.headers = {
                ...defaultOptions.headers,
                ...options.headers
            };
        }

        console.log('Admin API Request:', url, defaultOptions.method || 'GET');
        
        try {
            const response = await fetch(url, defaultOptions);
            
            if (response.status === 401) {
                // Clear invalid admin key
                this.setAdminKey(null);
                throw new Error('Authentication failed. Please check your admin key.');
            }
            
            return response;
        } catch (error) {
            console.error('Admin API Error:', error);
            throw error;
        }
    }

    /**
     * GET request to admin endpoint
     * @param {string} endpoint - The API endpoint
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} The response data
     */
    async get(endpoint, params = {}) {
        const queryString = new URLSearchParams(params).toString();
        const url = queryString ? `${endpoint}?${queryString}` : endpoint;
        
        const response = await this.request(url);
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }

    /**
     * POST request to admin endpoint
     * @param {string} endpoint - The API endpoint
     * @param {Object} data - The request body data
     * @returns {Promise<Object>} The response data
     */
    async post(endpoint, data = {}) {
        const response = await this.request(endpoint, {
            method: 'POST',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }

    /**
     * PUT request to admin endpoint
     * @param {string} endpoint - The API endpoint
     * @param {Object} data - The request body data
     * @returns {Promise<Object>} The response data
     */
    async put(endpoint, data = {}) {
        const response = await this.request(endpoint, {
            method: 'PUT',
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }

    /**
     * DELETE request to admin endpoint
     * @param {string} endpoint - The API endpoint
     * @returns {Promise<Object>} The response data
     */
    async delete(endpoint) {
        const response = await this.request(endpoint, {
            method: 'DELETE'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return response.json();
    }

    // Admin-specific API methods

    /**
     * Get dashboard statistics
     * @returns {Promise<Object>} Dashboard stats
     */
    async getStats() {
        return this.get('/admin/stats');
    }

    /**
     * Get visitor statistics
     * @param {string} period - Time period (day, month, 3month, 6month, year, 5year)
     * @returns {Promise<Array>} Visitor stats data
     */
    async getVisitorStats(period = 'day') {
        return this.get('/admin/stats/visitors', { period });
    }

    /**
     * Get sessions with pagination
     * @param {number} page - Page number
     * @param {number} limit - Items per page
     * @returns {Promise<Object>} Sessions data
     */
    async getSessions(page = 1, limit = 20) {
        return this.get('/admin/sessions', { page, limit });
    }

    /**
     * Get all questions grouped by section
     * @returns {Promise<Object>} Questions data
     */
    async getQuestions() {
        return this.get('/admin/questions');
    }

    /**
     * Create a new question
     * @param {Object} question - Question data
     * @returns {Promise<Object>} Created question
     */
    async createQuestion(question) {
        return this.post('/admin/questions', question);
    }

    /**
     * Update a question
     * @param {string} id - Question ID
     * @param {Object} question - Updated question data
     * @returns {Promise<Object>} Updated question
     */
    async updateQuestion(id, question) {
        return this.put(`/admin/questions/${id}`, question);
    }

    /**
     * Delete a question
     * @param {string} id - Question ID
     * @returns {Promise<Object>} Deletion result
     */
    async deleteQuestion(id) {
        return this.delete(`/admin/questions/${id}`);
    }

    /**
     * Get all sections
     * @returns {Promise<Object>} Sections data
     */
    async getSections() {
        return this.get('/admin/sections');
    }

    /**
     * Create a new section
     * @param {string} name - Section name
     * @returns {Promise<Object>} Creation result
     */
    async createSection(name) {
        return this.post('/admin/sections', { name });
    }

    /**
     * Rename a section
     * @param {string} oldName - Current section name
     * @param {string} newName - New section name
     * @returns {Promise<Object>} Update result
     */
    async renameSection(oldName, newName) {
        return this.put(`/admin/sections/${encodeURIComponent(oldName)}`, { newName });
    }

    /**
     * Delete a section
     * @param {string} name - Section name
     * @returns {Promise<Object>} Deletion result
     */
    async deleteSection(name) {
        return this.delete(`/admin/sections/${encodeURIComponent(name)}`);
    }

    /**
     * Bulk create questions
     * @param {Array} questions - Array of question objects
     * @returns {Promise<Object>} Bulk creation result
     */
    async bulkCreateQuestions(questions) {
        return this.post('/admin/questions/bulk', { questions });
    }


    /**
     * Get filtered analytics
     * @param {Object} filters - Filter parameters
     * @returns {Promise<Object>} Filtered analytics data
     */
    async getFilteredAnalytics(filters = {}) {
        return this.post('/admin/analytics/filtered', filters);
    }

    /**
     * Get geographic analytics
     * @returns {Promise<Object>} Geographic data
     */
    async getGeographicAnalytics() {
        return this.get('/admin/analytics/geographic');
    }

    /**
     * Get performance metrics
     * @returns {Promise<Object>} Performance data
     */
    async getPerformanceMetrics() {
        return this.get('/admin/performance');
    }
}

// Create and export a singleton instance
export const adminApi = new AdminApiService();
