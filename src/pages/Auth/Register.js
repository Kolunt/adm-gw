import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import ProForm from '@ant-design/pro-form';
import { useAuth } from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    const result = await register(values.email, values.password, values.confirmPassword);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <Card style={{ width: '400px', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎅</div>
          <Title level={2}>Анонимный Дед Мороз</Title>
          <Text type="secondary">Создайте аккаунт</Text>
        </div>

        {error && (
          <Alert
            message="Ошибка регистрации"
            description={error}
            type="error"
            style={{ marginBottom: '16px' }}
            showIcon
          />
        )}

        <ProForm
          onFinish={handleSubmit}
          submitter={{
            render: (props, dom) => (
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<UserAddOutlined />}
                size="large"
                style={{ width: '100%' }}
              >
                Зарегистрироваться
              </Button>
            ),
          }}
        >
          <ProForm.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Введите корректный email' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
            />
          </ProForm.Item>

          <ProForm.Item
            name="password"
            rules={[
              { required: true, message: 'Введите пароль' },
              { min: 6, message: 'Пароль должен содержать минимум 6 символов' }
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Пароль"
              size="large"
            />
          </ProForm.Item>

          <ProForm.Item
            name="confirmPassword"
            rules={[
              { required: true, message: 'Подтвердите пароль' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Пароли не совпадают'));
                },
              }),
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="Подтвердите пароль"
              size="large"
            />
          </ProForm.Item>
        </ProForm>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Уже есть аккаунт?{' '}
            <Link href="/login" strong>
              Войти
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
