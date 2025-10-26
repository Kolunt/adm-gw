import React, { useState, useEffect } from 'react';
import { List, Card, Avatar, Typography, Tag, Spin, Alert } from 'antd';
import { UserOutlined, LinkOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const UserList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPublicUsers();
  }, []);

  const fetchPublicUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get('/api/users/public');
      setUsers(response.data);
    } catch (error) {
      setError('Ошибка при загрузке списка участников');
      console.error('Error fetching public users:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <Spin size="large" tip="Загрузка участников..." />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <Alert message={error} type="error" showIcon />
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center' }}>
        <Title level={2} style={{ color: '#d63031', marginBottom: '20px' }}>
          🎅 Участники Анонимного Дед Мороза
        </Title>
        <Alert 
          message="Пока нет участников" 
          description="Участники появятся здесь после регистрации"
          type="info" 
          showIcon 
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Title level={2} style={{ textAlign: 'center', color: '#d63031', marginBottom: '30px' }}>
        🎅 Участники Анонимного Дед Мороза
      </Title>
      
      <List
        grid={{ gutter: 16, xs: 1, sm: 2, md: 3, lg: 3, xl: 4, xxl: 4 }}
        dataSource={users}
        renderItem={(user) => (
          <List.Item>
            <Card
              className="santa-card"
              hoverable
              style={{ height: '100%' }}
            >
              <div style={{ textAlign: 'center' }}>
                <Avatar 
                  size={64} 
                  icon={<UserOutlined />} 
                  style={{ backgroundColor: '#d63031', marginBottom: '16px' }}
                />
                <Title level={4} style={{ marginBottom: '8px' }}>
                  {user.gwars_nickname || 'Пользователь'}
                </Title>
                
                <div style={{ marginBottom: '16px' }}>
                  {user.gwars_verified ? (
                    <Tag 
                      color="green" 
                      icon={<CheckCircleOutlined />}
                      style={{ marginBottom: '8px' }}
                    >
                      Верифицирован
                    </Tag>
                  ) : (
                    <Tag 
                      color="orange"
                      style={{ marginBottom: '8px' }}
                    >
                      Не верифицирован
                    </Tag>
                  )}
                </div>
                
                {user.gwars_profile_url ? (
                  <div style={{ marginTop: '12px' }}>
                    <a 
                      href={user.gwars_profile_url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      style={{ 
                        color: '#1890ff', 
                        textDecoration: 'none',
                        fontSize: '14px'
                      }}
                    >
                      <LinkOutlined /> Профиль GWars
                    </a>
                  </div>
                ) : (
                  <div style={{ marginTop: '12px' }}>
                    <Text type="secondary" style={{ fontSize: '14px' }}>
                      Профиль GWars не указан
                    </Text>
                  </div>
                )}
                
                <div style={{ marginTop: '8px' }}>
                  <Text type="secondary" style={{ fontSize: '12px' }}>
                    Участник с {new Date(user.created_at).toLocaleDateString()}
                  </Text>
                </div>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default UserList;
