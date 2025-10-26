import React, { useEffect } from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import axios from 'axios';
import './App.css';

import AppContent from './components/AppContent';
import FaviconUpdater from './components/FaviconUpdater';

// Configure axios base URL
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8006';

// Добавляем интерцептор для автоматического переподключения
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    // Подавляем 404 ошибки для site-icon - это нормально, если иконка не установлена
    if (error.config?.url === '/api/site-icon' && error.response?.status === 404) {
      return Promise.reject(error); // Возвращаем ошибку, но не логируем её
    }
    
    if (error.code === 'ERR_NETWORK' || error.code === 'ECONNREFUSED') {
      console.warn('Backend недоступен. Убедитесь, что backend запущен на порту 8006');
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
        console.log('✅ Backend подключен на порту 8006');
      } catch (error) {
        console.error('❌ Backend недоступен на порту 8006');
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