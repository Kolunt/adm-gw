import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Button, Space, Tag, Divider, Row, Col, message, Form, Input } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined, PhoneOutlined, MessageOutlined, PictureOutlined } from '@ant-design/icons';
import axios from 'axios';
import UserAvatar from './UserAvatar';
import UserGiftAssignments from './UserGiftAssignments';
import AvatarSelector from './AvatarSelector';

const { Title, Text } = Typography;

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [avatarSelectorVisible, setAvatarSelectorVisible] = useState(false);
  const [form] = Form.useForm();

  const fetchUserProfile = useCallback(async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUser(response.data);
      form.setFieldsValue({
        name: response.data.name,
        email: response.data.email,
        gwars_profile_url: response.data.gwars_profile_url,
        full_name: response.data.full_name,
        address: response.data.address,
        interests: response.data.interests,
        phone_number: response.data.phone_number,
        telegram_username: response.data.telegram_username
      });
    } catch (error) {
      message.error('Ошибка при загрузке профиля');
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleEdit = () => {
    console.log('Переключение в режим редактирования');
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    // Восстанавливаем исходные значения пользователя
    form.setFieldsValue({
      name: user.name,
      email: user.email,
      gwars_profile_url: user.gwars_profile_url,
      full_name: user.full_name,
      address: user.address,
      interests: user.interests,
      phone_number: user.phone_number,
      telegram_username: user.telegram_username
    });
  };

  const handleAvatarSelect = async (avatarSeed) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/auth/profile', 
        { avatar_seed: avatarSeed },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      // Обновляем локальное состояние пользователя
      setUser(prevUser => ({ ...prevUser, avatar_seed: avatarSeed }));
      
      // Перезагружаем профиль для получения актуальных данных
      await fetchUserProfile();
      
    } catch (error) {
      message.error('Ошибка при обновлении аватарки');
      console.error('Error updating avatar:', error);
      throw error; // Перебрасываем ошибку для обработки в AvatarSelector
    }
  };

  const handleSave = async (values) => {
    try {
      const token = localStorage.getItem('token');
      // Исключаем gwars_profile_url из данных для обычных пользователей
      const { gwars_profile_url, ...profileData } = values;
      await axios.put('/auth/profile', profileData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Профиль обновлен успешно');
      setEditing(false);
      fetchUserProfile();
    } catch (error) {
      message.error('Ошибка при обновлении профиля');
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <Card loading={true}>
        <Title level={3}>Загрузка профиля...</Title>
      </Card>
    );
  }

  if (!user) {
    return (
      <Card>
        <Title level={3}>Профиль не найден</Title>
        <Text type="secondary">Не удалось загрузить данные профиля</Text>
      </Card>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <Card>
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <UserAvatar 
            user={user}
            size={80} 
            style={{ marginBottom: '16px' }}
            showTooltip={true}
          />
          
          {/* Кнопка для выбора аватарки */}
          <div style={{ marginBottom: '16px' }}>
            <Button
              type="dashed"
              icon={<PictureOutlined />}
              onClick={() => setAvatarSelectorVisible(true)}
              style={{ 
                borderRadius: '20px',
                borderColor: '#1890ff',
                color: '#1890ff'
              }}
            >
              Изменить аватарку
            </Button>
          </div>
          
          <Title level={2} style={{ color: '#d63031', marginBottom: '8px' }}>
            {user.name}
          </Title>
          <Text type="secondary" style={{ fontSize: '16px' }}>
            {user.email}
          </Text>
          <div style={{ marginTop: '12px' }}>
            <Tag color={user.role === 'admin' ? 'red' : 'blue'}>
              {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
            </Tag>
            <Tag color={user.profile_completed ? 'green' : 'orange'}>
              {user.profile_completed ? 'Профиль завершен' : 'Профиль не завершен'}
            </Tag>
          </div>
        </div>

        <Divider />

        {/* Информация о GWars профиле */}
        {user.gwars_profile_url && (
          <div style={{ marginBottom: '24px' }}>
            <Title level={4} style={{ color: '#1890ff', marginBottom: '16px' }}>
              🎮 Профиль GWars.io
            </Title>
            <Row gutter={[16, 16]}>
              <Col xs={24} sm={12}>
                <div style={{ padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '6px' }}>
                  <Text strong>Никнейм:</Text>
                  <br />
                  <Text>{user.gwars_nickname || 'Не указан'}</Text>
                </div>
              </Col>
              <Col xs={24} sm={12}>
                <div style={{ padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '6px' }}>
                  <Text strong>Статус верификации:</Text>
                  <br />
                  <Tag color={user.gwars_verified ? 'green' : 'red'}>
                    {user.gwars_verified ? 'Верифицирован' : 'Не верифицирован'}
                  </Tag>
                </div>
              </Col>
              <Col xs={24}>
                <div style={{ padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '6px' }}>
                  <Text strong>Ссылка на профиль:</Text>
                  <br />
                  <a 
                    href={user.gwars_profile_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ color: '#1890ff' }}
                  >
                    {user.gwars_profile_url}
                  </a>
                </div>
              </Col>
            </Row>
          </div>
        )}

        {/* Дополнительная информация */}
        {(user.phone_number || user.telegram_username) && (
          <div style={{ marginBottom: '24px' }}>
            <Title level={4} style={{ color: '#1890ff', marginBottom: '16px' }}>
              📞 Контактная информация
            </Title>
            <Row gutter={[16, 16]}>
              {user.phone_number && (
                <Col xs={24} sm={12}>
                  <div style={{ padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '6px' }}>
                    <Text strong>Телефон:</Text>
                    <br />
                    <Text>{user.phone_number}</Text>
                  </div>
                </Col>
              )}
              {user.telegram_username && (
                <Col xs={24} sm={12}>
                  <div style={{ padding: '12px', backgroundColor: '#f0f2f5', borderRadius: '6px' }}>
                    <Text strong>Telegram:</Text>
                    <br />
                    <Text>{user.telegram_username}</Text>
                  </div>
                </Col>
              )}
            </Row>
          </div>
        )}

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={!editing}
        >
          {/* Отладочная информация */}
          {process.env.NODE_ENV === 'development' && (
            <div style={{ padding: '10px', backgroundColor: '#f0f0f0', marginBottom: '20px', borderRadius: '4px' }}>
              <Text type="secondary">
                Режим редактирования: {editing ? 'ВКЛЮЧЕН' : 'ВЫКЛЮЧЕН'}
              </Text>
            </div>
          )}
          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="name"
                label="Имя пользователя"
                rules={[{ required: true, message: 'Введите имя пользователя' }]}
              >
                <Input prefix={<UserOutlined />} />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="email"
                label="Email"
                rules={[
                  { required: true, message: 'Введите email' },
                  { type: 'email', message: 'Введите корректный email' }
                ]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24}>
              <Form.Item
                name="gwars_profile_url"
                label="Ссылка на профиль GWars.io"
              >
                <Input 
                  placeholder="https://www.gwars.io/info.php?id=..." 
                  disabled={true}
                  style={{ backgroundColor: '#f5f5f5' }}
                />
              </Form.Item>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                ⚠️ Изменение игрового профиля недоступно. Обратитесь к администратору для изменения ссылки на GWars профиль.
              </Text>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="full_name"
                label="Полное имя"
              >
                <Input placeholder="Иванов Иван Иванович" />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="address"
                label="Адрес"
              >
                <Input placeholder="г. Москва, ул. Примерная, д. 1" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24}>
              <Form.Item
                name="interests"
                label="Интересы"
              >
                <Input.TextArea 
                  rows={4} 
                  placeholder="Расскажите о своих интересах..."
                />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={[24, 16]}>
            <Col xs={24} sm={12}>
              <Form.Item
                name="phone_number"
                label="Номер телефона"
                rules={[
                  { 
                    pattern: /^(\+7|8)?[\s\-]?\(?[0-9]{3}\)?[\s\-]?[0-9]{3}[\s\-]?[0-9]{2}[\s\-]?[0-9]{2}$/, 
                    message: 'Введите корректный номер телефона' 
                  }
                ]}
              >
                <Input 
                  prefix={<PhoneOutlined />} 
                  placeholder="+7 (999) 123-45-67"
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12}>
              <Form.Item
                name="telegram_username"
                label="Telegram username"
                rules={[
                  { 
                    pattern: /^@?[a-zA-Z0-9_]{5,32}$/, 
                    message: 'Введите корректный Telegram username (например: @username)' 
                  }
                ]}
              >
                <Input 
                  prefix={<MessageOutlined />} 
                  placeholder="@username"
                />
              </Form.Item>
            </Col>
          </Row>

          <Divider />
        </Form>

        {/* Кнопки управления - вне формы, чтобы они всегда были активны */}
        <div style={{ textAlign: 'center', marginTop: '20px' }}>
          <Space size="middle">
            {editing ? (
              <>
                <Button 
                  type="primary" 
                  onClick={() => form.submit()}
                  icon={<SaveOutlined />}
                  style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                >
                  Сохранить
                </Button>
                <Button 
                  onClick={handleCancel}
                  icon={<CloseOutlined />}
                >
                  Отмена
                </Button>
              </>
            ) : (
              <Button 
                type="primary" 
                onClick={handleEdit}
                icon={<EditOutlined />}
                size="large"
                style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
              >
                Редактировать профиль
              </Button>
            )}
          </Space>
        </div>

        <Divider />

        <div>
          <Title level={4}>Статистика участия</Title>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#1890ff', margin: 0 }}>0</Title>
                <Text type="secondary">Мероприятий</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#52c41a', margin: 0 }}>0</Title>
                <Text type="secondary">Регистраций</Text>
              </Card>
            </Col>
            <Col xs={24} sm={8}>
              <Card size="small" style={{ textAlign: 'center' }}>
                <Title level={3} style={{ color: '#fa8c16', margin: 0 }}>0</Title>
                <Text type="secondary">Подтверждений</Text>
              </Card>
            </Col>
          </Row>
        </div>
      </Card>

      <UserGiftAssignments />
      
      {/* Модальное окно выбора аватарки */}
      <AvatarSelector
        visible={avatarSelectorVisible}
        onCancel={() => setAvatarSelectorVisible(false)}
        onSelect={handleAvatarSelect}
        currentAvatarSeed={user.avatar_seed}
      />
    </div>
  );
}

export default UserProfile;
