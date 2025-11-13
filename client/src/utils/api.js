// API configuration
// In production (same server), use relative URLs. In development, use localhost
const isProduction = import.meta.env.PROD;
export const API_URL = import.meta.env.VITE_API_URL || (isProduction ? '' : 'http://localhost:3001');

export const getApiUrl = (endpoint) => {
  // If API_URL is empty (production), use relative path
  // Otherwise use the full URL
  return API_URL ? `${API_URL}${endpoint}` : endpoint;
};
