import React from 'react';
import { List, Card, Avatar, Typography, Space, Tag } from 'antd';
import { UserOutlined, GiftOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const UserList = ({ users }) => {
  return (
    <div>
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
                  {user.name}
                </Title>
                <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
                  {user.email}
                </Text>
                
                <div className="wishlist-item">
                  <Space direction="vertical" style={{ width: '100%' }}>
                    <Space>
                      <GiftOutlined style={{ color: '#d63031' }} />
                      <Text strong>Список желаний:</Text>
                    </Space>
                    <Text style={{ fontSize: '14px', lineHeight: '1.4' }}>
                      {user.wishlist}
                    </Text>
                  </Space>
                </div>
                
                <Tag color="green" style={{ marginTop: '12px' }}>
                  Активный участник
                </Tag>
              </div>
            </Card>
          </List.Item>
        )}
      />
    </div>
  );
};

export default UserList;
