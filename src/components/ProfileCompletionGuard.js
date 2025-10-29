import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../services/AuthService';

const ProfileCompletionGuard = ({ children }) => {
  const { user, profileStatus } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  console.log('ProfileCompletionGuard: user=', user, 'profileStatus=', profileStatus);

  // Если пользователь не авторизован, показываем контент
  if (!user) {
    return children;
  }

  // Если это админ, показываем контент
  if (user.role === 'admin') {
    return children;
  }

  // Если нет данных о статусе профиля, показываем контент (не блокируем)
  if (!profileStatus) {
    return children;
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