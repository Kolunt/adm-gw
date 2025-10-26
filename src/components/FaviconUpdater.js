import React, { useEffect } from 'react';

const FaviconUpdater = () => {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        // Используем fetch вместо axios для лучшего контроля ошибок
        const response = await fetch('/api/site-icon', {
          method: 'GET',
          // Не показываем ошибки в консоли для 404
          signal: AbortSignal.timeout(5000)
        });
        
        if (response.ok) {
          // Создаем или обновляем favicon
          const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
          favicon.rel = 'icon';
          favicon.href = '/api/site-icon';
          favicon.type = response.headers.get('content-type') || 'image/x-icon';
          
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
