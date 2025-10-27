import React from 'react';
import { Card, Typography, Space, Button } from 'antd';
import { BookOutlined, FileTextOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text } = Typography;

const AdminDocumentation = () => {
  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <BookOutlined />
            Документация
          </Space>
        </Title>
        <Text type="secondary">
          Документация и справочные материалы
        </Text>
      </ProCard>

      <ProCard>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <BookOutlined style={{ fontSize: '48px', color: '#13c2c2', marginBottom: '16px' }} />
          <Title level={3}>Документация</Title>
          <Text type="secondary" style={{ fontSize: '16px', marginBottom: '24px', display: 'block' }}>
            Здесь будет документация по системе
          </Text>
          <Button type="primary" icon={<FileTextOutlined />} size="large">
            Открыть документацию
          </Button>
        </div>
      </ProCard>
    </div>
  );
};

export default AdminDocumentation;
