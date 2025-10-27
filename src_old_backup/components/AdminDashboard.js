import React, { useState, useEffect } from 'react';
import {
  Card,
  Row,
  Col,
  Statistic,
  Typography,
  Table,
  Tag,
  Spin,
  Alert,
  Progress,
  List,
  Avatar,
  Space,
  Divider,
  Tooltip
} from 'antd';
import {
  UserOutlined,
  TeamOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  HeartOutlined,
  QuestionCircleOutlined,
  RobotOutlined,
  CrownOutlined,
  TrophyOutlined,
  BarChartOutlined,
  LineChartOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;

function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = async () => {
    try {
      const response = await axios.get('/admin/dashboard/stats', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setStats(response.data);
    } catch (error) {
      console.error('Ошибка загрузки статистики:', error);
      setError('Ошибка загрузки статистики');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Загрузка статистики...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Ошибка загрузки статистики"
        description={error}
        type="error"
        showIcon
        style={{ margin: '16px' }}
      />
    );
  }

  if (!stats) {
    return (
      <Alert
        message="Нет данных"
        description="Статистика недоступна"
        type="warning"
        showIcon
        style={{ margin: '16px' }}
      />
    );
  }

  // Колонки для таблицы последних пользователей
  const userColumns = [
    {
      title: 'Пользователь',
      dataIndex: 'username',
      key: 'username',
      render: (text, record) => (
        <Space>
          <Avatar icon={<UserOutlined />} size="small" />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {record.email}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Админ' : 'Пользователь'}
        </Tag>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.gwars_verified && (
            <Tooltip title="GWars верифицирован">
              <CheckCircleOutlined style={{ color: 'green' }} />
            </Tooltip>
          )}
        </Space>
      ),
    },
    {
      title: 'Регистрация',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD.MM.YYYY'),
    },
  ];

  // Колонки для таблицы последних мероприятий
  const eventColumns = [
    {
      title: 'Мероприятие',
      dataIndex: 'title',
      key: 'title',
      render: (text, record) => (
        <Space>
          <CalendarOutlined />
          <div>
            <div>{text}</div>
            <Text type="secondary" style={{ fontSize: '12px' }}>
              ID: {record.unique_id}
            </Text>
          </div>
        </Space>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активно' : 'Неактивно'}
        </Tag>
      ),
    },
    {
      title: 'Создано',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD.MM.YYYY'),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <BarChartOutlined /> Панель управления
      </Title>
      
      {/* Основная статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Всего пользователей"
              value={stats.users.total}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Активных: {stats.users.active}
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Верифицированных"
              value={stats.users.verified}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Progress
                percent={stats.users.total > 0 ? Math.round((stats.users.verified / stats.users.total) * 100) : 0}
                size="small"
                status="active"
              />
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Мероприятий"
              value={stats.events.total}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Активных: {stats.events.active}
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Регистраций"
              value={stats.registrations.total}
              prefix={<TrophyOutlined />}
              valueStyle={{ color: '#fa8c16' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Подтверждено: {stats.registrations.confirmed}
              </Text>
            </div>
          </Card>
        </Col>
      </Row>

      {/* Дополнительная статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Интересов"
              value={stats.interests.total}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#eb2f96' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Активных: {stats.interests.active}
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="FAQ статей"
              value={stats.faq.total}
              prefix={<QuestionCircleOutlined />}
              valueStyle={{ color: '#13c2c2' }}
            />
            <div style={{ marginTop: '8px' }}>
              <Text type="secondary">
                Активных: {stats.faq.active}
              </Text>
            </div>
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Telegram подписчиков"
              value={stats.telegram.subscribers}
              prefix={<RobotOutlined />}
              valueStyle={{ color: '#2f54eb' }}
            />
          </Card>
        </Col>
        
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="Администраторов"
              value={stats.users.admins}
              prefix={<CrownOutlined />}
              valueStyle={{ color: '#f5222d' }}
            />
          </Card>
        </Col>
      </Row>

      {/* График регистраций по месяцам */}
      {stats.charts.monthly_registrations.length > 0 && (
        <Card title={<><LineChartOutlined /> Регистрации пользователей по месяцам</>} style={{ marginBottom: '24px' }}>
          <Row gutter={[8, 8]}>
            {stats.charts.monthly_registrations.map((item, index) => (
              <Col key={index} xs={12} sm={8} md={4}>
                <Card size="small">
                  <Statistic
                    title={moment(item.month, 'YYYY-MM').format('MMM YYYY')}
                    value={item.count}
                    valueStyle={{ fontSize: '16px' }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Последние пользователи и мероприятия */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title={<><UserOutlined /> Последние пользователи</>}>
            <Table
              dataSource={stats.recent.users}
              columns={userColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card title={<><CalendarOutlined /> Последние мероприятия</>}>
            <Table
              dataSource={stats.recent.events}
              columns={eventColumns}
              pagination={false}
              size="small"
              rowKey="id"
            />
          </Card>
        </Col>
      </Row>

      {/* Статистика по ролям */}
      {stats.users.roles.length > 0 && (
        <Card title="Распределение по ролям" style={{ marginTop: '24px' }}>
          <Row gutter={[16, 16]}>
            {stats.users.roles.map((role, index) => (
              <Col key={index} xs={12} sm={8} md={6}>
                <Card size="small">
                  <Statistic
                    title={role.role === 'admin' ? 'Администраторы' : 'Пользователи'}
                    value={role.count}
                    prefix={role.role === 'admin' ? <CrownOutlined /> : <UserOutlined />}
                    valueStyle={{ 
                      color: role.role === 'admin' ? '#f5222d' : '#1890ff',
                      fontSize: '18px'
                    }}
                  />
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      )}

      {/* Статистика регистраций */}
      <Card title="Статистика регистраций на мероприятия" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Всего регистраций"
                value={stats.registrations.total}
                prefix={<TrophyOutlined />}
                valueStyle={{ color: '#1890ff' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Предварительные"
                value={stats.registrations.preregistrations}
                prefix={<ClockCircleOutlined />}
                valueStyle={{ color: '#fa8c16' }}
              />
            </Card>
          </Col>
          <Col xs={24} sm={8}>
            <Card size="small">
              <Statistic
                title="Подтвержденные"
                value={stats.registrations.confirmed}
                prefix={<CheckCircleOutlined />}
                valueStyle={{ color: '#52c41a' }}
              />
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default AdminDashboard;
