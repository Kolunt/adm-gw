import React, { useState, useEffect } from 'react';
import { ConfigProvider, App as AntdApp } from 'antd';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Drawer, Button } from 'antd';
import { 
  HomeOutlined, 
  UserOutlined, 
  SettingOutlined, 
  TeamOutlined,
  GiftOutlined,
  QuestionCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  DashboardOutlined,
  CalendarOutlined,
  HeartOutlined,
  BookOutlined,
  ExperimentOutlined,
  InfoCircleOutlined,
  ContactsOutlined,
  MenuUnfoldOutlined,
  FolderOutlined,
  MenuOutlined
} from '@ant-design/icons';
import ruRU from 'antd/locale/ru_RU';

// Import pages
import HomePage from './pages/Home';
import AdminDashboard from './pages/Admin/Dashboard';
import AdminUsers from './components/AdminUsers';
import AdminSettings from './components/AdminSystemSettings';
import AdminEvents from './components/AdminEvents';
import AdminGiftAssignments from './components/AdminGiftAssignments';
import AdminTesting from './components/AdminTesting';
import AdminInterests from './components/AdminInterests';
import AdminFAQ from './components/AdminFAQ';
import AdminFAQCategories from './components/AdminFAQCategories';
import AdminMenuManagement from './components/AdminMenuManagement';
import AdminDocumentation from './components/AdminDocumentation';
import AdminAbout from './components/AdminAbout';
import UserProfile from './pages/Profile';
import LoginPage from './pages/Auth/Login';
import RegisterPage from './pages/Auth/Register';
import EventsPage from './pages/Events';
import EventDetail from './pages/Events/EventDetail';
import UserListPage from './pages/User/List';
import ProfileCompletion from './components/ProfileCompletion';
import ProfileCompletionGuard from './components/ProfileCompletionGuard';
import FAQPage from './pages/FAQ';
import AboutPage from './pages/About';
import ContactsPage from './pages/Contacts';

// Import services
import ProtectedRoute from './components/ProtectedRoute';
import { AuthProvider, useAuth } from './services/AuthService';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { useColorSettings } from './hooks/useColorSettings';
import axios from './utils/axiosConfig';

// Import styles
import './App.css';

