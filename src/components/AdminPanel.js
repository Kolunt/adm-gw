import React, { useState, useEffect } from 'react';
import { Layout, Typography, Button, Avatar, Dropdown } from 'antd';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  UserOutlined, 
  SettingOutlined, 
  CrownOutlined, 
  LogoutOutlined,
  TeamOutlined,
  DashboardOutlined,
  CalendarOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  BookOutlined,
  GiftOutlined
} from '@ant-design/icons';
import AdminUserManagement from './AdminUserManagement';
import AdminSystemSettings from './AdminSystemSettings';
import EventManagement from './EventManagement';
import AdminInterestsManagement from './AdminInterestsManagement';
import AdminFAQManagement from './AdminFAQManagement';
import AdminDocumentation from './AdminDocumentation';
import AdminDashboard from './AdminDashboard';
import AdminGiftAssignmentsManager from './AdminGiftAssignmentsManager';

const { Sider, Content } = Layout;
const { Title } = Typography;

function AdminPanel({ currentUser, onLogout }) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [selectedMenu, setSelectedMenu] = useState(() => {
    const path = location.pathname;
    if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
    if (path === '/admin/users') return 'users';
    if (path === '/admin/events') return 'events';
    if (path === '/admin/gift-assignments') return 'gift-assignments';
    if (path === '/admin/interests') return 'interests';
    if (path === '/admin/faq') return 'faq';
    if (path === '/admin/documentation') return 'documentation';
    if (path === '/admin/settings' || path.startsWith('/admin/settings/')) return 'settings';
    return 'dashboard';
  });
  
  const [activeSettingsTab, setActiveSettingsTab] = useState(() => {
    const path = location.pathname;
    if (path === '/admin/settings/general') return 'general';
    if (path === '/admin/settings/dadata') return 'dadata';
    if (path === '/admin/settings/icon') return 'icon';
    if (path === '/admin/settings/telegram') return 'telegram';
    return 'general';
  });

  // Обновляем активное меню при изменении URL
  useEffect(() => {
    const getActiveMenuFromPath = () => {
      const path = location.pathname;
      if (path === '/admin' || path === '/admin/dashboard') return 'dashboard';
      if (path === '/admin/users') return 'users';
      if (path === '/admin/events') return 'events';
      if (path === '/admin/gift-assignments') return 'gift-assignments';
      if (path === '/admin/interests') return 'interests';
      if (path === '/admin/faq') return 'faq';
      if (path === '/admin/documentation') return 'documentation';
      if (path === '/admin/settings' || path.startsWith('/admin/settings/')) return 'settings';
      return 'dashboard'; // по умолчанию
    };
    
    const getActiveSettingsTab = () => {
      const path = location.pathname;
      if (path === '/admin/settings/general') return 'general';
      if (path === '/admin/settings/dadata') return 'dadata';
      if (path === '/admin/settings/icon') return 'icon';
      if (path === '/admin/settings/telegram') return 'telegram';
      return 'general'; // по умолчанию
    };
    
    setSelectedMenu(getActiveMenuFromPath());
    setActiveSettingsTab(getActiveSettingsTab());
  }, [location.pathname]);

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Панель управления',
      path: '/admin/dashboard',
    },
    {
      key: 'events',
      icon: <CalendarOutlined />,
      label: 'Управление мероприятиями',
      path: '/admin/events',
    },
    {
      key: 'gift-assignments',
      icon: <GiftOutlined />,
      label: 'Назначения подарков',
      path: '/admin/gift-assignments',
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Управление пользователями',
      path: '/admin/users',
    },
    {
      key: 'interests',
      icon: <HeartOutlined />,
      label: 'Интересы',
      path: '/admin/interests',
    },
    {
      key: 'faq',
      icon: <QuestionCircleOutlined />,
      label: 'FAQ',
      path: '/admin/faq',
    },
    {
      key: 'documentation',
      icon: <BookOutlined />,
      label: 'Документация',
      path: '/admin/documentation',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки системы',
      path: '/admin/settings',
    },
  ];

  const handleMenuClick = (menuKey) => {
    const menuItem = menuItems.find(item => item.key === menuKey);
    if (menuItem) {
      navigate(menuItem.path);
    }
  };

  const renderContent = () => {
    switch (selectedMenu) {
      case 'events':
        return <EventManagement />;
      case 'gift-assignments':
        return <AdminGiftAssignmentsManager />;
      case 'users':
        return <AdminUserManagement currentUser={currentUser} />;
      case 'interests':
        return <AdminInterestsManagement currentUser={currentUser} />;
      case 'faq':
        return <AdminFAQManagement currentUser={currentUser} />;
      case 'documentation':
        return <AdminDocumentation />;
      case 'settings':
        return <AdminSystemSettings activeTab={activeSettingsTab} />;
      case 'dashboard':
        return <AdminDashboard />;
      default:
        return <AdminDashboard />;
    }
  };

  const userMenu = {
    items: [
      {
        key: 'profile',
        icon: <UserOutlined />,
        label: `${currentUser?.name} (${currentUser?.email})`
      },
      {
        type: 'divider'
      },
      {
        key: 'logout',
        icon: <LogoutOutlined />,
        label: 'Выйти',
        onClick: onLogout
      }
    ]
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Десктопная боковая панель */}
      {!isMobile && (
        <Sider 
          width={250} 
          style={{ 
            background: '#fff',
            borderRight: '1px solid #f0f0f0'
          }}
        >
          <div style={{ 
            padding: '20px', 
            textAlign: 'center',
            borderBottom: '1px solid #f0f0f0'
          }}>
            <CrownOutlined style={{ fontSize: '24px', color: '#d63031' }} />
            <Title level={4} style={{ margin: '10px 0 0 0' }}>
              Админ-панель
            </Title>
          </div>
          
          <div style={{ padding: '10px' }}>
            {menuItems.map(item => (
              <Button
                key={item.key}
                type={selectedMenu === item.key ? 'primary' : 'default'}
                icon={item.icon}
                onClick={() => handleMenuClick(item.key)}
                style={{ 
                  width: '100%', 
                  marginBottom: '8px',
                  textAlign: 'left',
                  backgroundColor: selectedMenu === item.key ? '#d63031' : 'transparent',
                  borderColor: selectedMenu === item.key ? '#d63031' : '#d9d9d9'
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        </Sider>
      )}
      
      <Layout>
        {/* Мобильная навигация */}
        {isMobile && (
          <div style={{ 
            padding: '10px', 
            background: '#f5f5f5',
            borderBottom: '1px solid #f0f0f0',
            display: 'flex',
            justifyContent: 'center',
            flexWrap: 'wrap'
          }}>
            {menuItems.map(item => (
              <Button
                key={item.key}
                type={selectedMenu === item.key ? 'primary' : 'default'}
                icon={item.icon}
                onClick={() => handleMenuClick(item.key)}
                style={{ 
                  margin: '2px',
                  fontSize: '12px',
                  padding: '4px 8px',
                  backgroundColor: selectedMenu === item.key ? '#d63031' : 'transparent',
                  borderColor: selectedMenu === item.key ? '#d63031' : '#d9d9d9'
                }}
              >
                {item.label}
              </Button>
            ))}
          </div>
        )}
        
        <div style={{ 
          padding: isMobile ? '10px' : '20px', 
          background: '#f5f5f5',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: isMobile ? 'wrap' : 'nowrap'
        }}>
          <Title level={4} style={{ 
            margin: 0,
            fontSize: isMobile ? '16px' : '20px'
          }}>
            {selectedMenu === 'dashboard' && 'Панель управления'}
            {selectedMenu === 'events' && 'Управление мероприятиями'}
            {selectedMenu === 'users' && 'Управление пользователями'}
            {selectedMenu === 'settings' && 'Настройки системы'}
          </Title>
          
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button size={isMobile ? "small" : "middle"}>
              <Avatar size="small" icon={<UserOutlined />} />
              <span style={{ fontSize: isMobile ? '12px' : '14px' }}>
                {currentUser?.name}
              </span>
            </Button>
          </Dropdown>
        </div>
        
        <Content style={{ padding: isMobile ? '10px' : '20px' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminPanel;