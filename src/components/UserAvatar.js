import React from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';
import { getUserAvatar } from '../utils/avatarUtils';

const UserAvatar = ({ user, size = 64, style, showTooltip = false }) => {
  const avatarProps = {
    size,
    src: getUserAvatar(user, size),
    icon: <UserOutlined />,
    style,
  };

  if (showTooltip) {
    avatarProps.title = user?.name || user?.email || 'Пользователь';
  }

  return <Avatar {...avatarProps} />;
};

export default UserAvatar;
