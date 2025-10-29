import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Button, Modal, Tag, Avatar, Row, Col, Descriptions, App } from 'antd';
import { 
  UserOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  TeamOutlined,
  ReloadOutlined,
  EyeOutlined,
  CrownOutlined,
  UserDeleteOutlined,
  LockOutlined,
  UnlockOutlined
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from '../utils/axiosConfig';
import { getUserAvatar } from '../utils/avatarUtils';
import { useAuth } from '../services/AuthService';

const { Title, Text } = Typography;
const { useApp } = App;

const AdminUsers = () => {
  const { message } = useApp();
  const { user: currentUser } = useAuth();
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
    navigate(`/profile/${user.id}`);
  };

  const handlePromoteToAdmin = async (user) => {
    Modal.confirm({
      title: 'Назначить администратором',
      content: `Вы уверены, что хотите назначить пользователя "${user.name || user.email}" администратором?`,
      okText: 'Назначить',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await axios.post(`/admin/promote/${user.id}`);
          message.success('Пользователь назначен администратором');
          fetchUsers();
        } catch (error) {
          message.error(error.response?.data?.detail || 'Ошибка при назначении администратора');
          console.error('Error promoting user:', error);
        }
      },
    });
  };

  const handleDemoteFromAdmin = async (user) => {
    Modal.confirm({
      title: 'Снять статус администратора',
      content: `Вы уверены, что хотите снять статус администратора у пользователя "${user.name || user.email}"?`,
      okText: 'Снять',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await axios.post(`/admin/demote/${user.id}`);
          message.success('Статус администратора снят');
          fetchUsers();
        } catch (error) {
          message.error(error.response?.data?.detail || 'Ошибка при снятии статуса администратора');
          console.error('Error demoting user:', error);
        }
      },
    });
  };

  const handleBlockUser = async (user) => {
    let blockReason = '';
    
    Modal.confirm({
      title: <span style={{ color: '#ffffff' }}>Заблокировать пользователя</span>,
      content: (
        <div style={{ color: '#ffffff' }}>
          <p>Вы уверены, что хотите заблокировать пользователя "{user.name || user.email}"?</p>
          <p>Заблокированные пользователи не смогут войти в систему.</p>
          <div style={{ marginTop: '16px' }}>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold' }}>
              Причина блокировки:
            </label>
            <textarea
              placeholder="Укажите причину блокировки пользователя..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                border: '1px solid #d9d9d9',
                borderRadius: '4px',
                backgroundColor: '#ffffff',
                color: '#000000',
                resize: 'vertical'
              }}
              onChange={(e) => {
                blockReason = e.target.value;
              }}
            />
          </div>
        </div>
      ),
      okText: 'Заблокировать',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        if (!blockReason.trim()) {
          message.error('Пожалуйста, укажите причину блокировки');
          return Promise.reject();
        }
        
        try {
          await axios.post(`/admin/users/${user.id}/block`, {
            reason: blockReason.trim()
          });
          message.success('Пользователь заблокирован');
          fetchUsers();
        } catch (error) {
          message.error(error.response?.data?.detail || 'Ошибка при блокировке пользователя');
          console.error('Error blocking user:', error);
        }
      },
    });
  };

  const handleUnblockUser = async (user) => {
    Modal.confirm({
      title: <span style={{ color: '#ffffff' }}>Разблокировать пользователя</span>,
      content: (
        <div style={{ color: '#ffffff' }}>
          Вы уверены, что хотите разблокировать пользователя "{user.name || user.email}"?
        </div>
      ),
      okText: 'Разблокировать',
      okType: 'primary',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          await axios.post(`/admin/users/${user.id}/unblock`);
          message.success('Пользователь разблокирован');
          fetchUsers();
        } catch (error) {
          message.error(error.response?.data?.detail || 'Ошибка при разблокировке пользователя');
          console.error('Error unblocking user:', error);
        }
      },
    });
  };

  const handleDeleteAllTestUsers = async () => {
    Modal.confirm({
      title: <span style={{ color: '#ffffff' }}>Удалить всех тестовых пользователей</span>,
      content: (
        <div style={{ color: '#ffffff' }}>
          <p>Это действие нельзя отменить. Будут удалены все пользователи с меткой 'тест' и их данные.</p>
          <p style={{ fontWeight: 'bold', color: '#ff4d4f' }}>
            ВНИМАНИЕ: Это действие необратимо!
          </p>
        </div>
      ),
      okText: 'Удалить всех тестовых',
      okType: 'danger',
      cancelText: 'Отмена',
      onOk: async () => {
        try {
          const response = await axios.delete('/admin/users/test/delete-all');
          message.success(response.data.message);
          fetchUsers();
        } catch (error) {
          message.error(error.response?.data?.detail || 'Ошибка при удалении тестовых пользователей');
          console.error('Error deleting test users:', error);
        }
      },
    });
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
      title: 'GWars верификация',
      dataIndex: 'gwars_verified',
      key: 'gwars_verified',
      render: (verified) => (
        <Tag color={verified ? 'green' : 'orange'}>
          {verified ? 'Верифицирован' : 'Не верифицирован'}
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
      width: 200,
      render: (_, record) => (
        <Space>
          <Button 
            type="link" 
            icon={<EyeOutlined />}
            onClick={() => handleViewUser(record)}
            title="Просмотр"
          />
          {record.role === 'admin' ? (
            <Button 
              type="link" 
              danger
              icon={<UserDeleteOutlined />}
              onClick={() => handleDemoteFromAdmin(record)}
              title="Снять статус администратора"
              disabled={currentUser?.id === record.id}
            />
          ) : (
            <Button 
              type="link" 
              icon={<CrownOutlined />}
              onClick={() => handlePromoteToAdmin(record)}
              title="Назначить администратором"
              style={{ color: '#ff4d4f' }}
              disabled={currentUser?.id === record.id}
            />
          )}
          {record.is_active ? (
            <Button 
              type="link" 
              danger
              icon={<LockOutlined />}
              onClick={() => handleBlockUser(record)}
              title="Заблокировать пользователя"
              disabled={currentUser?.id === record.id}
            />
          ) : (
            <Button 
              type="link" 
              icon={<UnlockOutlined />}
              onClick={() => handleUnblockUser(record)}
              title="Разблокировать пользователя"
              style={{ color: '#52c41a' }}
            />
          )}
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
                danger
                icon={<DeleteOutlined />}
                onClick={handleDeleteAllTestUsers}
              >
                Удалить тестовых
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
