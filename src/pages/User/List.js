import React, { useState, useEffect } from 'react';
import { Avatar, Tag, Space, Typography, Card, Row, Col, Spin, List, Button } from 'antd';
import { UserOutlined, GiftOutlined, TeamOutlined, EyeOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { generateAvatar } from '../../utils/avatarUtils';

const { Title, Text } = Typography;

const UserListPage = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (userId) => {
    navigate(`/users/${userId}`);
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
        <List
          dataSource={users}
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
                <Space key="actions">
                  <Tag color="green">
                    <GiftOutlined /> Участник
                  </Tag>
                  <Button 
                    type="primary" 
                    size="small"
                    icon={<EyeOutlined />}
                    onClick={() => handleViewProfile(user.id)}
                  >
                    Подробнее
                  </Button>
                </Space>
              ]}
            >
              <List.Item.Meta
                avatar={
                  <Avatar
                    size={64}
                    src={generateAvatar(user.avatar_seed || user.email)}
                    icon={<UserOutlined />}
                  />
                }
                title={
                  <Space>
                    <Text strong style={{ fontSize: '16px' }}>
                      {user.name || user.email}
                    </Text>
                    {user.role === 'admin' && (
                      <Tag color="red">Администратор</Tag>
                    )}
                  </Space>
                }
                description={
                  <Space direction="vertical" size="small">
                    <Text type="secondary">
                      {user.email}
                    </Text>
                    {user.full_name && (
                      <Text>{user.full_name}</Text>
                    )}
                    {user.interests && (
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Интересы: {user.interests}
                      </Text>
                    )}
                    {user.gwars_nickname && (
                      <Tag color="green">
                        GWars: {user.gwars_nickname}
                      </Tag>
                    )}
                  </Space>
                }
              />
            </List.Item>
          )}
        />
      </ProCard>
    </div>
  );
};

export default UserListPage;
