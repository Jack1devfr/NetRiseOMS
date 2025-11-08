// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export const getApiUrl = (endpoint) => {
  return `${API_URL}${endpoint}`;
};

