import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Space, Tag, Button, Divider, Row, Col, Spin } from 'antd';
import { UserOutlined, EditOutlined, GiftOutlined, CalendarOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import ProDescriptions from '@ant-design/pro-descriptions';
import { useAuth } from '../../services/AuthService';
import { getUserAvatar } from '../../utils/avatarUtils';
import axios from 'axios';

const { Title, Text } = Typography;

const UserProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfileData();
    }
  }, [user]);

  const fetchProfileData = async () => {
    try {
      const response = await axios.get('/auth/me');
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
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

  if (!profileData) {
    return (
      <div style={{ padding: '24px' }}>
        <Card>
          <div style={{ textAlign: 'center' }}>
            <Title level={3}>Профиль не найден</Title>
            <Text type="secondary">Не удалось загрузить данные профиля</Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              src={getUserAvatar(profileData)}
              icon={<UserOutlined />}
            />
            <div style={{ marginTop: '16px' }}>
              <Title level={3}>{profileData.name || profileData.email}</Title>
              {profileData.role === 'admin' && (
                <Tag color="red" style={{ marginTop: '8px' }}>
                  Администратор
                </Tag>
              )}
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>Основная информация</Title>
                <ProDescriptions
                  column={2}
                  dataSource={profileData}
                  columns={[
                    {
                      title: 'Email',
                      dataIndex: 'email',
                      copyable: true,
                    },
                    {
                      title: 'Имя пользователя',
                      dataIndex: 'name',
                    },
                    {
                      title: 'Полное имя',
                      dataIndex: 'full_name',
                    },
                    {
                      title: 'Дата регистрации',
                      dataIndex: 'created_at',
                      render: (text) => new Date(text).toLocaleDateString('ru-RU'),
                    },
                  ]}
                />
              </div>

              {profileData.gwars_nickname && (
                <div>
                  <Title level={4}>GWars.io профиль</Title>
                  <ProDescriptions
                    column={2}
                    dataSource={profileData}
                    columns={[
                      {
                        title: 'Никнейм',
                        dataIndex: 'gwars_nickname',
                      },
                      {
                        title: 'Статус верификации',
                        dataIndex: 'gwars_verified',
                        render: (verified) => (
                          <Tag color={verified ? 'green' : 'orange'}>
                            {verified ? 'Верифицирован' : 'Не верифицирован'}
                          </Tag>
                        ),
                      },
                    ]}
                  />
                </div>
              )}

              {profileData.interests && (
                <div>
                  <Title level={4}>Интересы</Title>
                  <Text>{profileData.interests}</Text>
                </div>
              )}

              {profileData.address && (
                <div>
                  <Title level={4}>Адрес</Title>
                  <Text>{profileData.address}</Text>
                </div>
              )}
            </Space>
          </Col>
        </Row>
      </ProCard>

      <Row gutter={[16, 16]}>
        <Col xs={24} md={12}>
          <ProCard
            title={
              <Space>
                <GiftOutlined />
                Мои подарки
              </Space>
            }
            extra={<Button type="link">Посмотреть все</Button>}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">Здесь будут отображаться ваши подарки</Text>
            </div>
          </ProCard>
        </Col>

        <Col xs={24} md={12}>
          <ProCard
            title={
              <Space>
                <CalendarOutlined />
                Участие в мероприятиях
              </Space>
            }
            extra={<Button type="link">Посмотреть все</Button>}
          >
            <div style={{ textAlign: 'center', padding: '20px' }}>
              <Text type="secondary">Здесь будут отображаться ваши мероприятия</Text>
            </div>
          </ProCard>
        </Col>
      </Row>
    </div>
  );
};

export default UserProfile;
