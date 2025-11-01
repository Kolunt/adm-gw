import React, { useState } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Divider } from 'antd';
import { UserOutlined, LockOutlined, MailOutlined, UserAddOutlined } from '@ant-design/icons';
import ProForm from '@ant-design/pro-form';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../services/AuthService';
import { useNavigate } from 'react-router-dom';

const { Title, Text, Link } = Typography;

const RegisterPage = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { theme, isDark } = useTheme();
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
    <div className={`register-container ${theme}`} style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      alignItems: 'center', 
      justifyContent: 'center',
      background: isDark 
        ? 'linear-gradient(135deg, #030a03 0%, #081f08 100%)' 
        : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      padding: '16px'
    }}>
      <Card className={`register-card ${isDark ? 'dark-theme' : 'light-theme'}`} style={{ 
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
          <Title level={2} style={{ color: isDark ? '#ffffff' : '#000000' }}>Анонимный Дед Мороз</Title>
          <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Создайте аккаунт</Text>
        </div>

        {error && (
          <Alert
            message="Ошибка регистрации"
            description={error}
            type="error"
            style={{
              marginBottom: '16px',
              backgroundColor: isDark ? '#2f2f2f' : '#fff2f0',
              border: isDark ? '1px solid #404040' : '1px solid #ffccc7',
              color: isDark ? '#ffffff' : '#000000'
            }}
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
              { type: 'email', message: 'Введите корректный email' },
              { min: 6, message: 'Email должен содержать минимум 6 символов' }
            ]}
          >
            <Input
              prefix={<MailOutlined />}
              placeholder="Email"
              size="large"
              style={{
                backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}
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
              style={{
                backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}
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
              style={{
                backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                color: isDark ? '#ffffff' : '#000000',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}
            />
          </ProForm.Item>
        </ProForm>

        <Divider style={{ borderColor: isDark ? '#404040' : '#f0f0f0' }} />

        <div style={{ textAlign: 'center' }}>
          <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
            Уже есть аккаунт?{' '}
            <Link href="/login" strong style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
              Войти
            </Link>
          </Text>
        </div>
      </Card>
    </div>
  );
};

export default RegisterPage;
