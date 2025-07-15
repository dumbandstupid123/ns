export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://ns-deploy-production.up.railway.app'
  : 'http://localhost:5001';

export const API_ENDPOINTS = {
  ADD_CLIENT: `${API_BASE_URL}/api/add-client`,
  RECENT_CLIENTS: `${API_BASE_URL}/api/recent-clients`,
  DELETE_CLIENT: (clientId) => `${API_BASE_URL}/api/clients/${clientId}`,
  GET_TOKEN: `${API_BASE_URL}/api/get`,
  GET_RESOURCES: `${API_BASE_URL}/api/resources`,
  SEND_REFERRAL: `${API_BASE_URL}/api/send-referral`,
  UPDATE_RESOURCE: (name) => `${API_BASE_URL}/api/resources/${encodeURIComponent(name)}`
}; 