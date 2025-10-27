import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, message, Modal, Tag, Avatar } from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TeamOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import ProTable from '@ant-design/pro-table';
import ProDescriptions from '@ant-design/pro-descriptions';
import axios from '../utils/axiosConfig';
import { getUserAvatar } from '../utils/avatarUtils';

const { Title, Text } = Typography;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/users/');
      setUsers(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке пользователей');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    Modal.confirm({
      title: 'Удалить пользователя',
      content: 'Вы уверены, что хотите удалить этого пользователя?',
      okText: 'Удалить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await axios.delete(`/admin/users/${userId}`);
          message.success('Пользователь удален');
          fetchUsers();
        } catch (error) {
          message.error('Ошибка при удалении пользователя');
          console.error('Error deleting user:', error);
        }
      },
    });
  };

  const handleViewUser = (user) => {
    setSelectedUser(user);
    setUserModalVisible(true);
  };

  const columns = [
    {
      title: 'Аватар',
      dataIndex: 'avatar',
      key: 'avatar',
      width: 80,
      render: (_, record) => (
        <Avatar 
          src={getUserAvatar(record, 40)} 
          icon={<UserOutlined />}
          size={40}
        />
      ),
    },
    {
      title: 'Имя',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text || record.username}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.email}</div>
        </div>
      ),
    },
    {
      title: 'Роль',
      dataIndex: 'role',
      key: 'role',
      render: (role) => (
        <Tag color={role === 'admin' ? 'red' : 'blue'}>
          {role === 'admin' ? 'Администратор' : 'Пользователь'}
        </Tag>
      ),
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
      title: 'Дата регистрации',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 150,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EditOutlined />}
            onClick={() => handleViewUser(record)}
          >
            Просмотр
          </Button>
          <Button 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
          >
            Удалить
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2}>
              <Space>
                <TeamOutlined />
                Управление пользователями
              </Space>
            </Title>
            <Text type="secondary">
              Просмотр и управление пользователями системы
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Space>
              <Button 
                icon={<ReloadOutlined />}
                onClick={fetchUsers}
                loading={loading}
              >
                Обновить
              </Button>
              <Button 
                type="primary"
                icon={<PlusOutlined />}
              >
                Добавить пользователя
              </Button>
            </Space>
          </Col>
        </Row>
      </ProCard>

      <ProCard>
        <ProTable
          columns={columns}
          dataSource={users}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} из ${total} пользователей`,
          }}
          search={false}
          options={{
            reload: fetchUsers,
            setting: true,
            density: true,
          }}
        />
      </ProCard>

      {/* Модальное окно просмотра пользователя */}
      <Modal
        title="Информация о пользователе"
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setUserModalVisible(false)}>
            Закрыть
          </Button>,
        ]}
        width={800}
      >
        {selectedUser && (
          <ProDescriptions
            column={2}
            bordered
            dataSource={selectedUser}
            columns={[
              {
                title: 'Аватар',
                dataIndex: 'avatar',
                render: () => (
                  <Avatar 
                    src={getUserAvatar(selectedUser, 80)} 
                    icon={<UserOutlined />}
                    size={80}
                  />
                ),
              },
              {
                title: 'Имя пользователя',
                dataIndex: 'username',
              },
              {
                title: 'Email',
                dataIndex: 'email',
              },
              {
                title: 'Полное имя',
                dataIndex: 'full_name',
              },
              {
                title: 'Роль',
                dataIndex: 'role',
                render: (role) => (
                  <Tag color={role === 'admin' ? 'red' : 'blue'}>
                    {role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </Tag>
                ),
              },
              {
                title: 'Статус',
                dataIndex: 'is_active',
                render: (isActive) => (
                  <Tag color={isActive ? 'green' : 'red'}>
                    {isActive ? 'Активен' : 'Неактивен'}
                  </Tag>
                ),
              },
              {
                title: 'Телефон',
                dataIndex: 'phone_number',
              },
              {
                title: 'Telegram',
                dataIndex: 'telegram_username',
              },
              {
                title: 'Адрес',
                dataIndex: 'address',
                span: 2,
              },
              {
                title: 'Интересы',
                dataIndex: 'interests',
                span: 2,
              },
              {
                title: 'Дата регистрации',
                dataIndex: 'created_at',
                render: (date) => new Date(date).toLocaleString('ru-RU'),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
