import { Platform } from 'react-native';

// Backend API Base URL Configuration:
// - iOS Simulator: http://localhost:5001/api
// - Android Emulator: http://10.0.2.2:5001/api
// - Physical device via Expo Go: Replace with your machine's LAN IP,
//   for example: 'http://10.7.21.130:5001/api'
export const API_BASE_URL = Platform.select({
  android: 'http://10.0.2.2:5001/api',
  ios: 'http://localhost:5001/api',
  default: 'http://localhost:5001/api',
});

// Active in-memory JWT authentication token
let currentAuthToken = null;

export function setAuthToken(token) {
  currentAuthToken = token;
}

// Helper for checking and parsing JSON fetch responses
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

// Helper to construct headers with optional JWT
function getHeaders(extraHeaders = {}) {
  const headers = {
    'Content-Type': 'application/json',
    ...extraHeaders,
  };
  if (currentAuthToken) {
    headers['Authorization'] = `Bearer ${currentAuthToken}`;
  }
  return headers;
}

export const api = {
  setAuthToken,

  // --- Authentication ---
  async login(credentials) {
    const res = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials),
    });
    return handleResponse(res);
  },

  async register(data) {
    const res = await fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getMe() {
    const res = await fetch(`${API_BASE_URL}/auth/me`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- Subjects ---
  async getSubjects() {
    const res = await fetch(`${API_BASE_URL}/subjects`);
    return handleResponse(res);
  },

  async getSubjectById(id) {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`);
    return handleResponse(res);
  },

  // --- Topics ---
  async getTopics(subjectId) {
    const res = await fetch(`${API_BASE_URL}/topics/${subjectId}`);
    return handleResponse(res);
  },

  // --- Resources ---
  async getResources(params = {}) {
    const query = new URLSearchParams();
    if (params.subjectId) query.append('subjectId', params.subjectId);
    if (params.topicId) query.append('topicId', params.topicId);
    if (params.type && params.type !== 'All') query.append('type', params.type);
    if (params.search && params.search.trim()) query.append('search', params.search.trim());

    const queryString = query.toString();
    const url = queryString ? `${API_BASE_URL}/resources?${queryString}` : `${API_BASE_URL}/resources`;
    const res = await fetch(url);
    return handleResponse(res);
  },

  async getResourceById(id) {
    const res = await fetch(`${API_BASE_URL}/resources/${id}`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getTopVideos(params = {}) {
    const query = new URLSearchParams();
    if (params.topicId) query.append('topicId', params.topicId);
    if (params.subjectId) query.append('subjectId', params.subjectId);
    const queryString = query.toString();
    const url = queryString ? `${API_BASE_URL}/resources/top-videos?${queryString}` : `${API_BASE_URL}/resources/top-videos`;
    const res = await fetch(url, { headers: getHeaders() });
    return handleResponse(res);
  },

  async rateResource(id, stars) {
    const res = await fetch(`${API_BASE_URL}/resources/${id}/rate`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ stars }),
    });
    return handleResponse(res);
  },

  async submitFeedback(id, comment) {
    const res = await fetch(`${API_BASE_URL}/resources/${id}/feedback`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify({ comment }),
    });
    return handleResponse(res);
  },

  // --- Submissions ---
  async submitResource(data) {
    const res = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getSubmissions(userId) {
    const url = userId ? `${API_BASE_URL}/submissions?userId=${userId}` : `${API_BASE_URL}/submissions`;
    const res = await fetch(url, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async getMySubmissions() {
    const res = await fetch(`${API_BASE_URL}/submissions/my`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  // --- Reviewer Workflow ---
  async getPendingSubmissions() {
    const res = await fetch(`${API_BASE_URL}/submissions/pending`, {
      headers: getHeaders(),
    });
    return handleResponse(res);
  },

  async approveSubmission(id, note) {
    const res = await fetch(`${API_BASE_URL}/submissions/${id}/approve`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ note }),
    });
    return handleResponse(res);
  },

  async rejectSubmission(id, note) {
    const res = await fetch(`${API_BASE_URL}/submissions/${id}/reject`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify({ note }),
    });
    return handleResponse(res);
  },
};

export default api;
