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
  const [loading, setLoading] = useState(true); // Изначально true, чтобы не редиректить до инициализации
  const [profileStatusLoading, setProfileStatusLoading] = useState(false);
  const [profileStatusFetched, setProfileStatusFetched] = useState(false);

  useEffect(() => {
    const init = async () => {
      try {
        const token = localStorage.getItem('token');
        if (token) {
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
          await fetchUserProfile();
        } else {
          setUser(null);
          setProfileStatus(null);
        }
      } finally {
        setLoading(false);
      }
    };
    init();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get('/auth/me');
      setUser(response.data);
      setProfileStatusFetched(false);
      
      // Получаем статус профиля только если пользователь авторизован и это не админ
      if (response.data && response.data.role !== 'admin') {
        fetchProfileStatus();
      } else {
        setProfileStatus(null);
      }
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('token');
        delete axios.defaults.headers.common['Authorization'];
      }
      setUser(null);
      setProfileStatus(null);
      setProfileStatusFetched(false);
    }
  };

  const fetchProfileStatus = async () => {
    if (profileStatusLoading || !user || profileStatusFetched) return;
    
    setProfileStatusLoading(true);
    try {
      const response = await axios.get('/profile/status');
      setProfileStatus(response.data);
      setProfileStatusFetched(true);
    } catch (error) {
      setProfileStatus(null);
      setProfileStatusFetched(true);
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
    setProfileStatus(null);
    setProfileStatusFetched(false);
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
