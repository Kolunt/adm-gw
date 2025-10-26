import React, { useState, useEffect, useCallback } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Typography, Button, Space, Drawer } from 'antd';
import { UserAddOutlined, HomeOutlined, UserOutlined, CrownOutlined, MenuOutlined, LogoutOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';

import SimpleRegistrationForm from './SimpleRegistrationForm';
import SimpleLoginForm from './SimpleLoginForm';
import AdminPanel from './AdminPanel';
import UserList from './UserList';
import UserProfile from './UserProfile';
import ProfileWizard from './ProfileWizard';
import EventRegistration from './EventRegistration';
import EventDetail from './EventDetail';
import CurrentEventInfo from './CurrentEventInfo';
import AdminRouteGuard from './AdminRouteGuard';
import AdminUserProfileEdit from './AdminUserProfileEdit';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

function AppContent() {
  const [users, setUsers] = useState([]);
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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


  const handleUserRegistered = () => {
    fetchUsers();
    navigate('/login');
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

  const handleProfileCompleted = () => {
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
    <div style={{ padding: '20px' }}>
      {/* Информация о текущем мероприятии */}
      <CurrentEventInfo />

      {/* Кнопки действий для авторизованных пользователей */}
      {isAuthenticated && (
        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <Space size="large" direction={window.innerWidth <= 768 ? "vertical" : "horizontal"} style={{ width: '100%' }}>
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
              icon={<UserOutlined />}
              onClick={() => navigate('/user-profile')}
              style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
            >
              Мой профиль
            </Button>
            <Button 
              size={window.innerWidth <= 768 ? "middle" : "large"}
              icon={<UserOutlined />}
              onClick={() => navigate('/users')}
              style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
            >
              Участники
            </Button>
            <Button 
              size={window.innerWidth <= 768 ? "middle" : "large"}
              icon={<CalendarOutlined />}
              onClick={() => navigate('/events')}
              style={{ width: window.innerWidth <= 768 ? '100%' : 'auto' }}
            >
              Мероприятия
            </Button>
          </Space>
        </div>
      )}
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
                    onClick={() => navigate('/user-profile')}
                    size="middle"
                  >
                    Профиль
                  </Button>
                  <Button 
                    icon={<UserOutlined />}
                    onClick={() => navigate('/users')}
                    size="middle"
                  >
                    Участники
                  </Button>
                  <Button 
                    icon={<CalendarOutlined />}
                    onClick={() => navigate('/events')}
                    size="middle"
                  >
                    Мероприятия
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
          <Route path="/user-profile" element={<UserProfile />} />
          <Route path="/admin" element={
            <AdminRouteGuard user={user}>
              <AdminPanel currentUser={user} onLogout={handleLogout} />
            </AdminRouteGuard>
          } />
          <Route path="/admin/dashboard" element={
            <AdminRouteGuard user={user}>
              <AdminPanel currentUser={user} onLogout={handleLogout} />
            </AdminRouteGuard>
          } />
          <Route path="/admin/users" element={
            <AdminRouteGuard user={user}>
              <AdminPanel currentUser={user} onLogout={handleLogout} />
            </AdminRouteGuard>
          } />
          <Route path="/admin/events" element={
            <AdminRouteGuard user={user}>
              <AdminPanel currentUser={user} onLogout={handleLogout} />
            </AdminRouteGuard>
          } />
          <Route path="/admin/settings" element={
            <AdminRouteGuard user={user}>
              <AdminPanel currentUser={user} onLogout={handleLogout} />
            </AdminRouteGuard>
          } />
          <Route path="/admin/settings/general" element={
            <AdminRouteGuard user={user}>
              <AdminPanel currentUser={user} onLogout={handleLogout} />
            </AdminRouteGuard>
          } />
          <Route path="/admin/settings/dadata" element={
            <AdminRouteGuard user={user}>
              <AdminPanel currentUser={user} onLogout={handleLogout} />
            </AdminRouteGuard>
          } />
          <Route path="/admin/user-profile/:userId" element={
            <AdminRouteGuard user={user}>
              <AdminUserProfileEdit />
            </AdminRouteGuard>
          } />
          <Route path="/users" element={<UserList users={users} />} />
          <Route path="/events" element={<EventRegistration />} />
          <Route path="/event/:uniqueId" element={<EventDetail />} />
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
             styles={{ body: { padding: '20px 0' } }}
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
                onClick={() => handleNavigation('/user-profile')}
                style={{ 
                  width: '100%', 
                  marginBottom: '12px',
                  textAlign: 'left',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Мой профиль
              </Button>
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
                icon={<CalendarOutlined />}
                onClick={() => handleNavigation('/events')}
                style={{ 
                  width: '100%', 
                  marginBottom: '12px',
                  textAlign: 'left',
                  height: '48px',
                  fontSize: '16px'
                }}
              >
                Мероприятия
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
