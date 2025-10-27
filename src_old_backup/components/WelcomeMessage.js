import React from 'react';
import { Typography, Spin } from 'antd';
import { useSystemSettings } from '../hooks/useSystemSettings';

const { Title } = Typography;

/**
 * Компонент для отображения динамического приветственного сообщения
 * @returns {JSX.Element} - Компонент приветственного сообщения
 */
const WelcomeMessage = () => {
  const { settings, loading } = useSystemSettings();

  if (loading) {
    return (
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ textAlign: 'center', marginBottom: '30px' }}>
      <Title level={1} style={{ color: '#d63031', marginBottom: '10px' }}>
        {settings.welcome_title || '🎅 Анонимный Дед Мороз'}
      </Title>
      <Title level={3} style={{ color: '#666', fontWeight: 'normal' }}>
        {settings.welcome_subtitle || 'Добро пожаловать в систему обмена подарками!'}
      </Title>
    </div>
  );
};

export default WelcomeMessage;
