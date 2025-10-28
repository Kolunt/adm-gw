import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../services/AuthService';

const ProtectedRoute = ({ children, requireAdmin = false, requireProfileComplete = false }) => {
  const { user, profileStatus, loading } = useAuth();

  if (loading) {
    return <div>Загрузка...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireAdmin && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Для обычных пользователей с незавершенным профилем принудительно перенаправляем на заполнение профиля
  // Но только если это не страницы, которые должны быть доступны всем
  if (user.role !== 'admin' && !profileStatus?.profile_completed) {
    return <Navigate to="/profile-completion" replace />;
  }

  return children;
};

export default ProtectedRoute;
