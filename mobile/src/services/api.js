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

// Helper for checking and parsing JSON fetch responses
async function handleResponse(response) {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Request failed with status ${response.status}`);
  }
  return response.json();
}

export const api = {
  // Fetch list of all subjects
  async getSubjects() {
    const res = await fetch(`${API_BASE_URL}/subjects`);
    return handleResponse(res);
  },

  // Fetch subject details and its syllabus topics
  async getSubjectById(id) {
    const res = await fetch(`${API_BASE_URL}/subjects/${id}`);
    return handleResponse(res);
  },

  // Fetch topics for a given subject ID
  async getTopics(subjectId) {
    const res = await fetch(`${API_BASE_URL}/topics/${subjectId}`);
    return handleResponse(res);
  },

  // Fetch resources with optional filters (subjectId, topicId, type, search)
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

  // Fetch single resource details
  async getResourceById(id) {
    const res = await fetch(`${API_BASE_URL}/resources/${id}`);
    return handleResponse(res);
  },

  // Submit a new learning resource
  async submitResource(data) {
    const res = await fetch(`${API_BASE_URL}/submissions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  // Fetch student submissions
  async getSubmissions(userId) {
    const url = userId ? `${API_BASE_URL}/submissions?userId=${userId}` : `${API_BASE_URL}/submissions`;
    const res = await fetch(url);
    return handleResponse(res);
  },
};

export default api;
