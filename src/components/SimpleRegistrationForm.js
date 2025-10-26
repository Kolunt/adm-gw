import React, { useState } from 'react';
import { Form, Input, Button, Card, Typography, message } from 'antd';
import { UserAddOutlined, MailOutlined, LockOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

function SimpleRegistrationForm({ onUserRegistered }) {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/auth/register', {
        email: values.email,
        password: values.password,
        confirm_password: values.confirm_password,
      });
      
      message.success('Регистрация успешна! Теперь вы можете войти.');
      onUserRegistered(response.data);
    } catch (error) {
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Ошибка при регистрации');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: window.innerWidth <= 768 ? '100%' : '400px', 
      margin: '0 auto', 
      textAlign: 'center',
      padding: window.innerWidth <= 768 ? '10px' : '0'
    }}>
      <Card className="santa-card">
        <Title level={2} style={{ 
          color: '#d63031', 
          marginBottom: window.innerWidth <= 768 ? '20px' : '30px',
          fontSize: window.innerWidth <= 768 ? '20px' : '24px'
        }}>
          🎅 Регистрация
        </Title>
        
        <Form
          name="register"
          onFinish={onFinish}
          layout="vertical"
          size={window.innerWidth <= 768 ? "middle" : "large"}
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
              { required: true, message: 'Пожалуйста, введите пароль!' },
              { min: 6, message: 'Пароль должен содержать минимум 6 символов!' }
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Пароль" 
            />
          </Form.Item>

          <Form.Item
            name="confirm_password"
            dependencies={['password']}
            rules={[
              { required: true, message: 'Пожалуйста, подтвердите пароль!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают!'));
                },
              }),
            ]}
          >
            <Input.Password 
              prefix={<LockOutlined />} 
              placeholder="Подтвердите пароль" 
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              icon={<UserAddOutlined />}
              block
              style={{ backgroundColor: '#d63031', borderColor: '#d63031' }}
            >
              Зарегистрироваться
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}

export default SimpleRegistrationForm;
