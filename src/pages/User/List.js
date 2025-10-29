import React, { useState, useEffect } from 'react';
import { Avatar, Tag, Space, Typography, Card, Row, Col, Spin, List, Button, App, message, Tabs, Modal } from 'antd';
import { UserOutlined, TeamOutlined, EyeOutlined, LinkOutlined, CheckCircleOutlined, StopOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { getUserAvatar } from '../../utils/avatarUtils';

const { Title, Text } = Typography;
const { useApp } = App;

const UserListPage = () => {
  const { message } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchParams, setSearchParams] = useSearchParams();
  const [blockReasonModalVisible, setBlockReasonModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const navigate = useNavigate();

  // Получаем активный таб из URL или используем 'all' по умолчанию
  const activeTab = searchParams.get('tab') || 'all';

  useEffect(() => {
    fetchUsers();
  }, []);

  // Обработчик изменения таба
  const handleTabChange = (tab) => {
    setSearchParams({ tab });
  };

  // Показать модальное окно с причиной блокировки
  const handleShowBlockReason = (user) => {
    setSelectedUser(user);
    setBlockReasonModalVisible(true);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from /users/');
      const response = await axios.get('/users/');
      console.log('Users response:', response.data);
      setUsers(response.data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
      console.error('Error response:', error.response);
      message.error('Ошибка при загрузке списка пользователей');
      setUsers([]); // Устанавливаем пустой массив при ошибке
    } finally {
      setLoading(false);
      console.log('Loading finished');
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/profile/${userId}`);
  };

  // Фильтрация пользователей по табам
  const getFilteredUsers = () => {
    switch (activeTab) {
      case 'verified':
        return users.filter(user => user.gwars_verified);
      case 'admins':
        return users.filter(user => user.role === 'admin'); // Администраторы: только admin
      case 'inactive':
        return users.filter(user => user.is_active === false); // Заблокированы: только false
      default:
        return users;
    }
  };

  const filteredUsers = getFilteredUsers();

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
                <TeamOutlined />
                Участники системы
              </Space>
            </Title>
            <Text type="secondary">
              Познакомьтесь с другими участниками анонимного обмена подарками
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Tag color="green" style={{ fontSize: '16px', padding: '8px 16px' }}>
              Всего участников: {users.length}
            </Tag>
          </Col>
        </Row>
      </ProCard>

      <ProCard>
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          items={[
            {
              key: 'all',
              label: (
                <Space>
                  <TeamOutlined />
                  Все ({users.length})
                </Space>
              ),
            },
            {
              key: 'verified',
              label: (
                <Space>
                  <CheckCircleOutlined />
                  Верифицированы ({users.filter(u => u.gwars_verified).length})
                </Space>
              ),
            },
            {
              key: 'admins',
              label: (
                <Space>
                  <UserOutlined />
                  Администраторы ({users.filter(u => u.role === 'admin').length})
                </Space>
              ),
            },
            {
              key: 'inactive',
              label: (
                <Space>
                  <StopOutlined />
                  Заблокированы ({users.filter(u => u.is_active === false).length})
                </Space>
              ),
            },
          ]}
        />
        
        <List
          dataSource={filteredUsers}
          rowKey="id"
          pagination={{
            pageSize: 12,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} из ${total} участников`,
          }}
          renderItem={(user) => (
            <List.Item
              actions={[
                <Button 
                  key="view"
                  type="primary" 
                  size="small"
                  icon={<EyeOutlined />}
                  onClick={() => handleViewProfile(user.id)}
                >
                  Подробнее
                </Button>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={64}
                    src={getUserAvatar(user, 64)}
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <Space size="small" wrap>
                    <Text strong style={{ fontSize: '16px' }}>
                      {user.gwars_nickname || 'Враг неизвестен'}
                    </Text>
                    {user.role === 'admin' && (
                      <Tag color="red">Администратор</Tag>
                    )}
                    <Tag color={user.gwars_verified ? 'green' : 'orange'}>
                      {user.gwars_verified ? '✓ Верифицирован' : 'Не верифицирован'}
                    </Tag>
                    <Tag 
                      color={user.is_active === true ? 'blue' : user.is_active === false ? 'red' : 'orange'}
                      style={user.is_active === false ? { cursor: 'pointer' } : {}}
                      onClick={user.is_active === false ? () => handleShowBlockReason(user) : undefined}
                    >
                      {user.is_active === true ? 'Активен' : user.is_active === false ? 'Заблокирован' : 'Неопределен'}
                    </Tag>
                    {user.gwars_profile_url && (
                      <a 
                        href={user.gwars_profile_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', color: '#006400' }}
                      >
                        <LinkOutlined style={{ color: '#006400' }} /> Ссылка на персонажа
                      </a>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </ProCard>

      {/* Модальное окно с причиной блокировки */}
      <Modal
        title="Причина блокировки пользователя"
        open={blockReasonModalVisible}
        onCancel={() => setBlockReasonModalVisible(false)}
        footer={[
          <Button key="close" onClick={() => setBlockReasonModalVisible(false)}>
            Закрыть
          </Button>,
        ]}
        width={600}
      >
        {selectedUser && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Пользователь: </Text>
              <Text>{selectedUser.gwars_nickname || selectedUser.name || selectedUser.email}</Text>
            </div>
            <div style={{ marginBottom: '16px' }}>
              <Text strong>Причина блокировки:</Text>
            </div>
            <div style={{
              padding: '16px',
              backgroundColor: '#f5f5f5',
              borderRadius: '6px',
              border: '1px solid #d9d9d9',
              minHeight: '100px',
              whiteSpace: 'pre-wrap'
            }}>
              {selectedUser.block_reason || 'Причина не указана'}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserListPage;
