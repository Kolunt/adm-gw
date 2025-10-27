import React, { useState, useEffect, useCallback } from 'react';
import {
  Card,
  Button,
  Input,
  InputNumber,
  Table,
  Space,
  message,
  Popconfirm,
  Tag,
  Typography,
  Alert,
  Result
} from 'antd';
import {
  UserAddOutlined,
  DeleteOutlined,
  ReloadOutlined,
  ExclamationCircleOutlined,
  LockOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const TestUsersManagement = ({ user }) => {
  const [loading, setLoading] = useState(false);
  const [testUsers, setTestUsers] = useState([]);
  const [userCount, setUserCount] = useState(10);
  const [password, setPassword] = useState('test123');

  // Загружаем список тестовых пользователей
  const fetchTestUsers = useCallback(async () => {
    // Проверяем авторизацию перед выполнением
    if (!user || user.role !== 'admin') {
      return;
    }

    try {
      const response = await axios.get('/admin/testing');
      setTestUsers(response.data.users || []);
    } catch (error) {
      // Если ошибка авторизации, не показываем её
      if (error.response?.status === 401) {
        return;
      }
      // Для других ошибок показываем сообщение
      message.error('Ошибка при загрузке тестовых пользователей');
    }
  }, [user]);

  // Генерация тестовых пользователей
  const generateTestUsers = useCallback(async () => {
    // Проверяем авторизацию перед выполнением
    if (!user || user.role !== 'admin') {
      return;
    }

    if (userCount < 1 || userCount > 100) {
      message.error('Количество пользователей должно быть от 1 до 100');
      return;
    }

    if (!password.trim()) {
      message.error('Пароль не может быть пустым');
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/admin/generate-testing', {
        count: userCount,
        password: password
      });

      message.success(response.data.message);
      await fetchTestUsers();
    } catch (error) {
      // Если ошибка авторизации, не показываем её
      if (error.response?.status === 401) {
        return;
      }
      // Для других ошибок показываем сообщение
      message.error('Ошибка при создании тестовых пользователей');
    } finally {
      setLoading(false);
    }
  }, [user, userCount, password, fetchTestUsers]);

  // Удаление всех тестовых пользователей
  const deleteAllTestUsers = useCallback(async () => {
    // Проверяем авторизацию перед выполнением
    if (!user || user.role !== 'admin') {
      return;
    }

    setLoading(true);
    try {
      const response = await axios.delete('/admin/delete-testing');
      message.success(response.data.message);
      await fetchTestUsers();
    } catch (error) {
      // Если ошибка авторизации, не показываем её
      if (error.response?.status === 401) {
        return;
      }
      // Для других ошибок показываем сообщение
      message.error('Ошибка при удалении тестовых пользователей');
    } finally {
      setLoading(false);
    }
  }, [user, fetchTestUsers]);

  useEffect(() => {
    // Загружаем данные только если пользователь авторизован и является админом
    if (user && user.role === 'admin') {
      fetchTestUsers();
    }
  }, [user, fetchTestUsers]);

  // Проверяем авторизацию
  if (!user) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Доступ запрещен"
        icon={<LockOutlined />}
      />
    );
  }

  // Проверяем роль администратора
  if (user.role !== 'admin') {
    return (
      <Result
        status="403"
        title="403"
        subTitle="У вас нет прав доступа к управлению тестовыми пользователями"
        icon={<LockOutlined />}
      />
    );
  }

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 80,
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      width: 200,
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      width: 200,
    },
    {
      title: 'Username',
      dataIndex: 'username',
      key: 'username',
      width: 150,
    },
    {
      title: 'Статус',
      key: 'status',
      width: 100,
      render: () => (
        <Tag color="orange" icon={<ExclamationCircleOutlined />}>
          Тест
        </Tag>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 150,
      render: (date) => date ? new Date(date).toLocaleDateString() : '-',
    },
  ];

  return (
    <div>
      <Title level={2}>
        <UserAddOutlined /> Управление тестовыми пользователями
      </Title>
      
      <Alert
        message="Тестовые пользователи"
        description="Этот инструмент позволяет создавать тестовых пользователей для ручного тестирования системы. Все тестовые пользователи имеют одинаковый пароль и помечены специальным флагом."
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />

      <Card title="Генерация тестовых пользователей" style={{ marginBottom: 24 }}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Количество пользователей:</Text>
            <InputNumber
              min={1}
              max={100}
              value={userCount}
              onChange={setUserCount}
              style={{ marginLeft: 8, width: 120 }}
            />
          </div>
          
          <div>
            <Text strong>Пароль для всех пользователей:</Text>
            <Input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Введите пароль"
              style={{ marginLeft: 8, width: 200 }}
            />
          </div>

          <Button
            type="primary"
            icon={<UserAddOutlined />}
            onClick={generateTestUsers}
            loading={loading}
            disabled={!password.trim()}
          >
            Создать тестовых пользователей
          </Button>
        </Space>
      </Card>

      <Card 
        title={`Список тестовых пользователей (${testUsers.length})`}
        extra={
          <Space>
            <Button
              icon={<ReloadOutlined />}
              onClick={fetchTestUsers}
              loading={loading}
            >
              Обновить
            </Button>
            
            {testUsers.length > 0 && (
              <Popconfirm
                title="Удалить всех тестовых пользователей?"
                description="Это действие нельзя отменить. Будут удалены все тестовые пользователи и их данные."
                onConfirm={deleteAllTestUsers}
                okText="Да, удалить"
                cancelText="Отмена"
                okType="danger"
              >
                <Button
                  danger
                  icon={<DeleteOutlined />}
                  loading={loading}
                >
                  Удалить всех
                </Button>
              </Popconfirm>
            )}
          </Space>
        }
      >
        {testUsers.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <Text type="secondary">Тестовые пользователи не найдены</Text>
          </div>
        ) : (
          <Table
            columns={columns}
            dataSource={testUsers}
            rowKey="id"
            pagination={{
              pageSize: 10,
              showSizeChanger: true,
              showQuickJumper: true,
              showTotal: (total) => `Всего: ${total}`,
            }}
            size="small"
          />
        )}
      </Card>

      {testUsers.length > 0 && (
        <Card style={{ marginTop: 24 }}>
          <Title level={4}>Информация для тестирования</Title>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Пароль для всех тестовых пользователей:</Text>
              <Text code style={{ marginLeft: 8 }}>{password}</Text>
            </div>
            <div>
              <Text strong>Email тестовых пользователей:</Text>
              <Text style={{ marginLeft: 8 }}>
                test_user_1@test.com, test_user_2@test.com, и т.д.
              </Text>
            </div>
            <div>
              <Text strong>Все тестовые пользователи имеют:</Text>
              <ul style={{ marginTop: 8 }}>
                <li>Заполненный профиль</li>
                <li>Верифицированный GWars аккаунт</li>
                <li>Тестовые данные (адрес, интересы, контакты)</li>
                <li>Сгенерированную аватарку</li>
              </ul>
            </div>
          </Space>
        </Card>
      )}
    </div>
  );
};

export default TestUsersManagement;
