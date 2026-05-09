import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "fallback url if the env return undefined",
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Add a request interceptor to include the token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized access, e.g., redirect to login or clear storage
      localStorage.removeItem('token');
      // window.location.href = '/login'; // Optional: force redirect
    }
    return Promise.reject(error);
  }
);

export default api;
