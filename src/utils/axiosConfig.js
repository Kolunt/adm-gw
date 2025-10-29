import axios from 'axios';

// Настройка baseURL для всех запросов
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8006';

// Настройка таймаута для всех запросов
axios.defaults.timeout = 5000; // 5 секунд

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
    // Для публичных endpoint (например /users/) не перенаправляем на логин
    const publicEndpoints = ['/users/', '/faq', '/about', '/contacts'];
    const isPublicEndpoint = publicEndpoints.some(endpoint => error.config?.url?.includes(endpoint));
    
    if (error.response?.status === 401 && !isPublicEndpoint) {
      // Токен истек или недействителен
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
      // Перенаправляем на страницу входа только если:
      // 1. Мы не на странице логина
      // 2. Это не запрос к /auth/me (чтобы избежать бесконечных редиректов)
      // 3. Это не запрос к /profile/status
      const isAuthMeRequest = error.config?.url?.includes('/auth/me');
      const isProfileStatusRequest = error.config?.url?.includes('/profile/status');
      const isLoginPage = window.location.pathname === '/login';
      
      if (!isLoginPage && !isAuthMeRequest && !isProfileStatusRequest) {
        // Не используем window.location.href для избежания перезагрузки страницы
        // Просто удаляем токен и позволяем компонентам обработать отсутствие авторизации
        console.log('Axios: 401 error, token removed, letting app handle navigation');
      }
    }
    return Promise.reject(error);
  }
);

export default axios;
