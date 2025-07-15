// Get the backend URL from environment variables or fallback
const getBackendURL = () => {
  // For Vercel deployment
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_BACKEND_URL || 
           process.env.VITE_BACKEND_URL || 
           'https://skyscraper-production.up.railway.app'; // Your Railway backend URL
  }
  // For local development
  return 'http://localhost:5001';
};

export const API_BASE_URL = getBackendURL();

export const API_ENDPOINTS = {
  ADD_CLIENT: `${API_BASE_URL}/api/add-client`,
  RECENT_CLIENTS: `${API_BASE_URL}/api/recent-clients`,
  DELETE_CLIENT: (clientId) => `${API_BASE_URL}/api/clients/${clientId}`,
  GET_TOKEN: `${API_BASE_URL}/api/get`,
  GET_RESOURCES: `${API_BASE_URL}/api/resources`,
  SEARCH_RESOURCES: `${API_BASE_URL}/api/search-resources`,
  MATCH_RESOURCES: `${API_BASE_URL}/api/match-resources`
}; 