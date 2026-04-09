const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiService {
  constructor() {
    this.token = localStorage.getItem('token');
  }

  setToken(token) {
    this.token = token;
    localStorage.setItem('token', token);
  }

  clearToken() {
    this.token = null;
    localStorage.removeItem('token');
  }

  getHeaders() {
    const headers = {
      'Content-Type': 'application/json'
    };
    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }
    return headers;
  }

  async request(endpoint, options = {}) {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers
      }
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth
  async register(username, email, password) {
    const data = await this.request('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, email, password })
    });
    this.setToken(data.token);
    return data;
  }

  async login(email, password) {
    const data = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  // Users
  async getCurrentUser() {
    return this.request('/users/me');
  }

  async searchUsers(query) {
    return this.request(`/users/search?q=${encodeURIComponent(query)}`);
  }

  async getAllUsers() {
    return this.request('/users');
  }

  // Conversations
  async getConversations() {
    return this.request('/conversations');
  }

  async createDirectConversation(userId) {
    return this.request('/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
  }

  async createGroupConversation(name, participantIds) {
    return this.request('/conversations/group', {
      method: 'POST',
      body: JSON.stringify({ name, participantIds })
    });
  }

  async getMessages(conversationId, limit = 50, offset = 0) {
    return this.request(`/conversations/${conversationId}/messages?limit=${limit}&offset=${offset}`);
  }

  async deleteConversation(conversationId) {
    return this.request(`/conversations/${conversationId}`, {
      method: 'DELETE'
    });
  }

  // AI
  async getAiModels() {
    return this.request('/ai/models');
  }

  async chatWithAI(message, model = 'llama3.2') {
    return this.request('/ai/chat', {
      method: 'POST',
      body: JSON.stringify({ message, model })
    });
  }
}

export const api = new ApiService();
