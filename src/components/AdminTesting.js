import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { ExperimentOutlined, BugOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text } = Typography;

const AdminTesting = () => {
  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <ExperimentOutlined />
            Тестирование
          </Space>
        </Title>
        <Text type="secondary">
          Инструменты для тестирования и отладки системы
        </Text>
      </ProCard>

      <ProCard>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <ExperimentOutlined style={{ fontSize: '48px', color: '#faad14', marginBottom: '16px' }} />
          <Title level={3}>Тестирование</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Здесь будут инструменты для тестирования системы
          </Text>
          <Button type="primary" icon={<BugOutlined />} size="large">
            Запустить тесты
          </Button>
        </div>
      </ProCard>
    </div>
  );
};

export default AdminTesting;
