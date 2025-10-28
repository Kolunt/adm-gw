import axios from 'axios';

// Настройка baseURL для всех запросов
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8006';

// Добавляем интерцептор для автоматического добавления токена авторизации
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Добавляем интерцептор для обработки ошибок
axios.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response?.status === 401) {
      // Токен истек или недействителен
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      // Перенаправляем на страницу входа только если мы не на странице логина
      // и это не запрос к /auth/me (чтобы избежать бесконечных редиректов)
      if (window.location.pathname !== '/login' && 
          !error.config?.url?.includes('/auth/me')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
