import React, { useState, useEffect } from 'react';
import { Card, Avatar, Typography, Space, Tag, Button, Divider, Row, Col, Spin, Descriptions, Modal, Form, Input, App, Switch } from 'antd';
import { UserOutlined, EditOutlined, GiftOutlined, CalendarOutlined, SaveOutlined, CloseOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useAuth } from '../../services/AuthService';
import { getUserAvatar } from '../../utils/avatarUtils';
import axios from '../../utils/axiosConfig';
import { useParams, useNavigate } from 'react-router-dom';

const { Title, Text } = Typography;
const { useApp } = App;

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

// Функция для генерации вариантов аватаров для категории
const generateAvatarVariants = (avatarType, baseUrl, count = 24) => {
  const variants = [];
  // Используем фиксированные seed для каждой позиции, чтобы варианты всегда были одинаковыми
  const seedPatterns = [
    'user', 'person', 'avatar', 'profile', 'character', 'face', 'head',
    'human', 'people', 'random', 'unique', 'custom', 'individual',
    'different', 'various', 'diverse', 'mixed', 'combined', 'blended',
    'special', 'original', 'distinct', 'novel', 'fresh'
  ];
  
  for (let i = 0; i < count; i++) {
    // Используем фиксированные паттерны + индекс для создания стабильных seed
    const patternIndex = i % seedPatterns.length;
    const seedIndex = Math.floor(i / seedPatterns.length);
    // Убираем Math.random() для стабильности - используем только фиксированные значения
    const seed = `${seedPatterns[patternIndex]}_${avatarType}_${seedIndex}_${i}`;
    const url = `${baseUrl}${seed}`;
    variants.push({
      seed,
      url,
      // Проверка: URL должен содержать seed
      _debug: { seed, url, matches: url.includes(seed) }
    });
  }
  
  console.log(`Generated ${variants.length} variants for ${avatarType}:`, variants.map(v => ({ seed: v.seed, url: v.url })));
  return variants;
};

