import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Table, Tag, InputNumber, Input, message, Modal, Popconfirm, Alert, Statistic, Row, Col } from 'antd';
import { ExperimentOutlined, BugOutlined, UserAddOutlined, DeleteOutlined, ReloadOutlined, TeamOutlined, CheckCircleOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;

const AdminTesting = () => {
  const { isDark } = useTheme();
  const [testUsers, setTestUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [userCount, setUserCount] = useState(10);
  const [password, setPassword] = useState('test123');

  useEffect(() => {
    fetchTestUsers();
  }, []);

  const fetchTestUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/testing');
      // API возвращает объект с полями count и users
      const users = Array.isArray(response.data.users) ? response.data.users : [];
      setTestUsers(users);
    } catch (error) {
      console.error('Error fetching test users:', error);
      message.error('Ошибка загрузки тестовых пользователей');
      setTestUsers([]); // Устанавливаем пустой массив в случае ошибки
    } finally {
      setLoading(false);
    }
  };

  const generateTestUsers = async () => {
    if (userCount < 1 || userCount > 100) {
      message.error('Количество пользователей должно быть от 1 до 100');
      return;
    }

    setGenerating(true);
    try {
      const response = await axios.post('/admin/generate-testing', {
        count: userCount,
        password: password
      });
      
      message.success(response.data.message);
      await fetchTestUsers();
    } catch (error) {
      console.error('Error generating test users:', error);
      message.error('Ошибка создания тестовых пользователей');
    } finally {
      setGenerating(false);
    }
  };

  const deleteTestUsers = async () => {
    setDeleting(true);
    try {
      const response = await axios.delete('/admin/delete-testing');
      message.success(response.data.message);
      await fetchTestUsers();
    } catch (error) {
      console.error('Error deleting test users:', error);
      message.error('Ошибка удаления тестовых пользователей');
    } finally {
      setDeleting(false);
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
      render: (id) => <Text code style={{ color: isDark ? '#ffffff' : '#000000' }}>{id}</Text>,
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>{text}</Text>,
    },
    {
      title: 'GWars',
      dataIndex: 'gwars_nickname',
      key: 'gwars_nickname',
      render: (text) => text ? <Tag color="green">{text}</Tag> : <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>Не указан</Text>,
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Тестовый',
      dataIndex: 'is_test',
      key: 'is_test',
      render: (isTest) => (
        <Tag color={isTest ? 'blue' : 'default'}>
          {isTest ? 'Да' : 'Нет'}
        </Tag>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => <Text style={{ color: isDark ? '#ffffff' : '#000000' }}>{new Date(date).toLocaleDateString('ru-RU')}</Text>,
    },
  ];

  const inputStyle = {
    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
  };

  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ padding: '24px' }}>
      <ProCard style={{ 
        marginBottom: '24px',
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
      }}>
        <Title level={2} style={{ color: isDark ? '#ffffff' : '#000000' }}>
          <Space>
            <ExperimentOutlined />
            Тестирование пользователей
          </Space>
        </Title>
        <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
          Создание и управление тестовыми пользователями для отладки системы
        </Text>
      </ProCard>

      {/* Статистика */}
      <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
        <Col xs={24} sm={8}>
          <ProCard style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <Statistic
              title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Всего тестовых пользователей</span>}
              value={Array.isArray(testUsers) ? testUsers.length : 0}
              prefix={<TeamOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={8}>
          <ProCard style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <Statistic
              title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Активных тестовых</span>}
              value={Array.isArray(testUsers) ? testUsers.filter(user => user.is_active).length : 0}
              prefix={<CheckCircleOutlined />}
              valueStyle={{ color: '#52c41a' }}
            />
          </ProCard>
        </Col>
        <Col xs={24} sm={8}>
          <ProCard style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <Statistic
              title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>С GWars профилем</span>}
              value={Array.isArray(testUsers) ? testUsers.filter(user => user.gwars_nickname).length : 0}
              prefix={<BugOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </ProCard>
        </Col>
      </Row>

      {/* Управление тестовыми пользователями */}
      <ProCard 
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Управление тестовыми пользователями</span>} 
        style={{ 
          marginBottom: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Alert
          message="Тестовые пользователи"
          description="Создавайте тестовых пользователей с меткой 'тест' для отладки системы. Все тестовые пользователи имеют единый пароль и заполненные профили."
          type="info"
          showIcon
          style={{ 
            marginBottom: '16px',
            backgroundColor: isDark ? '#2f2f2f' : '#e6f7ff',
            border: isDark ? '1px solid #404040' : '1px solid #91d5ff',
            color: isDark ? '#ffffff' : '#000000'
          }}
        />

        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={6}>
            <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Количество пользователей:</Text>
            <InputNumber
              min={1}
              max={100}
              value={userCount}
              onChange={setUserCount}
              style={{ width: '100%', marginTop: '8px', ...inputStyle }}
            />
          </Col>
          <Col xs={24} md={6}>
            <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Пароль для всех:</Text>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ marginTop: '8px', ...inputStyle }}
            />
          </Col>
          <Col xs={24} md={12}>
            <Space>
              <Button
                type="primary"
                icon={<UserAddOutlined />}
                onClick={generateTestUsers}
                loading={generating}
                style={{
                  backgroundColor: '#2d5016',
                  borderColor: '#2d5016',
                  color: '#ffffff'
                }}
              >
                Создать тестовых пользователей
              </Button>
              <Popconfirm
                title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Удалить всех тестовых пользователей?</span>}
                description={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Это действие нельзя отменить. Будут удалены все пользователи с меткой 'тест' и их данные.</span>}
                onConfirm={deleteTestUsers}
                okText="Да, удалить"
                cancelText="Отмена"
                okButtonProps={{ danger: true }}
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={deleting}
                  disabled={!Array.isArray(testUsers) || testUsers.length === 0}
                >
                  Удалить всех тестовых
                </Button>
              </Popconfirm>
              <Button
                icon={<ReloadOutlined />}
                onClick={fetchTestUsers}
                loading={loading}
                style={{
                  backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                  borderColor: isDark ? '#404040' : '#d9d9d9',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              >
                Обновить
              </Button>
            </Space>
          </Col>
        </Row>
      </ProCard>

      {/* Список тестовых пользователей */}
      <ProCard 
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Список тестовых пользователей</span>}
        style={{
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Table
          dataSource={testUsers}
          columns={columns}
          rowKey="id"
          loading={loading}
          style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          }}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} тестовых пользователей`,
          }}
          scroll={{ x: 800 }}
        />
      </ProCard>
    </div>
  );
};

export default AdminTesting;
