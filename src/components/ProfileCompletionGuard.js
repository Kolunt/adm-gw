import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthService';

const ProfileCompletionGuard = ({ children }) => {
  const { user, profileStatus, loading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Если загружается, показываем загрузку
  if (loading) {
    return <div>Загрузка...</div>;
  }

  // Если пользователь не авторизован, показываем контент
  if (!user) {
    return children;
  }

  // Если это админ, показываем контент
  if (user.role === 'admin') {
    return children;
  }

  // Если нет данных о статусе профиля, показываем загрузку
  if (!profileStatus) {
    return <div>Загрузка...</div>;
  }

  // Если профиль заполнен, показываем контент
  if (profileStatus.profile_completed) {
    return children;
  }

  // Если профиль не заполнен и мы не на странице заполнения профиля
  if (!profileStatus.profile_completed && location.pathname !== '/profile-completion') {
    navigate('/profile-completion', { replace: true });
    return <div>Перенаправление...</div>;
  }

  // Если профиль не заполнен и мы на странице заполнения профиля, показываем контент
  return children;
};

export default ProfileCompletionGuard;