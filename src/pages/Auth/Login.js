import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, LoginOutlined } from '@ant-design/icons';
import ProForm from '@ant-design/pro-form';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

const LoginPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, isDark } = useTheme();
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    setLoading(true);
    setError('');
    
    const result = await login(values.email, values.password);
    
    if (result.success) {
      navigate('/');
    } else {
      setError(result.error);
    }
    
    setLoading(false);
  };

  return (
    <div className={`login-container ${theme}`} style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: isDark 
        ? 'linear-gradient(135deg, #001529 0%, #002140 100%)' 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px'
    }}>
      <Card className={`login-card ${theme}`} style={{ 
        width: '400px', 
        maxWidth: '100%', 
        boxShadow: isDark 
          ? '0 4px 12px rgba(0,0,0,0.5)' 
          : '0 4px 12px rgba(0,0,0,0.15)',
        background: isDark ? '#141414' : '#ffffff',
        border: isDark ? '1px solid #303030' : '1px solid #d9d9d9'
      }}>
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>🎅</div>
          <Title level={2}>Анонимный Дед Мороз</Title>
          <Text type="secondary">Войдите в систему</Text>
        </div>

        {error && (
          <Alert
            message="Ошибка входа"
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
                icon={<LoginOutlined />}
                size="large"
                style={{ width: '100%' }}
              >
                Войти
              </Button>
            ),
          }}
        >
          <ProForm.Item
            name="email"
            rules={[
              { required: true, message: 'Введите email' },
              { type: 'email', message: 'Введите корректный email' },
              { min: 6, message: 'Email должен содержать минимум 6 символов' }
            ]}
          >
            <Input
              prefix={<UserOutlined />}
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
        </ProForm>

        <Divider />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary">
            Нет аккаунта?{' '}
            <Link href="/register" strong>
              Зарегистрироваться
            </Link>
          </Text>
        </div>

            <div style={{ textAlign: 'center', marginTop: '16px' }}>
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Демо-аккаунт: admin@example.com / admin123
              </Text>
            </div>
      </Card>
    </div>
  );
};

export default LoginPage;
