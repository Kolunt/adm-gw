import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Button, Space, Drawer } from 'antd';
import { UserAddOutlined, GiftOutlined, HomeOutlined, UserOutlined, CrownOutlined, MenuOutlined, LogoutOutlined } from '@ant-design/icons';
import axios from 'axios';

import SimpleRegistrationForm from './SimpleRegistrationForm';
import SimpleLoginForm from './SimpleLoginForm';
import AdminPanel from './AdminPanel';
import UserList from './UserList';
import GiftExchange from './GiftExchange';
import GiftList from './GiftList';
import ProfileWizard from './ProfileWizard';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function AppContent() {
  const [users, setUsers] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [needsProfileCompletion, setNeedsProfileCompletion] = useState(false);
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
        
        // Проверяем заполненность профиля для обычных пользователей
        if (response.data.role === 'user' && !response.data.profile_completed) {
          setNeedsProfileCompletion(true);
          navigate('/profile');
          return;
        }
        
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
    setNeedsProfileCompletion(false);
    navigate('/');
  };

  const handleProfileCompleted = () => {
    setNeedsProfileCompletion(false);
    // Обновляем данные пользователя
    checkAuth();
    navigate('/');
  };

  const handleNavigation = (path) => {
    navigate(path);
    if (window.innerWidth <= 768) {
      setMobileMenuOpen(false);
    }
  };

  const HomePage = () => (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <Title level={2} style={{ color: '#d63031', marginBottom: '20px', fontSize: window.innerWidth <= 768 ? '20px' : '32px' }}>
        🎅 Добро пожаловать в Анонимный Дед Мороз! 🎁
      </Title>
      <Title level={4} style={{ color: '#636e72', marginBottom: '30px', fontSize: window.innerWidth <= 768 ? '14px' : '20px' }}>
        {isAuthenticated 
          ? `Добро пожаловать, ${user?.name}! Выберите действие:`
          : 'Зарегистрируйтесь или войдите, чтобы участвовать в обмене подарками'
        }
      </Title>
      <Space size="large" direction={window.innerWidth <= 768 ? "vertical" : "horizontal"} style={{ width: '100%' }}>
        {!isAuthenticated ? (
          <>
            <Button 
              type="primary" 
              size={window.innerWidth <= 768 ? "middle" : "large"}
              icon={<UserAddOutlined />}
              onClick={() => navigate('/register')}
              style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
            >
              Зарегистрироваться
            </Button>
            <Button 
              size={window.innerWidth <= 768 ? "middle" : "large"}
              icon={<UserAddOutlined />}
              onClick={() => navigate('/login')}
              style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
            >
              Войти
            </Button>
          </>
        ) : (
          <>
            {user?.role === 'admin' && (
              <Button 
                type="primary" 
                size={window.innerWidth <= 768 ? "middle" : "large"}
                icon={<CrownOutlined />}
                onClick={() => navigate('/admin')}
                style={{ 
                  backgroundColor: '#d63031', 
                  borderColor: '#d63031',
                  width: window.innerWidth <= 768 ? '100%' : 'auto'
                }}
              >
                Админ-панель
              </Button>
            )}
            <Button 
              size={window.innerWidth <= 768 ? "middle" : "large"}
              icon={<GiftOutlined />}
              onClick={() => navigate('/exchange')}
              style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
            >
              Обмен подарками
            </Button>
            <Button 
              size={window.innerWidth <= 768 ? "middle" : "large"}
              icon={<UserOutlined />}
              onClick={() => navigate('/users')}
              style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
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
      <Header style={{ background: 'transparent', padding: window.innerWidth <= 768 ? '0 15px' : '0 50px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexWrap: window.innerWidth <= 768 ? 'wrap' : 'nowrap'
        }}>
          <Title 
            level={2} 
            style={{ 
              color: '#d63031', 
              margin: 0, 
              cursor: 'pointer',
              fontSize: window.innerWidth <= 768 ? '16px' : '24px'
            }}
            onClick={() => navigate('/')}
          >
            🎅 Анонимный Дед Мороз
          </Title>
          {window.innerWidth <= 768 ? (
            <Button
              type="text"
              icon={<MenuOutlined />}
              onClick={() => setMobileMenuOpen(true)}
              style={{ 
                fontSize: '18px',
                color: '#d63031'
              }}
            />
          ) : (
            <Space 
              size="middle"
              style={{ 
                justifyContent: 'flex-end'
              }}
            >
              <Button 
                icon={<HomeOutlined />}
                onClick={() => navigate('/')}
                size="middle"
              >
                Главная
              </Button>
              {!isAuthenticated ? (
                <>
                  <Button 
                    icon={<UserAddOutlined />}
                    onClick={() => navigate('/login')}
                    size="middle"
                  >
                    Войти
                  </Button>
                  <Button 
                    icon={<UserAddOutlined />}
                    onClick={() => navigate('/register')}
                    size="middle"
                  >
                    Регистрация
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    icon={<UserOutlined />}
                    onClick={() => navigate('/users')}
                    size="middle"
                  >
                    Участники
                  </Button>
                  <Button 
                    icon={<GiftOutlined />}
                    onClick={() => navigate('/exchange')}
                    size="middle"
                  >
                    Подарки
                  </Button>
                  {user?.role === 'admin' && (
                    <Button 
                      icon={<CrownOutlined />}
                      onClick={() => navigate('/admin')}
                      style={{ backgroundColor: '#d63031', borderColor: '#d63031' }}
                      size="middle"
                    >
                      Админ
                    </Button>
                  )}
                  <span style={{ fontSize: '14px' }}>
                    Привет, {user?.name}!
                  </span>
                  <Button 
                    type="primary" 
                    danger
                    onClick={handleLogout}
                    size="middle"
                  >
                    Выйти
                  </Button>
                </>
              )}
            </Space>
          )}
        </div>
      </Header>
      
      <Content style={{ padding: window.innerWidth <= 768 ? '20px 15px' : '50px' }}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/register" element={<SimpleRegistrationForm onUserRegistered={handleUserRegistered} />} />
          <Route path="/login" element={<SimpleLoginForm onLogin={handleLogin} />} />
          <Route path="/profile" element={<ProfileWizard onProfileCompleted={handleProfileCompleted} />} />
          <Route path="/admin" element={<AdminPanel currentUser={user} onLogout={handleLogout} />} />
          <Route path="/users" element={<UserList users={users} />} />
          <Route path="/gifts" element={<GiftList gifts={gifts} users={users} />} />
          <Route path="/exchange" element={<GiftExchange users={users} onGiftCreated={handleGiftCreated} />} />
        </Routes>
      </Content>

      <Footer style={{ 
        textAlign: 'center', 
        background: 'transparent', 
        color: '#d63031',
        padding: window.innerWidth <= 768 ? '15px' : '24px',
        fontSize: window.innerWidth <= 768 ? '12px' : '14px'
      }}>
        Анонимный Дед Мороз ©2023
      </Footer>

      {/* Мобильное гамбургер-меню */}
      <Drawer
        title={
          <div style={{ 
            display: 'flex', 
            alignItems: 'center',
            color: '#d63031'
          }}>
            🎅 Анонимный Дед Мороз
          </div>
        }
        placement="left"
        onClose={() => setMobileMenuOpen(false)}
        open={mobileMenuOpen}
        width={280}
        bodyStyle={{ padding: '20px 0' }}
      >
        <div style={{ padding: '0 20px' }}>
          <Button
            type="default"
            icon={<HomeOutlined />}
            onClick={() => handleNavigation('/')}
            style={{ 
              width: '100%', 
              marginBottom: '12px',
              textAlign: 'left',
              height: '48px',
              fontSize: '16px'
            }}
          >
            Главная
          </Button>
          
          {!isAuthenticated ? (
            <>
              <Button
                type="default"
                icon={<UserAddOutlined />}
                onClick={() => handleNavigation('/login')}
                style={{ 
                  width: '100%', 
                  marginBottom: '12px',
                  textAlign: 'left',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Войти
              </Button>
              <Button
                type="default"
                icon={<UserAddOutlined />}
                onClick={() => handleNavigation('/register')}
                style={{ 
                  width: '100%', 
                  marginBottom: '12px',
                  textAlign: 'left',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Регистрация
              </Button>
            </>
          ) : (
            <>
              <Button
                type="default"
                icon={<UserOutlined />}
                onClick={() => handleNavigation('/users')}
                style={{ 
                  width: '100%', 
                  marginBottom: '12px',
                  textAlign: 'left',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Участники
              </Button>
              <Button
                type="default"
                icon={<GiftOutlined />}
                onClick={() => handleNavigation('/exchange')}
                style={{ 
                  width: '100%', 
                  marginBottom: '12px',
                  textAlign: 'left',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Подарки
              </Button>
              {user?.role === 'admin' && (
                <Button
                  type="primary"
                  icon={<CrownOutlined />}
                  onClick={() => handleNavigation('/admin')}
                  style={{ 
                    width: '100%', 
                    marginBottom: '12px',
                    textAlign: 'left',
                    height: '48px',
                    fontSize: '16px',
                    backgroundColor: '#d63031',
                    borderColor: '#d63031'
                  }}
                >
                  Админ-панель
                </Button>
              )}
              <div style={{ 
                padding: '12px 0',
                borderTop: '1px solid #f0f0f0',
                marginTop: '12px',
                textAlign: 'center',
                fontSize: '14px',
                color: '#666'
              }}>
                Привет, {user?.name}!
              </div>
              <Button
                type="primary"
                danger
                icon={<LogoutOutlined />}
                onClick={() => {
                  handleLogout();
                  setMobileMenuOpen(false);
                }}
                style={{ 
                  width: '100%', 
                  marginTop: '12px',
                  textAlign: 'left',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Выйти
              </Button>
            </>
          )}
        </div>
      </Drawer>
    </Layout>
  );
}

export default AppContent;
