import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

export const useColorSettings = () => {
  const [colors, setColors] = useState({
    primary_color: '#1890ff',
    primary_hover_color: '#40a9ff',
    success_color: '#52c41a',
    warning_color: '#faad14',
    error_color: '#ff4d4f',
    link_color: '#1890ff'
  });

  useEffect(() => {
    fetchColorSettings();
  }, []);

  const fetchColorSettings = async () => {
    try {
      const response = await axios.get('/api/settings/public');
      const settings = response.data;
      
      const colorSettings = {
        primary_color: settings.primary_color || '#1890ff',
        primary_hover_color: settings.primary_hover_color || '#40a9ff',
        success_color: settings.success_color || '#52c41a',
        warning_color: settings.warning_color || '#faad14',
        error_color: settings.error_color || '#ff4d4f',
        link_color: settings.link_color || '#1890ff'
      };
      
      setColors(colorSettings);
      applyColorsToCSS(colorSettings);
    } catch (error) {
      console.error('Error fetching color settings:', error);
      // Применяем дефолтные цвета при ошибке
      applyColorsToCSS(colors);
    }
  };

  const applyColorsToCSS = (colorSettings) => {
    const root = document.documentElement;
    
    // Обновляем CSS переменные
    root.style.setProperty('--primary-color', colorSettings.primary_color);
    root.style.setProperty('--primary-hover-color', colorSettings.primary_hover_color);
    root.style.setProperty('--success-color', colorSettings.success_color);
    root.style.setProperty('--warning-color', colorSettings.warning_color);
    root.style.setProperty('--error-color', colorSettings.error_color);
    root.style.setProperty('--link-color', colorSettings.link_color);
    
    // Обновляем переменные для темной темы
    root.style.setProperty('--dark-primary-color', colorSettings.primary_color);
    root.style.setProperty('--dark-primary-hover-color', colorSettings.primary_hover_color);
    root.style.setProperty('--dark-success-color', colorSettings.success_color);
    root.style.setProperty('--dark-warning-color', colorSettings.warning_color);
    root.style.setProperty('--dark-error-color', colorSettings.error_color);
    root.style.setProperty('--dark-link-color', colorSettings.link_color);
    
    // Обновляем переменные для светлой темы
    root.style.setProperty('--light-primary-color', colorSettings.primary_color);
    root.style.setProperty('--light-primary-hover-color', colorSettings.primary_hover_color);
    root.style.setProperty('--light-success-color', colorSettings.success_color);
    root.style.setProperty('--light-warning-color', colorSettings.warning_color);
    root.style.setProperty('--light-error-color', colorSettings.error_color);
    root.style.setProperty('--light-link-color', colorSettings.link_color);
  };

  const updateColors = (newColors) => {
    setColors(newColors);
    applyColorsToCSS(newColors);
  };

  return {
    colors,
    updateColors,
    fetchColorSettings
  };
};
