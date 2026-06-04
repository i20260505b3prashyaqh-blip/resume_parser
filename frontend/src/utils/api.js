import axios from 'axios';

const API_BASE = '/api'; // ✅ Uses Vite proxy instead of direct call

const api = axios.create({
  baseURL: API_BASE,
});

export const uploadResume = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/upload-resume', formData);
  // ❌ Don't manually set Content-Type for FormData — axios handles it
  return response.data;
};

export const uploadJD = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const response = await api.post('/extract-jd', formData);
  return response.data;
};

export const storeCandidate = async (candidateData) => {
  const response = await api.post('/store-candidate', candidateData);
  return response.data;
};

export const rankCandidates = async (rankingData) => {
  const response = await api.post('/rank-candidates', rankingData);
  return response.data;
};

export const recruiterSearch = async (query) => {
  const response = await api.post('/recruiter-search', { query });
  return response.data;
};

export const getCandidates = async () => {
  const response = await api.get('/candidates');
  return response.data;
};

export const getHealth = async () => {
  const response = await api.get('/health');
  return response.data;
};

export default api;