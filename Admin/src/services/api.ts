import axios from 'axios';

const fallback = import.meta.env.PROD ? 'https://api.shikii.dev' : 'http://localhost:3000';
const baseURL = (import.meta.env.VITE_API_URL ?? fallback) + '/api/v1';

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  (error) => Promise.reject(error),
);

export default api;
