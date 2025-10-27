import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { CalendarOutlined, PlusOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text } = Typography;

const AdminEvents = () => {
  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <CalendarOutlined />
            Управление мероприятиями
          </Space>
        </Title>
        <Text type="secondary">
          Создание и управление мероприятиями обмена подарками
        </Text>
      </ProCard>

      <ProCard>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <CalendarOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
          <Title level={3}>Управление мероприятиями</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Здесь будет функционал для создания и управления мероприятиями
          </Text>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Создать мероприятие
          </Button>
        </div>
      </ProCard>
    </div>
  );
};

export default AdminEvents;
