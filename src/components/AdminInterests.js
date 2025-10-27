import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { HeartOutlined, PlusOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text } = Typography;

const AdminInterests = () => {
  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <HeartOutlined />
            Интересы
          </Space>
        </Title>
        <Text type="secondary">
          Управление категориями интересов пользователей
        </Text>
      </ProCard>

      <ProCard>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <HeartOutlined style={{ fontSize: '48px', color: '#f5222d', marginBottom: '16px' }} />
          <Title level={3}>Управление интересами</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Здесь будет функционал для управления интересами пользователей
          </Text>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Добавить интерес
          </Button>
        </div>
      </ProCard>
    </div>
  );
};

export default AdminInterests;
