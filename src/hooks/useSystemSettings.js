import { useState, useEffect } from 'react';
import axios from 'axios';

/**
 * Хук для получения настроек системы
 * @returns {Object} - Объект с настройками и состоянием загрузки
 */
export const useSystemSettings = () => {
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await axios.get('/api/settings/public');
        const settingsData = {};
        response.data.forEach(setting => {
          settingsData[setting.key] = setting.value;
        });
        setSettings(settingsData);
      } catch (error) {
        console.error('Error fetching settings:', error);
        setError(error);
        // Устанавливаем значения по умолчанию
        setSettings({
          welcome_title: '🎅 Анонимный Дед Мороз',
          welcome_subtitle: 'Добро пожаловать в систему обмена подарками!',
          site_title: 'Анонимный Дед Мороз',
          site_description: 'Система организации анонимного обмена подарками'
        });
      } finally {
        setLoading(false);
      }
    };

    fetchSettings();
  }, []);

  return { settings, loading, error };
};
