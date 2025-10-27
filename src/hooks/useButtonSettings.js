import { useState, useEffect } from 'react';
import axios from 'axios';

const useButtonSettings = () => {
  const [buttonSettings, setButtonSettings] = useState({
    button_preregistration: 'Хочу!',
    button_registration: 'Регистрация',
    button_confirm_participation: 'Подтвердить участие',
    button_soon: 'Уже скоро :)',
    button_participating: 'Вы участвуете в мероприятии'
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchButtonSettings = async () => {
      try {
        const response = await axios.get('/api/settings/public');
        const settings = response.data;
        
        setButtonSettings({
          button_preregistration: settings.button_preregistration || 'Хочу!',
          button_registration: settings.button_registration || 'Регистрация',
          button_confirm_participation: settings.button_confirm_participation || 'Подтвердить участие',
          button_soon: settings.button_soon || 'Уже скоро :)',
          button_participating: settings.button_participating || 'Вы участвуете в мероприятии'
        });
      } catch (error) {
        console.error('Error fetching button settings:', error);
        // Используем значения по умолчанию при ошибке
      } finally {
        setLoading(false);
      }
    };

    fetchButtonSettings();
  }, []);

  return { buttonSettings, loading };
};

export default useButtonSettings;
