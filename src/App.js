import React from 'react';
import { ConfigProvider } from 'antd';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProLayout from '@ant-design/pro-layout';
import { 
  HomeOutlined, 
  UserOutlined, 
  SettingOutlined, 
  TeamOutlined,
  GiftOutlined,
  QuestionCircleOutlined,
  LoginOutlined,
  LogoutOutlined
} from '@ant-design/icons';
import zhCN from 'antd/locale/zh_CN';

// Import pages
import HomePage from './pages/Home';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './components/AdminUsers';
import AdminSettings from './components/AdminSystemSettings';
import UserProfile from './pages/Profile';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import EventsPage from './pages/Events';
import UserListPage from './pages/User/List';

// Import services
import { AuthProvider, useAuth } from './services/AuthService';

// Import styles
import './App.css';

const AppContent = () => {
  const { user, logout } = useAuth();

  const menuItems = [
    {
      key: '/',
      icon: <HomeOutlined />,
      label: 'Главная',
    },
    {
      key: '/events',
      icon: <GiftOutlined />,
      label: 'Мероприятия',
    },
    {
      key: '/users',
      icon: <TeamOutlined />,
      label: 'Участники',
    },
    ...(user?.role === 'admin' ? [{
      key: '/admin',
      icon: <SettingOutlined />,
      label: 'Админ-панель',
      children: [
        {
          key: '/admin/dashboard',
          label: 'Дашборд',
        },
        {
          key: '/admin/users',
          label: 'Управление пользователями',
        },
        {
          key: '/admin/events',
          label: 'Управление мероприятиями',
        },
        {
          key: '/admin/settings',
          label: 'Настройки системы',
        },
      ],
    }] : []),
    {
      key: '/profile',
      icon: <UserOutlined />,
      label: 'Профиль',
    },
  ];

  const rightContentRender = () => {
    if (!user) {
      return (
        <div style={{ display: 'flex', gap: '8px' }}>
          <a 
            href="/login" 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '4px', 
              background: '#1890ff', 
              color: 'white', 
              textDecoration: 'none' 
            }}
          >
            <LoginOutlined /> Войти
          </a>
          <a 
            href="/register" 
            style={{ 
              padding: '8px 16px', 
              borderRadius: '4px', 
              background: '#52c41a', 
              color: 'white', 
              textDecoration: 'none' 
            }}
          >
            <UserOutlined /> Регистрация
          </a>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <span style={{ color: '#1890ff' }}>
          <UserOutlined /> {user.name || user.email}
        </span>
        <a 
          href="/profile" 
          style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            background: '#f0f0f0', 
            color: '#333', 
            textDecoration: 'none' 
          }}
        >
          Профиль
        </a>
        <button 
          onClick={logout}
          style={{ 
            padding: '8px 16px', 
            borderRadius: '4px', 
            background: '#ff4d4f', 
            color: 'white', 
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <LogoutOutlined /> Выйти
        </button>
      </div>
    );
  };

  return (
    <ProLayout
      title="Анонимный Дед Мороз"
      logo="🎅"
      route={{
        routes: menuItems,
      }}
      location={{
        pathname: window.location.pathname,
      }}
      menuItemRender={(item, dom) => (
        <a
          onClick={() => {
            if (item.key !== window.location.pathname) {
              window.location.href = item.key;
            }
          }}
        >
          {dom}
        </a>
      )}
      rightContentRender={rightContentRender}
      layout="mix"
      contentWidth="Fluid"
      fixedHeader
      fixSiderbar
    >
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/profile" element={<UserProfile />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        {user?.role === 'admin' && (
          <>
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/users" element={<AdminUsers />} />
            <Route path="/admin/events" element={<AdminDashboard />} />
            <Route path="/admin/settings" element={<AdminSettings />} />
          </>
        )}
      </Routes>
    </ProLayout>
  );
};

const App = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <AuthProvider>
        <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <AppContent />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