const UserProfile = () => {
  const { id: viewUserId } = useParams(); // ID пользователя для просмотра (если есть)
  const navigate = useNavigate();
  const { user } = useAuth();
  const { message } = useApp();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [avatarModalVisible, setAvatarModalVisible] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [avatarVariants, setAvatarVariants] = useState([]);
  const [avatarVariantsCache, setAvatarVariantsCache] = useState({}); // Кэш для вариантов
  const [editForm] = Form.useForm();

  // Определяем, смотрим ли мы свой профиль или чужой
  const isViewingOwnProfile = !viewUserId || (user && parseInt(viewUserId) === user.id);
  const targetUserId = viewUserId ? parseInt(viewUserId) : null;
  
  // Проверяем, может ли пользователь редактировать профиль
  const canEditProfile = () => {
    if (!user || !profileData) return false;
    // Можно редактировать свой профиль или чужой профиль, если ты администратор
    return isViewingOwnProfile || (user.role === 'admin' && targetUserId);
  };

  // Проверяем, может ли пользователь видеть личные данные
  const canViewPersonalData = () => {
    if (!profileData) return false;
    // Личные данные видны только владельцу профиля или администратору
    // Гости и обычные авторизованные пользователи (при просмотре чужого профиля) видят одинаковые данные (только публичные)
    if (!user) return false; // Гости не видят личные данные
    // Авторизованные пользователи видят личные данные только в своем профиле или если они администраторы
    return isViewingOwnProfile || user.role === 'admin';
  };

  useEffect(() => {
    if (isViewingOwnProfile && user) {
      fetchProfileData();
    } else if (targetUserId) {
      fetchUserProfile(targetUserId);
    } else if (!viewUserId && !user) {
      // Если нет пользователя и нет ID, сбрасываем загрузку
      setLoading(false);
    }
  }, [user, viewUserId, isViewingOwnProfile, targetUserId]);

  const fetchProfileData = async () => {
    try {
      setLoading(true);
      console.log('Fetching own profile data');
      const response = await axios.get('/auth/me');
      console.log('Profile data loaded:', response.data);
      console.log('GWars URL:', response.data.gwars_profile_url);
      console.log('GWars Nickname:', response.data.gwars_nickname);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching profile data:', error);
      console.error('Error response:', error.response);
      message.error('Ошибка загрузки профиля');
      setProfileData(null); // Сбрасываем данные при ошибке
    } finally {
      setLoading(false);
      console.log('Loading finished for own profile');
    }
  };

  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      console.log('Fetching user profile for ID:', userId);
      
      // Используем публичный эндпоинт для гостей и для авторизованных пользователей при просмотре чужого профиля
      // Приватный эндпоинт используется только для администраторов
      const isAdminViewing = user && user.role === 'admin';
      const endpoint = isAdminViewing ? `/users/${userId}` : `/users/${userId}/public`;
      const response = await axios.get(endpoint);
      console.log('User profile response:', response.data);
      setProfileData(response.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
      console.error('Error response:', error.response);
      if (error.response?.status === 404) {
        message.error('Пользователь не найден');
      } else if (error.response?.status === 401 || error.response?.status === 403) {
        message.error('Недостаточно прав для просмотра профиля');
      } else {
        message.error('Ошибка загрузки профиля пользователя');
      }
      setProfileData(null); // Сбрасываем данные при ошибке
    } finally {
      setLoading(false);
      console.log('Loading finished for user profile');
    }
  };

  const handleEditProfile = () => {
    editForm.setFieldsValue({
      name: profileData.name,
      email: profileData.email,
      full_name: profileData.full_name,
      phone_number: profileData.phone_number,
      telegram_username: profileData.telegram_username,
      address: profileData.address,
      interests: profileData.interests,
      gwars_profile_url: profileData.gwars_profile_url,
      gwars_nickname: profileData.gwars_nickname,
      gwars_verified: profileData.gwars_verified
    });
    setEditModalVisible(true);
  };

  const handleSaveProfile = async (values) => {
    try {
      // Если редактируем свой профиль, используем /auth/profile
      // Если администратор редактирует чужой профиль, используем /users/{id}
      const endpoint = isViewingOwnProfile ? '/auth/profile' : `/users/${targetUserId}`;
      
      const response = await axios.put(endpoint, values);
      message.success('Профиль успешно обновлен!');
      setEditModalVisible(false);
      
      // Обновляем данные профиля
      if (isViewingOwnProfile) {
        await fetchProfileData();
      } else {
        await fetchUserProfile(targetUserId);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      message.error(error.response?.data?.detail || 'Ошибка при обновлении профиля');
    }
  };

  const handleCancelEdit = () => {
    setEditModalVisible(false);
    editForm.resetFields();
  };

  const handleCategorySelect = (category) => {
    setSelectedCategory(category);
    // Проверяем кэш, если варианты уже были сгенерированы для этой категории, используем их
    if (avatarVariantsCache[category.value]) {
      setAvatarVariants(avatarVariantsCache[category.value]);
    } else {
      // Генерируем варианты для выбранной категории
      const variants = generateAvatarVariants(category.value, category.url, 24);
      setAvatarVariants(variants);
      // Сохраняем в кэш
      setAvatarVariantsCache(prev => ({ ...prev, [category.value]: variants }));
    }
  };

  const handleAvatarSelect = async (avatarSeed, categoryType = null) => {
    const categoryToUse = categoryType || selectedCategory;
    console.log('handleAvatarSelect called with:', {
      avatarSeed,
      categoryType,
      selectedCategory: selectedCategory?.value,
      categoryToUse: categoryToUse?.value,
      currentProfileData: profileData
    });
    
    if (!categoryToUse) {
      console.error('No category selected!');
      message.error('Ошибка: не выбрана категория аватара');
      return;
    }
    
    try {
      const requestData = {
        avatar_type: categoryToUse.value,
        avatar_seed: avatarSeed
      };
      console.log('Sending request with data:', requestData);
      
      const response = await axios.put('/auth/profile', requestData);
      console.log('Avatar saved, response:', response.data);
      console.log('Saved avatar_type:', response.data.avatar_type);
      console.log('Saved avatar_seed:', response.data.avatar_seed);
      console.log('Expected URL:', `${categoryToUse.url}${avatarSeed}`);
      console.log('Actual URL will be:', response.data.avatar_type && response.data.avatar_seed 
        ? `${AVATAR_LIBRARY.find(a => a.value === response.data.avatar_type)?.url || ''}${response.data.avatar_seed}`
        : 'N/A');
      
      // Проверяем, что сохраненные данные совпадают с отправленными
      if (response.data.avatar_type !== requestData.avatar_type) {
        console.error('ERROR: avatar_type mismatch!', {
          sent: requestData.avatar_type,
          received: response.data.avatar_type
        });
      }
      if (response.data.avatar_seed !== requestData.avatar_seed) {
        console.error('ERROR: avatar_seed mismatch!', {
          sent: requestData.avatar_seed,
          received: response.data.avatar_seed
        });
      }
      
      // Обновляем данные профиля для получения актуальных данных
      await fetchProfileData();
      
      // Дополнительная проверка после обновления
      const updatedResponse = await axios.get('/auth/me');
      console.log('Profile data after refresh:', updatedResponse.data);
      console.log('Final avatar_type:', updatedResponse.data.avatar_type);
      console.log('Final avatar_seed:', updatedResponse.data.avatar_seed);
      
      if (updatedResponse.data.avatar_seed !== avatarSeed) {
        console.error('CRITICAL ERROR: Seed changed after refresh!', {
          selected: avatarSeed,
          saved: updatedResponse.data.avatar_seed
        });
      }
      
      setProfileData(updatedResponse.data);
      setAvatarModalVisible(false);
      setSelectedCategory(null);
      setAvatarVariants([]);
      message.success('Аватарка успешно изменена!');
    } catch (error) {
      console.error('Error updating avatar:', error);
      message.error('Ошибка изменения аватарки');
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setAvatarVariants([]);
  };

  const getAvatarUrl = (user) => {
    if (!user) return getUserAvatar(user, 120);
    
    console.log('getAvatarUrl called with user:', {
      avatar_type: user.avatar_type,
      avatar_seed: user.avatar_seed,
      email: user.email,
      id: user.id
    });
    
    if (user.avatar_type && AVATAR_LIBRARY.find(avatar => avatar.value === user.avatar_type)) {
      const avatarConfig = AVATAR_LIBRARY.find(avatar => avatar.value === user.avatar_type);
      // Всегда используем сохраненный avatar_seed, если он есть
      // Fallback на email/id только если seed не был сохранен
      const seed = user.avatar_seed || user.email || user.id;
      const url = `${avatarConfig.url}${seed}`;
      console.log('Using library avatar:', {
        avatar_type: user.avatar_type,
        seed_used: seed,
        final_url: url
      });
      return url;
    }
    
    console.log('Using fallback avatar');
    return getUserAvatar(user, 120);
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
      {!isViewingOwnProfile && (
        <Button 
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/users')}
          style={{ marginBottom: '16px' }}
        >
          Назад к списку пользователей
        </Button>
      )}
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={6} style={{ textAlign: 'center' }}>
            <Avatar
              size={120}
              src={getAvatarUrl(profileData)}
              icon={<UserOutlined />}
            />
            <div style={{ marginTop: '16px' }}>
              <Title level={3}>{profileData.gwars_nickname || 'Враг неизвестен'}</Title>
              {profileData.role === 'admin' && (
                <Tag color="red" style={{ marginTop: '8px' }}>
                  Администратор
                </Tag>
              )}
              <Divider />
              {canEditProfile() && (
                <Space direction="vertical" style={{ width: '100%' }} size="small">
                  <Button 
                    type="primary" 
                    icon={<EditOutlined />} 
                    style={{ width: '100%' }}
                    onClick={handleEditProfile}
                  >
                    {isViewingOwnProfile ? 'Редактировать профиль' : 'Редактировать профиль (админ)'}
                  </Button>
                  {isViewingOwnProfile && (
                    <Button 
                      onClick={() => setAvatarModalVisible(true)}
                      style={{ width: '100%' }}
                    >
                      Выбрать аватарку
                    </Button>
                  )}
                </Space>
              )}
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
                    ...(canViewPersonalData() ? [
                      {
                        key: 'email',
                        label: 'Email',
                        children: profileData.email,
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
                    ] : []),
                    {
                      key: 'created_at',
                      label: 'Дата регистрации',
                      children: new Date(profileData.created_at).toLocaleDateString('ru-RU'),
                    },
                    {
                      key: 'is_active',
                      label: 'Статус',
                      children: profileData.is_active ? (
                        <Tag color="green">Активен</Tag>
                      ) : (
                        <div>
                          <Tag color="red" style={{ marginBottom: '8px' }}>Заблокирован</Tag>
                          {profileData.block_reason && (
                            <div style={{ marginTop: '8px' }}>
                              <Text type="secondary" style={{ fontSize: '12px', display: 'block' }}>
                                Причина: {profileData.block_reason}
                              </Text>
                            </div>
                          )}
                        </div>
                      ),
                    },
                    ...(canViewPersonalData() ? [
                      {
                        key: 'address',
                        label: 'Адрес для отправки подарков',
                        children: profileData.address || <Text type="secondary">Не указан</Text>,
                      },
                      {
                        key: 'interests',
                        label: 'Интересы',
                        children: profileData.interests || <Text type="secondary">Не указаны</Text>,
                      },
                    ] : [
                      {
                        key: 'privacy_notice',
                        label: 'Личные данные',
                        children: 'Скрыты для защиты конфиденциальности',
                        span: 2,
                      },
                    ]),
                  ]}
                />
              </div>

              <div>
                <Title level={4}>GWars.io профиль</Title>
                <Descriptions
                  column={2}
                  bordered
                  items={[
                    {
                      key: 'gwars_profile_url',
                      label: 'URL профиля',
                      children: profileData.gwars_profile_url ? (
                        <a 
                          href={profileData.gwars_profile_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#006400' }}
                        >
                          {profileData.gwars_profile_url}
                        </a>
                      ) : (
                        <Text type="secondary">Не указан</Text>
                      ),
                    },
                    {
                      key: 'gwars_nickname',
                      label: 'Никнейм',
                      children: profileData.gwars_nickname || <Text type="secondary">Не указан</Text>,
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

      {/* Модальное окно редактирования профиля - для своего профиля или для администратора */}
      {canEditProfile() && (
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
          {/* Email - только для администратора при редактировании чужого профиля */}
          {user?.role === 'admin' && !isViewingOwnProfile && (
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { type: 'email', message: 'Введите корректный email' }
              ]}
            >
              <Input placeholder="email@example.com" />
            </Form.Item>
          )}
          
          <Form.Item
            name="full_name"
            label="Полное имя"
          >
            <Input placeholder="Введите полное имя" />
          </Form.Item>

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

          {/* Дополнительные поля для администратора */}
          {user?.role === 'admin' && !isViewingOwnProfile && (
            <>
              <Divider orientation="left" style={{ color: 'white' }}>GWars профиль</Divider>
              <Row gutter={16}>
                <Col span={12}>
                  <Form.Item
                    name="gwars_profile_url"
                    label="URL профиля GWars"
                  >
                    <Input placeholder="https://gwars.io/profile/..." />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item
                    name="gwars_nickname"
                    label="Никнейм GWars"
                  >
                    <Input placeholder="Никнейм в GWars" />
                  </Form.Item>
                </Col>
              </Row>
              <Form.Item
                name="gwars_verified"
                label="Статус верификации GWars"
                valuePropName="checked"
              >
                <Switch />
              </Form.Item>
            </>
          )}

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
      )}

      {/* Модальное окно выбора аватара - только для своего профиля */}
      {isViewingOwnProfile && (
        <Modal
        title={
          <Space>
            {selectedCategory && (
              <Button 
                type="text" 
                icon={<ArrowLeftOutlined />}
                onClick={handleBackToCategories}
                style={{ marginLeft: '-16px' }}
              >
                Назад к категориям
              </Button>
            )}
            <span>{selectedCategory ? `Выбор аватара: ${selectedCategory.label}` : 'Выбрать категорию аватара'}</span>
          </Space>
        }
        open={avatarModalVisible}
        onCancel={() => {
          setAvatarModalVisible(false);
          setSelectedCategory(null);
          setAvatarVariants([]);
        }}
        footer={null}
        width={900}
      >
        <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
          {!selectedCategory ? (
            // Показываем список категорий
            <Row gutter={[16, 16]}>
              {AVATAR_LIBRARY.map((avatar) => (
                <Col xs={12} sm={8} md={6} key={avatar.value}>
                  <Card
                    hoverable
                    style={{ 
                      textAlign: 'center', 
                      cursor: 'pointer',
                      border: profileData?.avatar_type === avatar.value ? '2px solid #1890ff' : '1px solid #d9d9d9'
                    }}
                    onClick={() => handleCategorySelect(avatar)}
                    styles={{ body: { padding: '16px' } }}
                  >
                    <Avatar
                      size={80}
                      src={`${avatar.url}${profileData?.avatar_seed || profileData?.email || profileData?.id}`}
                      style={{ marginBottom: '12px' }}
                    />
                    <div>
                      <Text strong style={{ fontSize: '14px', display: 'block' }}>
                        {avatar.label}
                      </Text>
                      <Text type="secondary" style={{ fontSize: '12px' }}>
                        Выбрать категорию
                      </Text>
                    </div>
                  </Card>
                </Col>
              ))}
            </Row>
          ) : (
            // Показываем варианты внутри выбранной категории
            <div>
              <div style={{ marginBottom: '16px' }}>
                <Text type="secondary">
                  Выберите конкретный аватар из категории "{selectedCategory.label}". Показано {avatarVariants.length} вариантов.
                </Text>
              </div>
              <Row gutter={[12, 12]}>
                {avatarVariants.map((variant, index) => (
                  <Col xs={8} sm={6} md={4} lg={3} key={variant.seed}>
                    <Card
                      hoverable
                      style={{ 
                        textAlign: 'center', 
                        cursor: 'pointer',
                        border: profileData?.avatar_seed === variant.seed && profileData?.avatar_type === selectedCategory.value 
                          ? '2px solid #1890ff' 
                          : '1px solid #d9d9d9',
                        padding: '8px'
                      }}
                      onClick={() => {
                        // Проверяем, что seed совпадает с тем, что в URL
                        const expectedUrl = `${selectedCategory.url}${variant.seed}`;
                        const urlMatches = variant.url === expectedUrl;
                        
                        console.log('Avatar variant clicked:', {
                          variant_seed: variant.seed,
                          variant_url: variant.url,
                          expected_url: expectedUrl,
                          url_matches: urlMatches,
                          category: selectedCategory.value,
                          current_avatar_seed: profileData?.avatar_seed,
                          current_avatar_type: profileData?.avatar_type
                        });
                        
                        if (!urlMatches) {
                          console.error('WARNING: URL does not match seed!', {
                            variant_seed: variant.seed,
                            variant_url: variant.url,
                            expected_url: expectedUrl
                          });
                        }
                        
                        handleAvatarSelect(variant.seed, selectedCategory);
                      }}
                      styles={{ body: { padding: '8px' } }}
                    >
                      <Avatar
                        size={64}
                        src={variant.url}
                        style={{ marginBottom: '4px' }}
                      />
                    </Card>
                  </Col>
                ))}
              </Row>
            </div>
          )}
        </div>
      </Modal>
      )}
    </div>
  );
};

export default UserProfile;
