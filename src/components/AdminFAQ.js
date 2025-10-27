import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { QuestionCircleOutlined, PlusOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text } = Typography;

const AdminFAQ = () => {
  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <QuestionCircleOutlined />
            FAQ
          </Space>
        </Title>
        <Text type="secondary">
          Управление часто задаваемыми вопросами
        </Text>
      </ProCard>

      <ProCard>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <QuestionCircleOutlined style={{ fontSize: '48px', color: '#722ed1', marginBottom: '16px' }} />
          <Title level={3}>Управление FAQ</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Здесь будет функционал для управления часто задаваемыми вопросами
          </Text>
          <Button type="primary" icon={<PlusOutlined />} size="large">
            Добавить вопрос
          </Button>
        </div>
      </ProCard>
    </div>
  );
};

export default AdminFAQ;
