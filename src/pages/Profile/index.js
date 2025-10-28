import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Space, Tag, Button, Divider, Row, Col, Spin, Descriptions, Modal, Form, Input, message } from 'antd';
import { UserOutlined, EditOutlined, GiftOutlined, CalendarOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useAuth } from '../../services/AuthService';
import { getUserAvatar } from '../../utils/avatarUtils';
import axios from '../../utils/axiosConfig';

const { Title, Text } = Typography;

const UserProfile = () => {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editForm] = Form.useForm();

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

  const handleEditProfile = () => {
    editForm.setFieldsValue({
      name: profileData.name,
      full_name: profileData.full_name,
      phone_number: profileData.phone_number,
      telegram_username: profileData.telegram_username,
      address: profileData.address,
      interests: profileData.interests
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (values) => {
    try {
      await axios.put('/auth/profile', values);
      message.success('Профиль успешно обновлен!');
      setEditModalVisible(false);
      fetchProfileData(); // Обновляем данные профиля
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Ошибка при обновлении профиля');
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    editForm.resetFields();
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
              src={getUserAvatar(profileData.avatar_seed)}
              icon={<UserOutlined />}
            />
            <div style={{ marginTop: '16px' }}>
              <Title level={3}>{profileData.name || profileData.email}</Title>
              {profileData.role === 'admin' && (
                <Tag color="red" style={{ marginTop: '8px' }}>
                  Администратор
                </Tag>
              )}
              <Divider />
              <Button 
                type="primary" 
                icon={<EditOutlined />} 
                style={{ width: '100%' }}
                onClick={handleEditProfile}
              >
                Редактировать профиль
              </Button>
            </div>
          </Col>
          <Col xs={24} md={18}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <Title level={4}>Основная информация</Title>
                <Descriptions
                  column={2}
                  bordered
                  items={[
                    {
                      key: 'email',
                      label: 'Email',
                      children: profileData.email,
                    },
                    {
                      key: 'name',
                      label: 'Имя пользователя',
                      children: profileData.name,
                    },
                    {
                      key: 'full_name',
                      label: 'Полное имя',
                      children: profileData.full_name,
                    },
                    {
                      key: 'phone_number',
                      label: 'Телефон',
                      children: profileData.phone_number || 'Не указан',
                    },
                    {
                      key: 'telegram_username',
                      label: 'Telegram',
                      children: profileData.telegram_username || 'Не указан',
                    },
                    {
                      key: 'created_at',
                      label: 'Дата регистрации',
                      children: new Date(profileData.created_at).toLocaleDateString('ru-RU'),
                    },
                  ]}
                />
              </div>

              {profileData.gwars_nickname && (
                <div>
                  <Title level={4}>GWars.io профиль</Title>
                  <Descriptions
                    column={2}
                    bordered
                    items={[
                      {
                        key: 'gwars_nickname',
                        label: 'Никнейм',
                        children: profileData.gwars_nickname,
                      },
                      {
                        key: 'gwars_verified',
                        label: 'Статус верификации',
                        children: (
                          <Tag color={profileData.gwars_verified ? 'green' : 'orange'}>
                            {profileData.gwars_verified ? 'Верифицирован' : 'Не верифицирован'}
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

      {/* Модальное окно редактирования профиля */}
      <Modal
        title={
          <Space>
            <EditOutlined />
            Редактирование профиля
          </Space>
        }
        open={editModalVisible}
        onCancel={handleCancelEdit}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={editForm}
          layout="vertical"
          onFinish={handleSaveProfile}
        >
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="name"
                label="Имя пользователя"
                rules={[
                  { required: true, message: 'Введите имя пользователя' }
                ]}
              >
                <Input placeholder="Введите имя пользователя" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="full_name"
                label="Полное имя"
              >
                <Input placeholder="Введите полное имя" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name="phone_number"
                label="Номер телефона"
              >
                <Input placeholder="+7 (999) 123-45-67" />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name="telegram_username"
                label="Telegram"
              >
                <Input placeholder="@username" />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            name="address"
            label="Адрес"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Введите ваш адрес" 
            />
          </Form.Item>

          <Form.Item
            name="interests"
            label="Интересы"
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Опишите ваши интересы" 
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCancelEdit}>
                <CloseOutlined /> Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                <SaveOutlined /> Сохранить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserProfile;
