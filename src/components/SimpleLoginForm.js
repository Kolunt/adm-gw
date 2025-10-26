import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { LoginOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

function SimpleLoginForm({ onLogin }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/login', {
        email: values.email,
        password: values.password,
      });
      
      localStorage.setItem('token', response.data.access_token);
      message.success('Вход выполнен успешно!');
      
      // Получаем информацию о пользователе
      const userResponse = await axios.get('/auth/me', {
        headers: { Authorization: `Bearer ${response.data.access_token}` }
      });
      
      onLogin(userResponse.data);
    } catch (error) {
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Ошибка при входе');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'center' }}>
      <Card className="santa-card">
        <Title level={2} style={{ color: '#d63031', marginBottom: '30px' }}>
          🎅 Вход
        </Title>
        
        <Form
          name="login"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="email"
            rules={[
              { required: true, message: 'Пожалуйста, введите email!' },
              { type: 'email', message: 'Введите корректный email!' }
            ]}
          >
            <Input 
              prefix={<MailOutlined />} 
              placeholder="Email" 
            />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[
              { required: true, message: 'Пожалуйста, введите пароль!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Пароль" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<LoginOutlined />}
              block
              style={{ backgroundColor: '#d63031', borderColor: '#d63031' }}
            >
              Войти
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default SimpleLoginForm;
