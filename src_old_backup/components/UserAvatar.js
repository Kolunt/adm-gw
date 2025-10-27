import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getUserAvatar } from '../utils/avatarUtils';

/**
 * Компонент для отображения аватарки пользователя
 * @param {Object} props - Свойства компонента
 * @param {Object} props.user - Объект пользователя
 * @param {number} props.size - Размер аватарки (по умолчанию 64)
 * @param {string} props.shape - Форма аватарки ('circle' | 'square', по умолчанию 'circle')
 * @param {string} props.className - CSS класс
 * @param {Object} props.style - Стили
 * @param {boolean} props.showTooltip - Показывать ли подсказку с именем пользователя
 * @returns {JSX.Element} - Компонент аватарки
 */
const UserAvatar = ({ 
  user, 
  size = 64, 
  shape = 'circle', 
  className = '', 
  style = {},
  showTooltip = false,
  ...props 
}) => {
  const avatarSrc = getUserAvatar(user, size);
  const userName = user?.name || user?.username || 'Пользователь';

  const avatarProps = {
    size,
    shape,
    className: `user-avatar ${className}`,
    style: {
      backgroundColor: '#f0f0f0',
      ...style
    },
    src: avatarSrc,
    icon: <UserOutlined />,
    alt: userName,
    ...props
  };

  if (showTooltip) {
    return (
      <Avatar 
        {...avatarProps}
        title={userName}
      />
    );
  }

  return <Avatar {...avatarProps} />;
};

export default UserAvatar;
