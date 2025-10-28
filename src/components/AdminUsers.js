import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, message, Modal, Tag, Avatar, Row, Col, Descriptions } from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TeamOutlined,
  ReloadOutlined,
  EyeOutlined
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { getUserAvatar } from '../utils/avatarUtils';

const { Title, Text } = Typography;

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const navigate = useNavigate();

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
    navigate(`/users/${user.id}`);
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
        <Tag color={role === 'admin' ? 'red' : 'green'}>
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
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record)}
            title="Просмотр"
          />
          <Button 
            type="link" 
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDeleteUser(record.id)}
            title="Удалить"
          />
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
        <Table
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
          <Descriptions
            column={2}
            bordered
            items={[
              {
                key: 'avatar',
                label: 'Аватар',
                children: (
                  <Avatar 
                    src={getUserAvatar(selectedUser, 80)} 
                    icon={<UserOutlined />}
                    size={80}
                  />
                ),
              },
              {
                key: 'username',
                label: 'Имя пользователя',
                children: selectedUser.username,
              },
              {
                key: 'email',
                label: 'Email',
                children: selectedUser.email,
              },
              {
                key: 'full_name',
                label: 'Полное имя',
                children: selectedUser.full_name,
              },
              {
                key: 'role',
                label: 'Роль',
                children: (
                  <Tag color={selectedUser.role === 'admin' ? 'red' : 'green'}>
                    {selectedUser.role === 'admin' ? 'Администратор' : 'Пользователь'}
                  </Tag>
                ),
              },
              {
                key: 'is_active',
                label: 'Статус',
                children: (
                  <Tag color={selectedUser.is_active ? 'green' : 'red'}>
                    {selectedUser.is_active ? 'Активен' : 'Неактивен'}
                  </Tag>
                ),
              },
              {
                key: 'phone_number',
                label: 'Телефон',
                children: selectedUser.phone_number || 'Не указан',
              },
              {
                key: 'telegram_username',
                label: 'Telegram',
                children: selectedUser.telegram_username || 'Не указан',
              },
              {
                key: 'address',
                label: 'Адрес',
                children: selectedUser.address || 'Не указан',
                span: 2,
              },
              {
                key: 'interests',
                label: 'Интересы',
                children: selectedUser.interests || 'Не указаны',
                span: 2,
              },
              {
                key: 'created_at',
                label: 'Дата регистрации',
                children: new Date(selectedUser.created_at).toLocaleString('ru-RU'),
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