const AppContent = () => {
  const { user, profileStatus, logout, fetchProfileStatus } = useAuth();
  const { theme, isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dynamicMenuItems, setDynamicMenuItems] = useState([]);
  const [menuLoading, setMenuLoading] = useState(false);

  // Функция загрузки динамического меню
  const fetchMenuItems = async () => {
    setMenuLoading(true);
    try {
      const response = await axios.get('/api/menu');
      setDynamicMenuItems(response.data);
    } catch (error) {
      console.error('Error fetching menu items:', error);
      // В случае ошибки используем статическое меню
      setDynamicMenuItems([]);
    } finally {
      setMenuLoading(false);
    }
  };

  // Функция для преобразования данных меню из API в формат Ant Design
  const convertMenuItems = (items) => {
    return items.map(item => {
      const menuItem = {
        key: item.path || `menu-${item.id}`,
        icon: getIconComponent(item.icon),
        label: item.title,
      };

      if (item.children && item.children.length > 0) {
        menuItem.children = convertMenuItems(item.children);
      }

      return menuItem;
    });
  };

  // Функция для получения компонента иконки по названию
  const getIconComponent = (iconName) => {
    if (!iconName) return null;
    
    const iconMap = {
      'HomeOutlined': <HomeOutlined />,
      'UserOutlined': <UserOutlined />,
      'SettingOutlined': <SettingOutlined />,
      'TeamOutlined': <TeamOutlined />,
      'GiftOutlined': <GiftOutlined />,
      'QuestionCircleOutlined': <QuestionCircleOutlined />,
      'CalendarOutlined': <CalendarOutlined />,
      'HeartOutlined': <HeartOutlined />,
      'BookOutlined': <BookOutlined />,
      'ExperimentOutlined': <ExperimentOutlined />,
      'InfoCircleOutlined': <InfoCircleOutlined />,
      'ContactsOutlined': <ContactsOutlined />,
      'MenuOutlined': <MenuOutlined />,
      'FolderOutlined': <FolderOutlined />,
      'FileOutlined': <FileOutlined />,
      'DashboardOutlined': <DashboardOutlined />,
      'LoginOutlined': <LoginOutlined />,
      'LogoutOutlined': <LogoutOutlined />,
      'PlusOutlined': <PlusOutlined />,
      'EditOutlined': <EditOutlined />,
      'DeleteOutlined': <DeleteOutlined />,
    };

    return iconMap[iconName] || null;
  };

  // Проверяем статус профиля при загрузке
  useEffect(() => {
    if (user && user.role !== 'admin') {
      fetchProfileStatus();
    }
  }, [user, fetchProfileStatus]);

  // Загружаем меню при изменении пользователя
  useEffect(() => {
    fetchMenuItems();
  }, [user]);

  const handleMenuClick = ({ key }) => {
    if (key !== location.pathname) {
      navigate(key);
    }
    setMobileMenuOpen(false); // Закрываем мобильное меню после клика
  };

  // Определяем доступные пункты меню в зависимости от статуса профиля
  const getMenuItems = () => {
    const baseItems = [
      {
        key: '/',
        icon: <HomeOutlined />,
        label: 'Главная',
      },
      {
        key: '/events',
        icon: <CalendarOutlined />,
        label: 'Все мероприятия',
      },
      {
        key: '/users',
        icon: <TeamOutlined />,
        label: 'Все участники',
      },
      {
        key: '/faq',
        icon: <QuestionCircleOutlined />,
        label: 'FAQ',
      },
      {
        key: '/about',
        icon: <InfoCircleOutlined />,
        label: 'О системе',
      },
      {
        key: '/contacts',
        icon: <ContactsOutlined />,
        label: 'Контакты',
      }
    ];

    // Если пользователь авторизован, но профиль не заполнен (и это не админ) - скрываем все пункты меню
    if (user && user.role !== 'admin' && !profileStatus?.profile_completed) {
      return [];
    }

    return baseItems;
  };

  // Формируем меню: сначала динамическое, затем статическое как fallback
  const menuItems = [
    ...(dynamicMenuItems.length > 0 ? convertMenuItems(dynamicMenuItems) : getMenuItems()),
    // Если динамическое меню не загружено или пустое, добавляем статическое админ-меню
    ...(user?.role === 'admin' && dynamicMenuItems.length === 0 ? [{
      key: '/admin',
      icon: <SettingOutlined />,
      label: 'Админ-панель',
      children: [
        {
          key: '/admin/dashboard',
          icon: <DashboardOutlined />,
          label: 'Панель управления',
        },
        {
          key: '/admin/events',
          icon: <CalendarOutlined />,
          label: 'Управление мероприятиями',
        },
        {
          key: '/admin/gift-assignments',
          icon: <GiftOutlined />,
          label: 'Назначения подарков',
        },
        {
          key: '/admin/users',
          icon: <TeamOutlined />,
          label: 'Управление пользователями',
        },
        {
          key: '/admin/testing',
          icon: <ExperimentOutlined />,
          label: 'Тестирование',
        },
        {
          key: '/admin/interests',
          icon: <HeartOutlined />,
          label: 'Интересы',
        },
        {
          key: '/admin/faq',
          icon: <QuestionCircleOutlined />,
          label: 'FAQ',
        },
        {
          key: '/admin/faq/categories',
          icon: <FolderOutlined />,
          label: 'Категории FAQ',
        },
        {
          key: '/admin/menu',
          icon: <MenuOutlined />,
          label: 'Управление меню',
        },
        {
          key: '/admin/documentation',
          icon: <BookOutlined />,
          label: 'Документация',
        },
        {
          key: '/admin/contacts',
          icon: <ContactsOutlined />,
          label: 'Контакты',
        },
        {
          key: '/admin/about',
          icon: <InfoCircleOutlined />,
          label: 'О системе',
        },
        {
          key: '/admin/settings',
          icon: <SettingOutlined />,
          label: 'Настройки системы',
        },
      ],
    }] : []),
  ];

  const rightContentRender = () => {
    if (!user) {
      return (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <Button 
            type="text"
            icon={<MenuUnfoldOutlined />}
            onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-button"
          />
          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              onClick={() => navigate('/login')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '4px', 
                background: '#2d5016', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <LoginOutlined /> Войти
            </button>
            <button 
              onClick={() => navigate('/register')}
              style={{ 
                padding: '8px 16px', 
                borderRadius: '4px', 
                background: '#52c41a', 
                color: 'white', 
                border: 'none',
                cursor: 'pointer'
              }}
            >
              <UserOutlined /> Регистрация
            </button>
          </div>
        </div>
      );
    }

    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Button 
          type="text"
          icon={<MenuUnfoldOutlined />}
          onClick={() => setMobileMenuOpen(true)}
            className="mobile-menu-button"
        />
        <Button 
          type="text"
          icon={<UserOutlined />}
          onClick={() => navigate('/profile')}
          style={{ 
            color: '#2d5016',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          {user.gwars_nickname || 'Враг неизвестен'}
        </Button>
        <button
          onClick={logout}
          style={{
            padding: '8px',
            borderRadius: '4px',
            background: '#ff4d4f',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '32px',
            height: '32px'
          }}
          title="Выйти"
        >
          <LogoutOutlined />
        </button>
      </div>
    );
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Desktop Sidebar */}
      <Layout.Sider
        width={256}
            className={`${theme} desktop-sidebar`}
            style={{
              background: isDark ? '#141414' : '#fff',
              boxShadow: isDark 
                ? '2px 0 8px 0 rgba(0,0,0,0.3)' 
                : '2px 0 8px 0 rgba(29,35,41,.05)'
            }}
      >
        <div className={theme} style={{ 
          padding: '16px', 
          fontSize: '18px', 
          fontWeight: 'bold',
          borderBottom: isDark ? '1px solid #303030' : '1px solid #f0f0f0',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          color: isDark ? '#ffffff' : '#000000',
          background: isDark ? '#141414' : '#fff'
        }}>
          🎅 Анонимный Дед Мороз
        </div>
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0 }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: item.children?.map(child => ({
              key: child.key,
              icon: child.icon,
              label: child.label,
            }))
          }))}
          onClick={handleMenuClick}
        />
      </Layout.Sider>

      {/* Mobile Drawer */}
          <Drawer
            title={
              <div className={theme} style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                color: isDark ? '#ffffff' : '#000000'
              }}>
                🎅 Анонимный Дед Мороз
              </div>
            }
            placement="left"
            closable={true}
            onClose={() => setMobileMenuOpen(false)}
            open={mobileMenuOpen}
            width={280}
            styles={{
              body: { 
                padding: 0,
                background: isDark ? '#141414' : '#fff'
              },
              header: {
                background: isDark ? '#141414' : '#fff',
                borderBottom: isDark ? '1px solid #303030' : '1px solid #f0f0f0'
              }
            }}
          >
        <Menu
          mode="inline"
          selectedKeys={[location.pathname]}
          style={{ borderRight: 0 }}
          items={menuItems.map(item => ({
            key: item.key,
            icon: item.icon,
            label: item.label,
            children: item.children?.map(child => ({
              key: child.key,
              icon: child.icon,
              label: child.label,
            }))
          }))}
          onClick={handleMenuClick}
        />
      </Drawer>

      <Layout>
        <Layout.Header className={theme} style={{ 
          background: isDark ? '#141414' : '#fff', 
          padding: '0 24px',
          boxShadow: isDark 
            ? '0 2px 8px 0 rgba(0,0,0,0.3)' 
            : '0 2px 8px 0 rgba(29,35,41,.05)',
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          borderBottom: isDark ? '1px solid #303030' : '1px solid #f0f0f0'
        }}>
          {rightContentRender()}
        </Layout.Header>
        <Layout.Content className={theme} style={{ 
          padding: '24px',
          background: isDark ? '#001529' : '#f0f2f5'
        }}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/users" element={<UserListPage />} />
        <Route path="/profile/:id?" element={<UserProfile />} />
        <Route path="/faq" element={<FAQPage />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contacts" element={<ContactsPage />} />
        <Route path="/profile-completion" element={<ProfileCompletion />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/admin" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/dashboard" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/users" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminUsers />
          </ProtectedRoute>
        } />
        <Route path="/admin/events" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminEvents />
          </ProtectedRoute>
        } />
        <Route path="/admin/gift-assignments" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminGiftAssignments />
          </ProtectedRoute>
        } />
        <Route path="/admin/testing" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminTesting />
          </ProtectedRoute>
        } />
        <Route path="/admin/interests" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminInterests />
          </ProtectedRoute>
        } />
        <Route path="/admin/faq" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminFAQ />
          </ProtectedRoute>
        } />
        <Route path="/admin/faq/categories" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminFAQCategories />
          </ProtectedRoute>
        } />
        <Route path="/admin/menu" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminMenuManagement />
          </ProtectedRoute>
        } />
        <Route path="/admin/documentation" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminDocumentation />
          </ProtectedRoute>
        } />
        <Route path="/admin/contacts" element={
          <ProtectedRoute requireAdmin={true}>
            <ContactsPage />
          </ProtectedRoute>
        } />
        <Route path="/admin/about" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminAbout />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings/general" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings/colors" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings/smtp" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings/security" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings/notifications" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminSettings />
          </ProtectedRoute>
        } />
        <Route path="/admin/settings/system" element={
          <ProtectedRoute requireAdmin={true}>
            <AdminSettings />
          </ProtectedRoute>
        } />
      </Routes>
        </Layout.Content>
      </Layout>
    </Layout>
  );
};

const App = () => {
  return (
    <ThemeProvider>
      <ConfigProvider locale={ruRU}>
        <AntdApp>
          <AuthProvider>
            <Router future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <AppContent />
            </Router>
          </AuthProvider>
        </AntdApp>
      </ConfigProvider>
    </ThemeProvider>
  );
};

export default App;
