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
import axios from '../../utils/axiosConfig';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text } = Typography;

const AdminDashboard = () => {
  const { isDark } = useTheme();
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
    <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ padding: '24px' }}>
      <ProCard style={{ 
        marginBottom: '24px',
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2} style={{ color: isDark ? '#ffffff' : '#000000' }}>
              <Space>
                <SettingOutlined />
                Админ-панель
              </Space>
            </Title>
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
              Управление системой Анонимный Дед Мороз
            </Text>
          </Col>
        </Row>
      </ProCard>

      {/* Statistics Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <ProCard style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <Statistic
              title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Всего пользователей</span>}
              value={stats.total_users || 0}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <Statistic
              title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Активных мероприятий</span>}
              value={stats.active_events || 0}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <Statistic
              title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Всего регистраций</span>}
              value={stats.total_registrations || 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <ProCard style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <Statistic
              title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Назначений подарков</span>}
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
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Управление пользователями</span>
              </Space>
            }
            hoverable
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
            actions={[
              <a key="users" href="/admin/users" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
                Перейти к пользователям
              </a>
            ]}
          >
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
              Просмотр, редактирование и управление пользователями системы
            </Text>
          </ProCard>
        </Col>

        <Col xs={24} md={8}>
          <ProCard
            title={
              <Space>
                <CalendarOutlined />
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Управление мероприятиями</span>
              </Space>
            }
            hoverable
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
            actions={[
              <a key="events" href="/admin/events" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
                Перейти к мероприятиям
              </a>
            ]}
          >
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
              Создание и управление мероприятиями обмена подарками
            </Text>
          </ProCard>
        </Col>

        <Col xs={24} md={8}>
          <ProCard
            title={
              <Space>
                <SettingOutlined />
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Настройки системы</span>
              </Space>
            }
            hoverable
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
            actions={[
              <a key="settings" href="/admin/settings" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
                Перейти к настройкам
              </a>
            ]}
          >
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
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
            <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Последняя активность</span>
          </Space>
        }
        style={{ 
          marginTop: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
            Здесь будет отображаться последняя активность в системе
          </Text>
        </div>
      </ProCard>
    </div>
  );
};

export default AdminDashboard;
