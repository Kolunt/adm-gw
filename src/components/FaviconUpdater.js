import React, { useEffect } from 'react';
import axios from 'axios';

const FaviconUpdater = () => {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        // Получаем текущую иконку сайта с полным подавлением ошибок
        const response = await axios.get('/api/site-icon', {
          validateStatus: function (status) {
            return status < 500; // Разрешаем 404, но не 500+ ошибки
          },
          // Полностью подавляем логирование ошибок
          transformResponse: [(data) => data],
          // Отключаем автоматические ошибки
          timeout: 5000
        });
        
        if (response.status === 200) {
          // Создаем или обновляем favicon
          const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
          favicon.rel = 'icon';
          favicon.href = '/api/site-icon';
          favicon.type = response.headers['content-type'] || 'image/x-icon';
          
          if (!document.querySelector('link[rel="icon"]')) {
            document.head.appendChild(favicon);
          }
        }
        // Для 404 статуса ничего не делаем - это нормально
      } catch (error) {
        // Полностью игнорируем все ошибки для этого endpoint
        // Это нормально, если иконка не установлена
      }
    };

    // Обновляем favicon при загрузке компонента
    updateFavicon();
  }, []);

  return null; // Компонент не рендерит ничего видимого
};

export default FaviconUpdater;
