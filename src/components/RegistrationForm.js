import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Space } from 'antd';
import { UserOutlined, MailOutlined, GiftOutlined } from '@ant-design/icons';
import axios from 'axios';

const RegistrationForm = ({ onUserRegistered }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post('/users/', values);
      message.success('Регистрация прошла успешно!');
      onUserRegistered();
    } catch (error) {
      message.error('Ошибка при регистрации: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card 
        title={
          <Space>
            <UserOutlined style={{ color: '#d63031' }} />
            <span>Регистрация в Анонимном Дед Морозе</span>
          </Space>
        }
        className="santa-card"
      >
        <Form
          name="registration"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="name"
            label="Ваше имя"
            rules={[{ required: true, message: 'Пожалуйста, введите ваше имя!' }]}
          >
            <Input 
              prefix={<UserOutlined />} 
              placeholder="Как вас зовут?" 
            />
          </Form.Item>

          <Form.Item
            name="email"
            label="Email"
            rules={[
              { required: true, message: 'Пожалуйста, введите email!' },
              { type: 'email', message: 'Введите корректный email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="your@email.com" 
            />
          </Form.Item>

          <Form.Item
            name="wishlist"
            label="Список желаний"
            rules={[{ required: true, message: 'Пожалуйста, опишите что вы хотели бы получить!' }]}
          >
            <Input.TextArea 
              rows={4}
              placeholder="Опишите что вы хотели бы получить в подарок..."
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
              icon={<GiftOutlined />}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default RegistrationForm;
