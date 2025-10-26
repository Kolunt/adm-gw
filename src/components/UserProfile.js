import React, { useState, useEffect } from 'react';
import { Card, Typography, Button, Space, Tag, Divider, Row, Col, Avatar, message, Form, Input } from 'antd';
import { UserOutlined, EditOutlined, SaveOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

function UserProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
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
        interests: response.data.interests
      });
    } catch (error) {
      message.error('Ошибка при загрузке профиля');
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    setEditing(true);
  };

  const handleCancel = () => {
    setEditing(false);
    form.resetFields();
  };

  const handleSave = async (values) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put('/auth/profile', values, {
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
          <Avatar 
            size={80} 
            icon={<UserOutlined />} 
            style={{ backgroundColor: '#d63031', marginBottom: '16px' }}
          />
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

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          disabled={!editing}
        >
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
                <Input placeholder="https://www.gwars.io/info.php?id=..." />
              </Form.Item>
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

          <Divider />

          <div style={{ textAlign: 'center' }}>
            <Space size="middle">
              {editing ? (
                <>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    icon={<SaveOutlined />}
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
                >
                  Редактировать профиль
                </Button>
              )}
            </Space>
          </div>
        </Form>

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
    </div>
  );
}

export default UserProfile;
