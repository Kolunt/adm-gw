import { useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

export const useColorSettings = () => {
  const [colors, setColors] = useState({
    primary_color: '#2d5016',
    primary_hover_color: '#3d6b1a',
    success_color: '#52c41a',
    warning_color: '#faad14',
    error_color: '#ff4d4f',
    link_color: '#2d5016',
    // Настройки кнопок
    button_primary_color: '#2d5016',
    button_primary_hover_color: '#3d6b1a',
    button_default_color: '#434343',
    button_default_hover_color: '#595959',
    button_dashed_color: '#434343',
    button_dashed_hover_color: '#595959',
    button_text_color: '#2d5016',
    button_text_hover_color: '#3d6b1a',
    button_link_color: '#2d5016',
    button_link_hover_color: '#3d6b1a'
  });

  useEffect(() => {
    fetchColorSettings();
  }, []);

  const fetchColorSettings = async () => {
    try {
      const response = await axios.get('/api/settings/public');
      const settings = response.data;
      
      const colorSettings = {
        primary_color: settings.primary_color || '#2d5016',
        primary_hover_color: settings.primary_hover_color || '#3d6b1a',
        success_color: settings.success_color || '#52c41a',
        warning_color: settings.warning_color || '#faad14',
        error_color: settings.error_color || '#ff4d4f',
        link_color: settings.link_color || '#2d5016',
        // Настройки кнопок
        button_primary_color: settings.button_primary_color || '#2d5016',
        button_primary_hover_color: settings.button_primary_hover_color || '#3d6b1a',
        button_default_color: settings.button_default_color || '#434343',
        button_default_hover_color: settings.button_default_hover_color || '#595959',
        button_dashed_color: settings.button_dashed_color || '#434343',
        button_dashed_hover_color: settings.button_dashed_hover_color || '#595959',
        button_text_color: settings.button_text_color || '#2d5016',
        button_text_hover_color: settings.button_text_hover_color || '#3d6b1a',
        button_link_color: settings.button_link_color || '#2d5016',
        button_link_hover_color: settings.button_link_hover_color || '#3d6b1a'
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
    
    // Настройки кнопок
    root.style.setProperty('--button-primary-color', colorSettings.button_primary_color);
    root.style.setProperty('--button-primary-hover-color', colorSettings.button_primary_hover_color);
    root.style.setProperty('--button-default-color', colorSettings.button_default_color);
    root.style.setProperty('--button-default-hover-color', colorSettings.button_default_hover_color);
    root.style.setProperty('--button-dashed-color', colorSettings.button_dashed_color);
    root.style.setProperty('--button-dashed-hover-color', colorSettings.button_dashed_hover_color);
    root.style.setProperty('--button-text-color', colorSettings.button_text_color);
    root.style.setProperty('--button-text-hover-color', colorSettings.button_text_hover_color);
    root.style.setProperty('--button-link-color', colorSettings.button_link_color);
    root.style.setProperty('--button-link-hover-color', colorSettings.button_link_hover_color);
    
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
