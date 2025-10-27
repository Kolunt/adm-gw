import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { GiftOutlined, SwapOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text } = Typography;

const AdminGiftAssignments = () => {
  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <GiftOutlined />
            Назначения подарков
          </Space>
        </Title>
        <Text type="secondary">
          Управление назначениями подарков между участниками
        </Text>
      </ProCard>

      <ProCard>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <GiftOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
          <Title level={3}>Назначения подарков</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Здесь будет функционал для назначения подарков участникам
          </Text>
          <Button type="primary" icon={<SwapOutlined />} size="large">
            Создать назначения
          </Button>
        </div>
      </ProCard>
    </div>
  );
};

export default AdminGiftAssignments;
