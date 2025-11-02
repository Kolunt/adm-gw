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
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;
const { useApp } = App;

const AdminUsers = () => {
  const { message } = useApp();
  const { user: currentUser } = useAuth();
  const { isDark } = useTheme();
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
      title: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Удалить пользователя</span>,
      content: <div style={{ color: isDark ? '#ffffff' : '#000000' }}>Вы уверены, что хотите удалить этого пользователя?</div>,
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
      title: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Назначить администратором</span>,
      content: <div style={{ color: isDark ? '#ffffff' : '#000000' }}>Вы уверены, что хотите назначить пользователя "{user.name || user.email}" администратором?</div>,
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
      title: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Снять статус администратора</span>,
      content: <div style={{ color: isDark ? '#ffffff' : '#000000' }}>Вы уверены, что хотите снять статус администратора у пользователя "{user.name || user.email}"?</div>,
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
      title: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Заблокировать пользователя</span>,
      content: (
        <div style={{ color: isDark ? '#ffffff' : '#000000' }}>
          <p>Вы уверены, что хотите заблокировать пользователя "{user.name || user.email}"?</p>
          <p>Заблокированные пользователи не смогут войти в систему.</p>
          <div style={{ marginTop: '16px' }}>
            <label style={{ 
              display: 'block', 
              marginBottom: '8px', 
              fontWeight: 'bold',
              color: isDark ? '#ffffff' : '#000000'
            }}>
              Причина блокировки:
            </label>
            <textarea
              placeholder="Укажите причину блокировки пользователя..."
              style={{
                width: '100%',
                minHeight: '80px',
                padding: '8px',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9',
                borderRadius: '4px',
                backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
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
      title: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Разблокировать пользователя</span>,
      content: (
        <div style={{ color: isDark ? '#ffffff' : '#000000' }}>
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
      title: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>Удалить всех тестовых пользователей</span>,
      content: (
        <div style={{ color: isDark ? '#ffffff' : '#000000' }}>
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
      title: 'Никнейм персонажа',
      dataIndex: 'gwars_nickname',
      key: 'gwars_nickname',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold', color: isDark ? '#ffffff' : '#000000' }}>
            {text || 'Враг неизвестен'}
          </div>
          <div style={{ fontSize: '12px', color: isDark ? '#bfbfbf' : '#666' }}>{record.email}</div>
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
      render: (date) => (
        <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
          {new Date(date).toLocaleDateString('ru-RU')}
        </span>
      ),
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
                <TeamOutlined />
                Управление пользователями
              </Space>
            </Title>
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
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

      <ProCard style={{
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
      }}>
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
          style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          }}
        />
      </ProCard>

      {/* Модальное окно просмотра пользователя */}
      <Modal
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Информация о пользователе</span>}
        open={userModalVisible}
        onCancel={() => setUserModalVisible(false)}
        footer={[
          <Button 
            key="close" 
            onClick={() => setUserModalVisible(false)}
            style={{
              backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
              borderColor: isDark ? '#404040' : '#d9d9d9',
              color: isDark ? '#ffffff' : '#000000'
            }}
          >
            Закрыть
          </Button>,
        ]}
        width={800}
        styles={{
          content: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          },
          header: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            borderBottom: isDark ? '1px solid #404040' : '1px solid #f0f0f0'
          }
        }}
      >
        {selectedUser && (
          <Descriptions
            column={2}
            bordered
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            }}
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
                key: 'email',
                label: 'Email',
                children: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{selectedUser.email}</span>,
              },
              {
                key: 'full_name',
                label: 'Полное имя',
                children: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{selectedUser.full_name || 'Не указано'}</span>,
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
                children: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{selectedUser.phone_number || 'Не указан'}</span>,
              },
              {
                key: 'telegram_username',
                label: 'Telegram',
                children: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{selectedUser.telegram_username || 'Не указан'}</span>,
              },
              {
                key: 'address',
                label: 'Адрес',
                children: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{selectedUser.address || 'Не указан'}</span>,
                span: 2,
              },
              {
                key: 'interests',
                label: 'Интересы',
                children: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{selectedUser.interests || 'Не указаны'}</span>,
                span: 2,
              },
              {
                key: 'created_at',
                label: 'Дата регистрации',
                children: <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{new Date(selectedUser.created_at).toLocaleString('ru-RU')}</span>,
              },
            ]}
          />
        )}
      </Modal>
    </div>
  );
};

export default AdminUsers;
