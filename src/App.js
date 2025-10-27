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
      return [
        {
          key: 'login',
          icon: <LoginOutlined />,
          label: 'Войти',
          onClick: () => window.location.href = '/login',
        },
        {
          key: 'register',
          icon: <UserOutlined />,
          label: 'Регистрация',
          onClick: () => window.location.href = '/register',
        },
      ];
    }

    return [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: user.name || user.email,
        children: [
          {
            key: 'profile',
            label: 'Мой профиль',
            onClick: () => window.location.href = '/profile',
          },
          {
            key: 'logout',
            icon: <LogoutOutlined />,
            label: 'Выйти',
            onClick: logout,
          },
        ],
      },
    ];
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
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ConfigProvider>
  );
};

export default App;
