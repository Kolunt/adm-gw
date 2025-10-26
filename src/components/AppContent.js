import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Button, Space } from 'antd';
import { UserAddOutlined, GiftOutlined, HomeOutlined, UserOutlined, CrownOutlined } from '@ant-design/icons';
import axios from 'axios';

import SimpleRegistrationForm from './SimpleRegistrationForm';
import SimpleLoginForm from './SimpleLoginForm';
import AdminPanel from './AdminPanel';
import UserList from './UserList';
import GiftExchange from './GiftExchange';
import GiftList from './GiftList';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function AppContent() {
  const [users, setUsers] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const response = await axios.get('/auth/me', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUser(response.data);
        setIsAuthenticated(true);
        // Если админ и на главной странице, перенаправляем в админ-панель
        if (response.data.role === 'admin' && location.pathname === '/') {
          navigate('/admin');
        }
      } catch (error) {
        localStorage.removeItem('token');
      }
    }
  }, [location.pathname, navigate]);

  useEffect(() => {
    fetchUsers();
    fetchGifts();
    checkAuth();
  }, [checkAuth]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGifts = async () => {
    try {
      const response = await axios.get('/gifts/');
      setGifts(response.data);
    } catch (error) {
      console.error('Error fetching gifts:', error);
    }
  };

  const handleUserRegistered = () => {
    fetchUsers();
    navigate('/login');
  };

  const handleGiftCreated = () => {
    fetchGifts();
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setIsAuthenticated(true);
    if (userData.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setIsAuthenticated(false);
    navigate('/');
  };

  const HomePage = () => (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <Title level={2} style={{ color: '#d63031', marginBottom: '30px' }}>
        🎅 Добро пожаловать в Анонимный Дед Мороз! 🎁
      </Title>
      <Title level={4} style={{ color: '#636e72', marginBottom: '40px' }}>
        {isAuthenticated 
          ? `Добро пожаловать, ${user?.name}! Выберите действие:`
          : 'Зарегистрируйтесь или войдите, чтобы участвовать в обмене подарками'
        }
      </Title>
      <Space size="large">
        {!isAuthenticated ? (
          <>
            <Button 
              type="primary" 
              size="large" 
              icon={<UserAddOutlined />}
              onClick={() => navigate('/register')}
            >
              Зарегистрироваться
            </Button>
            <Button 
              size="large" 
              icon={<UserAddOutlined />}
              onClick={() => navigate('/login')}
            >
              Войти
            </Button>
          </>
        ) : (
          <>
            {user?.role === 'admin' && (
              <Button 
                type="primary" 
                size="large" 
                icon={<CrownOutlined />}
                onClick={() => navigate('/admin')}
                style={{ backgroundColor: '#d63031', borderColor: '#d63031' }}
              >
                Админ-панель
              </Button>
            )}
            <Button 
              size="large" 
              icon={<GiftOutlined />}
              onClick={() => navigate('/exchange')}
            >
              Обмен подарками
            </Button>
            <Button 
              size="large" 
              icon={<UserOutlined />}
              onClick={() => navigate('/users')}
            >
              Участники
            </Button>
          </>
        )}
      </Space>
    </div>
  );

  return (
    <Layout className="santa-card" style={{ minHeight: '100vh' }}>
      <Header style={{ background: 'transparent', padding: '0 50px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title 
            level={2} 
            style={{ color: '#d63031', margin: 0, cursor: 'pointer' }}
            onClick={() => navigate('/')}
          >
            🎅 Анонимный Дед Мороз
          </Title>
          <Space>
            <Button 
              icon={<HomeOutlined />}
              onClick={() => navigate('/')}
            >
              Главная
            </Button>
            {!isAuthenticated ? (
              <>
                <Button 
                  icon={<UserAddOutlined />}
                  onClick={() => navigate('/login')}
                >
                  Войти
                </Button>
                <Button 
                  icon={<UserAddOutlined />}
                  onClick={() => navigate('/register')}
                >
                  Регистрация
                </Button>
              </>
            ) : (
              <>
                <Button 
                  icon={<UserOutlined />}
                  onClick={() => navigate('/users')}
                >
                  Участники
                </Button>
                <Button 
                  icon={<GiftOutlined />}
                  onClick={() => navigate('/exchange')}
                >
                  Подарки
                </Button>
                {user?.role === 'admin' && (
                  <Button 
                    icon={<CrownOutlined />}
                    onClick={() => navigate('/admin')}
                    style={{ backgroundColor: '#d63031', borderColor: '#d63031' }}
                  >
                    Админ
                  </Button>
                )}
                <span>Привет, {user?.name}!</span>
                <Button 
                  type="primary" 
                  danger
                  onClick={handleLogout}
                >
                  Выйти
                </Button>
              </>
            )}
          </Space>
        </div>
      </Header>
      
      <Content style={{ padding: '50px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<SimpleRegistrationForm onUserRegistered={handleUserRegistered} />} />
          <Route path="/login" element={<SimpleLoginForm onLogin={handleLogin} />} />
          <Route path="/admin" element={<AdminPanel currentUser={user} onLogout={handleLogout} />} />
          <Route path="/users" element={<UserList users={users} />} />
          <Route path="/gifts" element={<GiftList gifts={gifts} users={users} />} />
          <Route path="/exchange" element={<GiftExchange users={users} onGiftCreated={handleGiftCreated} />} />
        </Routes>
      </Content>

      <Footer style={{ textAlign: 'center', background: 'transparent', color: '#d63031' }}>
        Анонимный Дед Мороз ©2023
      </Footer>
    </Layout>
  );
}

export default AppContent;
