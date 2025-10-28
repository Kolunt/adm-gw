import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Row, Col, Spin, Alert, Descriptions, Card, Avatar, Tag, Modal, Form, Input, message, Select } from 'antd';
import { UserOutlined, ArrowLeftOutlined, MailOutlined, PhoneOutlined, CalendarOutlined, EditOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { getUserAvatar } from '../../utils/avatarUtils';
import { useAuth } from '../../services/AuthService';

const { Title, Text, Paragraph } = Typography;
const { Option } = Select;

// Библиотека предустановленных аватарок
const AVATAR_LIBRARY = [
  { value: 'adventurer', label: 'Искатель приключений', url: 'https://api.dicebear.com/7.x/adventurer/svg?seed=' },
  { value: 'avataaars', label: 'Avataaars', url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=' },
  { value: 'big-smile', label: 'Большая улыбка', url: 'https://api.dicebear.com/7.x/big-smile/svg?seed=' },
  { value: 'bottts', label: 'Робот', url: 'https://api.dicebear.com/7.x/bottts/svg?seed=' },
  { value: 'croodles', label: 'Крудылы', url: 'https://api.dicebear.com/7.x/croodles/svg?seed=' },
  { value: 'fun-emoji', label: 'Веселый эмодзи', url: 'https://api.dicebear.com/7.x/fun-emoji/svg?seed=' },
  { value: 'icons', label: 'Иконки', url: 'https://api.dicebear.com/7.x/icons/svg?seed=' },
  { value: 'identicon', label: 'Идентикон', url: 'https://api.dicebear.com/7.x/identicon/svg?seed=' },
  { value: 'lorelei', label: 'Лорелей', url: 'https://api.dicebear.com/7.x/lorelei/svg?seed=' },
  { value: 'micah', label: 'Мика', url: 'https://api.dicebear.com/7.x/micah/svg?seed=' },
  { value: 'miniavs', label: 'Мини-аватары', url: 'https://api.dicebear.com/7.x/miniavs/svg?seed=' },
  { value: 'open-peeps', label: 'Открытые люди', url: 'https://api.dicebear.com/7.x/open-peeps/svg?seed=' },
  { value: 'personas', label: 'Персоны', url: 'https://api.dicebear.com/7.x/personas/svg?seed=' },
  { value: 'pixel-art', label: 'Пиксель-арт', url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=' },
  { value: 'rings', label: 'Кольца', url: 'https://api.dicebear.com/7.x/rings/svg?seed=' },
  { value: 'shapes', label: 'Фигуры', url: 'https://api.dicebear.com/7.x/shapes/svg?seed=' },
  { value: 'thumbs', label: 'Большие пальцы', url: 'https://api.dicebear.com/7.x/thumbs/svg?seed=' },
];

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: currentUser } = useAuth();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [form] = Form.useForm();
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUser();
    }
  }, [id]);

  const fetchUser = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/users/${id}`);
      setUser(response.data);
    } catch (error) {
      console.error('Error fetching user:', error);
      if (error.response?.status === 404) {
        setError('Пользователь не найден');
      } else {
        setError('Ошибка загрузки профиля пользователя');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    navigate('/users');
  };

  const canEditProfile = () => {
    if (!currentUser || !user) return false;
    return currentUser.id === parseInt(id) || currentUser.role === 'admin';
  };

  const handleEditProfile = () => {
    if (!canEditProfile()) return;
    
    form.setFieldsValue({
      name: user.name,
      phone_number: user.phone_number,
      telegram_username: user.telegram_username,
      bio: user.bio,
      interests: user.interests
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (values) => {
    try {
      // Если пользователь редактирует свой профиль, используем /auth/profile
      // Если админ редактирует чужой профиль, используем /users/{id}
      const endpoint = currentUser.id === parseInt(id) ? '/auth/profile' : `/users/${id}`;
      
      const response = await axios.put(endpoint, values);
      setUser(response.data);
      setEditModalVisible(false);
      message.success('Профиль обновлен');
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error('Ошибка обновления профиля');
    }
  };

  const handleAvatarSelect = async (avatarType) => {
    console.log('Avatar selection started:', { avatarType, userId: id, currentUserId: currentUser?.id });
    
    try {
      // Если пользователь редактирует свой профиль, используем /auth/profile
      // Если админ редактирует чужой профиль, используем /users/{id}
      const endpoint = currentUser.id === parseInt(id) ? '/auth/profile' : `/users/${id}`;
      
      console.log('Using endpoint:', endpoint);
      
      const response = await axios.put(endpoint, {
        avatar_type: avatarType
      });
      
      console.log('API response:', response.data);
      
      setUser(response.data);
      setAvatarModalVisible(false);
      message.success('Аватарка изменена');
    } catch (error) {
      console.error('Error updating avatar:', error);
      console.error('Error response:', error.response?.data);
      message.error('Ошибка изменения аватарки');
    }
  };

  const getAvatarUrl = (user) => {
    console.log('Getting avatar URL for user:', { user: user?.id, avatar_type: user?.avatar_type, avatar_seed: user?.avatar_seed });
    
    if (user.avatar_type && AVATAR_LIBRARY.find(avatar => avatar.value === user.avatar_type)) {
      const avatarConfig = AVATAR_LIBRARY.find(avatar => avatar.value === user.avatar_type);
      const url = `${avatarConfig.url}${user.avatar_seed || user.email}`;
      console.log('Using custom avatar:', url);
      return url;
    }
    
    const fallbackUrl = getUserAvatar(user, 120);
    console.log('Using fallback avatar:', fallbackUrl);
    return fallbackUrl;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Не указано';
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case 'admin':
        return 'red';
      case 'user':
        return 'green';
      default:
        return 'blue';
    }
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'admin':
        return 'Администратор';
      case 'user':
        return 'Пользователь';
      default:
        return role;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          action={
            <Button size="small" onClick={handleBack}>
              Вернуться к списку
            </Button>
          }
        />
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ padding: '24px' }}>
        <Alert
          message="Пользователь не найден"
          description="Запрашиваемый пользователь не существует или был удален"
          type="warning"
          showIcon
          action={
            <Button size="small" onClick={handleBack}>
              Вернуться к списку
            </Button>
          }
        />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={20}>
            <Space size="large">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                type="text"
              >
                Назад к списку
              </Button>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  <Space>
                    <UserOutlined />
                    Профиль пользователя
                  </Space>
                </Title>
                <Text type="secondary" style={{ color: '#ffffff' }}>
                  Подробная информация о пользователе
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Space>
              <Tag color={getRoleColor(user.role)} style={{ fontSize: '16px', padding: '8px 16px' }}>
                {getRoleText(user.role)}
              </Tag>
              {canEditProfile() && (
                <Button 
                  type="primary" 
                  icon={<EditOutlined />}
                  onClick={handleEditProfile}
                >
                  Редактировать
                </Button>
              )}
            </Space>
          </Col>
        </Row>
      </ProCard>

      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          {/* User Information */}
          <ProCard title="Основная информация" style={{ marginBottom: '24px' }}>
            <Descriptions
              column={1}
              bordered
              size="middle"
              items={[
                {
                  key: 'id',
                  label: 'ID пользователя',
                  children: (
                    <Text code style={{ color: '#ffffff' }}>{user.id}</Text>
                  ),
                },
                {
                  key: 'name',
                  label: 'Имя',
                  children: <Text style={{ color: '#ffffff' }}>{user.name || 'Не указано'}</Text>,
                },
                {
                  key: 'email',
                  label: 'Email',
                  children: (
                    <Space>
                      <MailOutlined />
                      <Text style={{ color: '#ffffff' }}>{user.email}</Text>
                    </Space>
                  ),
                },
                {
                  key: 'phone',
                  label: 'Телефон',
                  children: user.phone_number ? (
                    <Space>
                      <PhoneOutlined />
                      <Text style={{ color: '#ffffff' }}>{user.phone_number}</Text>
                    </Space>
                  ) : <Text style={{ color: '#ffffff' }}>Не указан</Text>,
                },
                {
                  key: 'telegram',
                  label: 'Telegram',
                  children: user.telegram_username ? (
                    <Text style={{ color: '#ffffff' }}>@{user.telegram_username}</Text>
                  ) : <Text style={{ color: '#ffffff' }}>Не указан</Text>,
                },
                {
                  key: 'role',
                  label: 'Роль',
                  children: (
                    <Tag color={getRoleColor(user.role)}>
                      {getRoleText(user.role)}
                    </Tag>
                  ),
                },
                {
                  key: 'created_at',
                  label: 'Дата регистрации',
                  children: (
                    <Space>
                      <CalendarOutlined />
                      <Text style={{ color: '#ffffff' }}>{formatDate(user.created_at)}</Text>
                    </Space>
                  ),
                },
                {
                  key: 'is_active',
                  label: 'Статус',
                  children: user.is_active ? (
                    <Tag color="green">Активен</Tag>
                  ) : (
                    <Tag color="red">Заблокирован</Tag>
                  ),
                },
              ]}
            />
          </ProCard>

          {/* Interests */}
          {user.interests && user.interests.length > 0 && (
            <ProCard title="Интересы" style={{ marginBottom: '24px' }}>
              <Space wrap>
                {user.interests.map((interest, index) => (
                  <Tag key={index} color="green">
                    {interest}
                  </Tag>
                ))}
              </Space>
            </ProCard>
          )}

          {/* Bio */}
          {user.bio && (
            <ProCard title="О себе">
              <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', color: '#ffffff' }}>
                {user.bio}
              </Paragraph>
            </ProCard>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Avatar */}
          <ProCard title="Аватар" style={{ marginBottom: '24px' }}>
            <div style={{ textAlign: 'center' }}>
              <Avatar
                size={120}
                src={getAvatarUrl(user)}
                icon={<UserOutlined />}
                style={{ 
                  backgroundColor: user.avatar_seed ? getUserAvatar(user.avatar_seed).backgroundColor : '#1890ff',
                  color: '#fff',
                  fontSize: '48px'
                }}
              />
              <div style={{ marginTop: '16px' }}>
                <Text strong style={{ fontSize: '18px', color: '#ffffff' }}>
                  {user.name || user.email}
                </Text>
              </div>
              {canEditProfile() && (
                <div style={{ marginTop: '16px' }}>
                  <Button 
                    type="primary"
                    onClick={() => setAvatarModalVisible(true)}
                    style={{
                      backgroundColor: '#2d5016',
                      borderColor: '#2d5016',
                      color: '#ffffff'
                    }}
                  >
                    Выбрать аватарку
                  </Button>
                </div>
              )}
            </div>
          </ProCard>

          {/* Quick Stats */}
          <ProCard title="Статистика">
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card size="small">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#ffffff' }}>Участие в мероприятиях</Text>
                  <Text type="secondary" style={{ color: '#ffffff' }}>
                    {user.events_count || 0} мероприятий
                  </Text>
                </Space>
              </Card>
              
              <Card size="small">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#ffffff' }}>Получено подарков</Text>
                  <Text type="secondary" style={{ color: '#ffffff' }}>
                    {user.gifts_received || 0} подарков
                  </Text>
                </Space>
              </Card>
              
              <Card size="small">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong style={{ color: '#ffffff' }}>Подарено подарков</Text>
                  <Text type="secondary" style={{ color: '#ffffff' }}>
                    {user.gifts_given || 0} подарков
                  </Text>
                </Space>
              </Card>
            </Space>
          </ProCard>
        </Col>
      </Row>

      {/* Modal для редактирования профиля */}
      <Modal
        title="Редактировать профиль"
        open={editModalVisible}
        onCancel={() => setEditModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveProfile}
        >
          <Form.Item
            name="name"
            label="Имя"
            rules={[
              { required: true, message: 'Пожалуйста, введите имя' },
              { min: 2, message: 'Имя должно содержать минимум 2 символа' }
            ]}
          >
            <Input placeholder="Введите имя" />
          </Form.Item>
          
          <Form.Item
            name="phone_number"
            label="Телефон"
            rules={[
              { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Введите корректный номер телефона' }
            ]}
          >
            <Input placeholder="+7 (999) 123-45-67" />
          </Form.Item>
          
          <Form.Item
            name="telegram_username"
            label="Telegram"
            rules={[
              { pattern: /^@?[a-zA-Z0-9_]{5,32}$/, message: 'Введите корректный username Telegram' }
            ]}
          >
            <Input placeholder="@username" />
          </Form.Item>
          
          <Form.Item
            name="bio"
            label="О себе"
            rules={[
              { max: 500, message: 'Описание не должно превышать 500 символов' }
            ]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Расскажите о себе..." 
            />
          </Form.Item>
          
          <Form.Item
            name="interests"
            label="Интересы"
            rules={[
              { max: 200, message: 'Интересы не должны превышать 200 символов' }
            ]}
          >
            <Input.TextArea 
              rows={3} 
              placeholder="Ваши интересы через запятую..." 
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
              <Button onClick={() => setEditModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      {/* Modal для выбора аватарки */}
      <Modal
        title="Выбрать аватарку"
        open={avatarModalVisible}
        onCancel={() => setAvatarModalVisible(false)}
        footer={null}
        width={800}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
          <Row gutter={[16, 16]}>
            {AVATAR_LIBRARY.map((avatar) => (
              <Col xs={12} sm={8} md={6} key={avatar.value}>
                <Card
                  hoverable
                  style={{ textAlign: 'center', cursor: 'pointer' }}
                  onClick={() => handleAvatarSelect(avatar.value)}
                  styles={{ body: { padding: '12px' } }}
                >
                  <Avatar
                    size={60}
                    src={`${avatar.url}${user?.avatar_seed || user?.email}`}
                    style={{ marginBottom: '8px' }}
                  />
                  <div>
                    <Text style={{ fontSize: '12px', color: '#ffffff' }}>
                      {avatar.label}
                    </Text>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Modal>
    </div>
  );
};

export default UserProfile;
