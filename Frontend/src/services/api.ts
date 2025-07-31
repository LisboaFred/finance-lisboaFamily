import axios, { type InternalAxiosRequestConfig } from 'axios';

const api = axios.create({
   baseURL: import.meta.env.VITE_API_URL || '/api'
});

api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('token');
    config.headers = config.headers ?? {};

    if (token) {
      // Só adiciona o header se existir token
      (config.headers as Record<string, string>).Authorization = `Bearer ${token}`;
    } else {
      // Remove o header Authorization se não houver token
      delete (config.headers as Record<string, string>).Authorization;
    }

    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
