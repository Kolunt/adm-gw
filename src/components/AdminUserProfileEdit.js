import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Typography, Space, Tag, Divider, Row, Col, Spin, Switch, Tooltip } from 'antd';
import { UserOutlined, MailOutlined, CrownOutlined, CalendarOutlined, EnvironmentOutlined, HeartOutlined, ArrowLeftOutlined, SaveOutlined, CheckCircleOutlined, CloseCircleOutlined, LinkOutlined } from '@ant-design/icons';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

function AdminUserProfileEdit() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (userId) {
      fetchUserProfile();
    }
  }, [userId]);

  const fetchUserProfile = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`/users/${userId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setUser(response.data);
      
      // Заполняем форму данными пользователя
      form.setFieldsValue({
        name: response.data.name,
        email: response.data.email,
        full_name: response.data.full_name,
        address: response.data.address,
        interests: response.data.interests,
        gwars_profile_url: response.data.gwars_profile_url,
        gwars_nickname: response.data.gwars_nickname,
        gwars_verified: response.data.gwars_verified,
        gwars_verification_token: response.data.gwars_verification_token,
      });
    } catch (error) {
      message.error('Ошибка при загрузке профиля пользователя');
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      const values = await form.validateFields();
      setSaving(true);
      
      await axios.put(`/users/${userId}`, values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      message.success('Профиль пользователя обновлен');
      
      // Обновляем локальное состояние
      setUser(prev => ({ ...prev, ...values }));
      
    } catch (error) {
      message.error('Ошибка при сохранении профиля');
      console.error('Error saving user profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleBack = () => {
    navigate('/admin/users');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Загрузка профиля пользователя...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Text type="secondary">Пользователь не найден</Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <Space>
            <Button 
              icon={<ArrowLeftOutlined />} 
              onClick={handleBack}
              type="default"
            >
              Назад к списку пользователей
            </Button>
          </Space>
        </div>

        <Title level={2}>
          <UserOutlined /> Редактирование профиля пользователя
        </Title>

        <Row gutter={[24, 24]}>
          <Col xs={24} lg={12}>
            <Card title="Основная информация" size="small">
              <Form
                form={form}
                layout="vertical"
                onFinish={handleSave}
              >
                <Form.Item
                  name="name"
                  label="Имя пользователя"
                  rules={[{ required: true, message: 'Введите имя пользователя' }]}
                >
                  <Input prefix={<UserOutlined />} />
                </Form.Item>

                <Form.Item
                  name="email"
                  label="Email"
                  rules={[
                    { required: true, message: 'Введите email' },
                    { type: 'email', message: 'Введите корректный email' }
                  ]}
                >
                  <Input prefix={<MailOutlined />} />
                </Form.Item>

                <Form.Item
                  name="full_name"
                  label="Полное имя"
                >
                  <Input />
                </Form.Item>

                <Form.Item
                  name="address"
                  label="Адрес"
                >
                  <TextArea rows={3} />
                </Form.Item>

                <Form.Item
                  name="interests"
                  label="Интересы"
                >
                  <TextArea rows={3} />
                </Form.Item>

                <Form.Item>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    icon={<SaveOutlined />}
                    loading={saving}
                    size="large"
                  >
                    Сохранить изменения
                  </Button>
                </Form.Item>
              </Form>
            </Card>
          </Col>

          <Col xs={24} lg={12}>
            <Card title="Информация о профиле" size="small">
              <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                <div>
                  <Text strong>Роль:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Tag color={user.role === 'admin' ? 'red' : 'blue'} icon={<CrownOutlined />}>
                      {user.role === 'admin' ? 'Администратор' : 'Пользователь'}
                    </Tag>
                  </div>
                </div>

                <div>
                  <Text strong>Статус профиля:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Tag color={user.profile_completed ? 'green' : 'orange'}>
                      {user.profile_completed ? 'Завершен' : 'Не завершен'}
                    </Tag>
                  </div>
                </div>

                <div>
                  <Text strong>Дата регистрации:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Text>{new Date(user.created_at).toLocaleDateString()}</Text>
                  </div>
                </div>

                {user.gwars_nickname && (
                  <div>
                    <Text strong>GWars никнейм:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <Tag color="purple">{user.gwars_nickname}</Tag>
                    </div>
                  </div>
                )}

                {user.gwars_profile_url && (
                  <div>
                    <Text strong>GWars профиль:</Text>
                    <div style={{ marginTop: '4px' }}>
                      <a 
                        href={user.gwars_profile_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                      >
                        {user.gwars_profile_url}
                      </a>
                    </div>
                  </div>
                )}

                <div>
                  <Text strong>Статус верификации GWars:</Text>
                  <div style={{ marginTop: '4px' }}>
                    <Tag 
                      color={user.gwars_verified ? 'green' : 'red'} 
                      icon={user.gwars_verified ? <CheckCircleOutlined /> : <CloseCircleOutlined />}
                    >
                      {user.gwars_verified ? 'Верифицирован' : 'Не верифицирован'}
                    </Tag>
                  </div>
                </div>

                <Divider />

                <Card title="GWars информация" size="small">
                  <Form.Item
                    name="gwars_profile_url"
                    label="Ссылка на GWars профиль"
                  >
                    <Input prefix={<LinkOutlined />} />
                  </Form.Item>

                  <Form.Item
                    name="gwars_nickname"
                    label="GWars никнейм"
                  >
                    <Input />
                  </Form.Item>

                  <Form.Item
                    name="gwars_verified"
                    label="Статус верификации"
                    valuePropName="checked"
                  >
                    <Switch 
                      checkedChildren="Верифицирован" 
                      unCheckedChildren="Не верифицирован"
                    />
                  </Form.Item>

                  <Form.Item
                    name="gwars_verification_token"
                    label="Токен верификации"
                  >
                    <Input.Password placeholder="Токен для верификации GWars профиля" />
                  </Form.Item>
                </Card>
              </Space>
            </Card>
          </Col>
        </Row>
      </Card>
    </div>
  );
}

export default AdminUserProfileEdit;
