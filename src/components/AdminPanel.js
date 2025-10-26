import React, { useState } from 'react';
import { Layout, Card, Typography, Space, Button, Avatar, Dropdown } from 'antd';
import { 
  UserOutlined, 
  SettingOutlined, 
  CrownOutlined, 
  LogoutOutlined,
  TeamOutlined,
  DashboardOutlined
} from '@ant-design/icons';
import AdminUserManagement from './AdminUserManagement';
import AdminSystemSettings from './AdminSystemSettings';

const { Sider, Content } = Layout;
const { Title } = Typography;

function AdminPanel({ currentUser, onLogout }) {
  const [selectedMenu, setSelectedMenu] = useState('dashboard');

  const menuItems = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: 'Панель управления',
    },
    {
      key: 'users',
      icon: <TeamOutlined />,
      label: 'Управление пользователями',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: 'Настройки системы',
    },
  ];

  const renderContent = () => {
    switch (selectedMenu) {
      case 'users':
        return <AdminUserManagement currentUser={currentUser} />;
      case 'settings':
        return <AdminSystemSettings />;
      default:
        return (
          <Card>
            <Title level={3}>Добро пожаловать в админ-панель!</Title>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card size="small">
                <Title level={4}>Быстрая статистика</Title>
                <Space wrap>
                  <span>👥 Пользователей: 0</span>
                  <span>🎁 Подарков: 0</span>
                  <span>✅ Завершенных обменов: 0</span>
                </Space>
              </Card>
              
              <Card size="small">
                <Title level={4}>Действия</Title>
                <Space>
                  <Button 
                    type="primary" 
                    icon={<TeamOutlined />}
                    onClick={() => setSelectedMenu('users')}
                  >
                    Управление пользователями
                  </Button>
                  <Button 
                    icon={<SettingOutlined />}
                    onClick={() => setSelectedMenu('settings')}
                  >
                    Настройки системы
                  </Button>
                </Space>
              </Card>
            </Space>
          </Card>
        );
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

  return (
    <Layout style={{ minHeight: '100vh' }}>
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
              onClick={() => setSelectedMenu(item.key)}
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
      
      <Layout>
        <div style={{ 
          padding: '20px', 
          background: '#f5f5f5',
          borderBottom: '1px solid #f0f0f0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <Title level={4} style={{ margin: 0 }}>
            {selectedMenu === 'dashboard' && 'Панель управления'}
            {selectedMenu === 'users' && 'Управление пользователями'}
            {selectedMenu === 'settings' && 'Настройки системы'}
          </Title>
          
          <Dropdown menu={userMenu} placement="bottomRight">
            <Button>
              <Avatar size="small" icon={<UserOutlined />} />
              {currentUser?.name}
            </Button>
          </Dropdown>
        </div>
        
        <Content style={{ padding: '20px' }}>
          {renderContent()}
        </Content>
      </Layout>
    </Layout>
  );
}

export default AdminPanel;
