import React, { useEffect } from 'react';
import axios from 'axios';

const FaviconUpdater = () => {
  useEffect(() => {
    const updateFavicon = async () => {
      try {
        // Получаем текущую иконку сайта
        const response = await axios.get('/api/site-icon');
        
        if (response.status === 200) {
          // Создаем или обновляем favicon
          const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
          favicon.rel = 'icon';
          favicon.href = `/uploads/icons/${response.data.filename}`;
          favicon.type = response.data.mime_type;
          
          if (!document.querySelector('link[rel="icon"]')) {
            document.head.appendChild(favicon);
          }
        }
      } catch (error) {
        // Если иконка не найдена, ничего не делаем
        console.log('Иконка сайта не установлена');
      }
    };

    // Обновляем favicon при загрузке компонента
    updateFavicon();
  }, []);

  return null; // Компонент не рендерит ничего видимого
};

export default FaviconUpdater;
