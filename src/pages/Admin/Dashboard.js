import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Row, Col, Statistic, Spin, Alert } from 'antd';
import { 
  UserOutlined, 
  GiftOutlined, 
  CalendarOutlined, 
  SettingOutlined,
  TeamOutlined,
  TrophyOutlined
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import ProTable from '@ant-design/pro-table';
import axios from 'axios';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/dashboard/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2}>
              <Space>
                <SettingOutlined />
                Админ-панель
              </Space>
            </Title>
            <Text type="secondary">
              Управление системой Анонимный Дед Мороз
            </Text>
          </Col>
        </Row>
      </ProCard>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="Всего пользователей"
              value={stats.total_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="Активных мероприятий"
              value={stats.active_events || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="Всего регистраций"
              value={stats.total_registrations || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard>
            <Statistic
              title="Назначений подарков"
              value={stats.gift_assignments || 0}
              prefix={<GiftOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <ProCard
            title={
              <Space>
                <UserOutlined />
                Управление пользователями
              </Space>
            }
            hoverable
            actions={[
              <a key="users" href="/admin/users">
                Перейти к пользователям
              </a>
            ]}
          >
            <Text type="secondary">
              Просмотр, редактирование и управление пользователями системы
            </Text>
          </ProCard>
        </Col>

        <Col xs={24} md={8}>
          <ProCard
            title={
              <Space>
                <CalendarOutlined />
                Управление мероприятиями
              </Space>
            }
            hoverable
            actions={[
              <a key="events" href="/admin/events">
                Перейти к мероприятиям
              </a>
            ]}
          >
            <Text type="secondary">
              Создание и управление мероприятиями обмена подарками
            </Text>
          </ProCard>
        </Col>

        <Col xs={24} md={8}>
          <ProCard
            title={
              <Space>
                <SettingOutlined />
                Настройки системы
              </Space>
            }
            hoverable
            actions={[
              <a key="settings" href="/admin/settings">
                Перейти к настройкам
              </a>
            ]}
          >
            <Text type="secondary">
              Конфигурация системы, SMTP, Telegram и другие настройки
            </Text>
          </ProCard>
        </Col>
      </Row>

      {/* Recent Activity */}
      <ProCard
        title={
          <Space>
            <TrophyOutlined />
            Последняя активность
          </Space>
        }
        style={{ marginTop: '24px' }}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary">
            Здесь будет отображаться последняя активность в системе
          </Text>
        </div>
      </ProCard>
    </div>
  );
};

export default AdminDashboard;
