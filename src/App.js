import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import './App.css';

import AppContent from './components/AppContent';
import FaviconUpdater from './components/FaviconUpdater';

// Configure axios base URL
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8004';

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

// Добавляем интерцептор для автоматического переподключения
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Подавляем 404 ошибки для site-icon - это нормально, если иконка не установлена
    if (error.config?.url === '/api/site-icon' && error.response?.status === 404) {
      return Promise.reject(error); // Возвращаем ошибку, но не логируем её
    }
    
    // Подавляем 401 ошибки для /auth/me - это нормально, если пользователь не авторизован
    if (error.config?.url === '/auth/me' && error.response?.status === 401) {
      return Promise.reject(error); // Возвращаем ошибку, но не логируем её
    }
    
    // Подавляем 404 ошибки для /events/*/user-registration - это нормально, если пользователь не зарегистрирован
    if (error.config?.url?.includes('/user-registration') && error.response?.status === 404) {
      return Promise.reject(error); // Возвращаем ошибку, но не логируем её
    }
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend недоступен. Убедитесь, что backend запущен на порту 8004');
      console.warn('Запустите: start_backend_radical.bat');
    }
    return Promise.reject(error);
  }
);

function App() {
  // Проверяем доступность backend при запуске
  useEffect(() => {
    const checkBackend = async () => {
      try {
        await axios.get('/docs');
        console.log('✅ Backend подключен на порту 8004');
      } catch (error) {
        console.error('❌ Backend недоступен на порту 8004');
        console.error('Запустите backend: start_backend_radical.bat');
      }
    };
    
    checkBackend();
  }, []);

  return (
    <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
      <div className="santa-container">
        <FaviconUpdater />
        <AppContent />
      </div>
    </Router>
  );
}

export default App;