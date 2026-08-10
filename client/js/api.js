/**
 * TaskFlow Pro API Service
 * Handles communication with the Express + MongoDB backend REST API
 */
const API_BASE_URL = 'http://localhost:5000/api/todos';

const TodoAPI = {
  /**
   * Fetch all todos with optional query filters
   */
  async getTodos(filters = {}) {
    try {
      const params = new URLSearchParams();
      if (filters.status) params.append('status', filters.status);
      if (filters.priority && filters.priority !== 'all') params.append('priority', filters.priority);
      if (filters.category && filters.category !== 'all') params.append('category', filters.category);
      if (filters.search) params.append('search', filters.search);
      if (filters.sortBy) params.append('sortBy', filters.sortBy);

      const queryString = params.toString() ? `?${params.toString()}` : '';
      const response = await fetch(`${API_BASE_URL}${queryString}`);
      
      if (!response.ok) {
        throw new Error(`Error ${response.status}: Failed to fetch tasks`);
      }
      return await response.json();
    } catch (error) {
      console.error('[API Error - getTodos]:', error);
      throw error;
    }
  },

  /**
   * Fetch dashboard stats
   */
  async getStats() {
    try {
      const response = await fetch(`${API_BASE_URL}/stats`);
      if (!response.ok) throw new Error('Failed to fetch statistics');
      return await response.json();
    } catch (error) {
      console.error('[API Error - getStats]:', error);
      throw error;
    }
  },

  /**
   * Create a new todo
   */
  async createTodo(todoData) {
    try {
      const response = await fetch(API_BASE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to create task');
      }
      return await response.json();
    } catch (error) {
      console.error('[API Error - createTodo]:', error);
      throw error;
    }
  },

  /**
   * Update an existing todo
   */
  async updateTodo(id, todoData) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todoData)
      });
      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.message || 'Failed to update task');
      }
      return await response.json();
    } catch (error) {
      console.error('[API Error - updateTodo]:', error);
      throw error;
    }
  },

  /**
   * Toggle completion status
   */
  async toggleTodo(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}/toggle`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) throw new Error('Failed to toggle completion status');
      return await response.json();
    } catch (error) {
      console.error('[API Error - toggleTodo]:', error);
      throw error;
    }
  },

  /**
   * Delete a todo item
   */
  async deleteTodo(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: 'DELETE'
      });
      if (!response.ok) throw new Error('Failed to delete task');
      return await response.json();
    } catch (error) {
      console.error('[API Error - deleteTodo]:', error);
      throw error;
    }
  }
};
