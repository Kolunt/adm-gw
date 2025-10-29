import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from '../utils/axiosConfig';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(false); // Начинаем с false
  const [profileStatusLoading, setProfileStatusLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      // Загружаем данные в фоне, не блокируя интерфейс
      fetchUserProfile();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      console.log('AuthService: Fetching user profile');
      const response = await axios.get('/auth/me');
      console.log('AuthService: User profile loaded:', response.data);
      setUser(response.data);
      
      // Получаем статус профиля только если пользователь авторизован
      if (response.data) {
        fetchProfileStatus();
      } else {
        setProfileStatus(null);
      }
    } catch (error) {
      console.error('AuthService: Error fetching user profile:', error);
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
        setUser(null);
        setProfileStatus(null);
      } else {
        setUser(null);
        setProfileStatus(null);
      }
    }
  };

  const fetchProfileStatus = async () => {
    if (profileStatusLoading || !user) return;
    
    setProfileStatusLoading(true);
    try {
      console.log('AuthService: Fetching profile status');
      const response = await axios.get('/profile/status');
      console.log('AuthService: Profile status loaded:', response.data);
      setProfileStatus(response.data);
    } catch (error) {
      console.error('AuthService: Error fetching profile status:', error);
      setProfileStatus(null);
    } finally {
      setProfileStatusLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      const { access_token } = response.data;
      
      localStorage.setItem('token', access_token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      await fetchUserProfile();
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Ошибка входа' 
      };
    }
  };

  const register = async (email, password, confirmPassword) => {
    try {
      await axios.post('/auth/register', {
        email,
        password,
        confirm_password: confirmPassword
      });
      
      // Автоматически входим после регистрации
      const loginResult = await login(email, password);
      
      if (loginResult.success) {
        // После успешного входа перенаправляем на заполнение профиля
        window.location.href = '/profile-completion';
      }
      
      return loginResult;
    } catch (error) {
      console.error('Registration error:', error);
      return { 
        success: false, 
        error: error.response?.data?.detail || 'Ошибка регистрации' 
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    delete axios.defaults.headers.common['Authorization'];
    setUser(null);
    window.location.href = '/';
  };

  const value = {
    user,
    profileStatus,
    loading,
    login,
    register,
    logout,
    fetchUserProfile,
    fetchProfileStatus,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
