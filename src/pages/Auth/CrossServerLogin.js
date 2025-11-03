import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Alert, Spin, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, ReloadOutlined, LoginOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useTheme } from '../../contexts/ThemeContext';
import { useAuth } from '../../services/AuthService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const CrossServerLogin = () => {
  const { isDark } = useTheme();
  const { fetchUserProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState(null); // 'success', 'error', 'processing'
  const [message, setMessage] = useState('');
  const [debugInfo, setDebugInfo] = useState(null);

  // Определяем URL для редиректа обратно
  // В продакшене используем реальный домен, в разработке можно использовать production URL
  const getReturnUrl = () => {
    // Проверяем переменную окружения или используем production URL для кросс-серверного логина
    const productionUrl = process.env.REACT_APP_CROSS_SERVER_REDIRECT_URL || 'https://gwadm.pythonanywhere.com';
    const isProduction = process.env.NODE_ENV === 'production';
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    // Если локальная разработка, используем production URL для кросс-серверного логина
    // Это необходимо, так как GWars проверяет домен
    if (!isProduction && isLocalhost) {
      return `${productionUrl}/my_login_page`;
    }
    
    // В продакшене используем текущий URL
    const protocol = window.location.protocol;
    const hostname = window.location.hostname;
    const port = window.location.port ? `:${window.location.port}` : '';
    return `${protocol}//${hostname}${port}/my_login_page`;
  };

  // URL для авторизации через GWars
  const getGwarsAuthUrl = () => {
    const returnUrl = encodeURIComponent(getReturnUrl());
    return `https://www.gwars.io/cross-server-login.php?site_id=4&url=${returnUrl}`;
  };

  const handleGwarsAuth = () => {
    window.location.href = getGwarsAuthUrl();
  };

  useEffect(() => {
    // Проверяем наличие обязательных параметров перед вызовом
    const sign = searchParams.get('sign');
    const name = searchParams.get('name');
    const user_id = searchParams.get('user_id');
    
    if (sign && name && user_id) {
      handleCrossServerLogin();
    } else {
      setLoading(false);
      setStatus('error');
      setMessage('Отсутствуют обязательные параметры для кросс-серверного логина. Эта страница используется для авторизации через GWars.io.');
      setDebugInfo({
        sign: sign || '(отсутствует)',
        name: name || '(отсутствует)',
        user_id: user_id || '(отсутствует)',
        level: searchParams.get('level') || '(отсутствует)',
        synd: searchParams.get('synd') || '(отсутствует)',
        sign2: searchParams.get('sign2') || '(отсутствует)',
        has_passport: searchParams.get('has_passport') || '(отсутствует)',
        has_mobile: searchParams.get('has_mobile') || '(отсутствует)',
        old_passport: searchParams.get('old_passport') || '(отсутствует)',
        sign3: searchParams.get('sign3') || '(отсутствует)',
        usersex: searchParams.get('usersex') || '(отсутствует)',
        sign4: searchParams.get('sign4') || '(отсутствует)',
      });
    }
  }, [searchParams]);

  const handleCrossServerLogin = async () => {
    setLoading(true);
    setStatus('processing');
    setMessage('Проверка параметров кросс-серверного логина...');

    try {
      // Получаем все параметры из URL
      const params = {
        sign: searchParams.get('sign'),
        name: searchParams.get('name'),
        user_id: searchParams.get('user_id'),
        level: searchParams.get('level'),
        synd: searchParams.get('synd'),
        sign2: searchParams.get('sign2'),
        has_passport: searchParams.get('has_passport'),
        has_mobile: searchParams.get('has_mobile'),
        old_passport: searchParams.get('old_passport'),
        sign3: searchParams.get('sign3'),
        usersex: searchParams.get('usersex'),
        sign4: searchParams.get('sign4'),
      };

      // Сохраняем отладочную информацию
      setDebugInfo(params);

      // Проверяем наличие обязательных параметров
      if (!params.sign || !params.name || !params.user_id) {
        throw new Error('Отсутствуют обязательные параметры для кросс-серверного логина');
      }

      setMessage('Отправка запроса на сервер...');

      // Отправляем запрос на backend
      const response = await axios.post('/auth/cross-server-login', params);

      if (response.data.success) {
        setStatus('success');
        setMessage(response.data.message || 'Успешный вход через GWars!');

        // Сохраняем токен и обновляем профиль пользователя
        if (response.data.access_token) {
          localStorage.setItem('token', response.data.access_token);
          axios.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
          await fetchUserProfile();
        }

        // Перенаправляем на главную страницу через 2 секунды
        setTimeout(() => {
          navigate('/');
        }, 2000);
      } else {
        throw new Error(response.data.error || 'Ошибка входа');
      }
    } catch (error) {
      setStatus('error');
      setMessage(error.response?.data?.detail || error.response?.data?.error || error.message || 'Ошибка кросс-серверного логина');
      console.error('Cross-server login error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = () => {
    handleCrossServerLogin();
  };

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: isDark ? '#141414' : '#f0f2f5',
      minHeight: '100vh',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <div style={{ width: '100%', maxWidth: '600px' }}>
        <ProCard 
          style={{ 
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Title 
                level={2} 
                style={{ color: isDark ? '#ffffff' : '#000000' }}
              >
                <LoginOutlined /> Кросс-серверный вход
              </Title>
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
                Авторизация через GWars.io
              </Text>
            </div>

            {loading && (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" />
                <div style={{ marginTop: '16px', color: isDark ? '#ffffff' : '#000000' }}>
                  {message}
                </div>
              </div>
            )}

            {status === 'success' && (
              <Alert
                message="Успешный вход!"
                description={message}
                type="success"
                icon={<CheckCircleOutlined />}
                showIcon
                style={{
                  backgroundColor: isDark ? '#2f2f2f' : '#f6ffed',
                  border: isDark ? '1px solid #404040' : '1px solid #b7eb8f',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              />
            )}

            {status === 'error' && (
              <>
                <Alert
                  message="Ошибка входа"
                  description={message}
                  type="error"
                  icon={<CloseCircleOutlined />}
                  showIcon
                  style={{
                    backgroundColor: isDark ? '#2f2f2f' : '#fff2f0',
                    border: isDark ? '1px solid #404040' : '1px solid #ffccc7',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <div style={{ textAlign: 'center' }}>
                  <Space size="middle">
                    <Button
                      type="primary"
                      icon={<ReloadOutlined />}
                      onClick={handleRetry}
                    >
                      Попробовать снова
                    </Button>
                    <Button
                      type="default"
                      icon={<LoginOutlined />}
                      onClick={handleGwarsAuth}
                    >
                      Авторизация через GWars
                    </Button>
                  </Space>
                </div>
              </>
            )}

            {!status && !loading && (
              <div style={{ textAlign: 'center' }}>
                <Alert
                  message="Кросс-серверная авторизация"
                  description="Для входа через GWars.io нажмите кнопку ниже. Вы будете перенаправлены на GWars для авторизации, а затем вернетесь обратно."
                  type="info"
                  showIcon
                  style={{
                    marginBottom: '24px',
                    backgroundColor: isDark ? '#2f2f2f' : '#e6f7ff',
                    border: isDark ? '1px solid #404040' : '1px solid #91d5ff',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                />
                <Button
                  type="primary"
                  size="large"
                  icon={<LoginOutlined />}
                  onClick={handleGwarsAuth}
                  style={{
                    minWidth: '250px',
                    height: '48px',
                    fontSize: '16px'
                  }}
                >
                  Авторизация через GWars
                </Button>
              </div>
            )}

            {debugInfo && (
              <ProCard
                size="small"
                title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Отладочная информация</span>}
                style={{
                  backgroundColor: isDark ? '#2f2f2f' : '#fafafa',
                  border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  {Object.entries(debugInfo).map(([key, value]) => (
                    <div key={key} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between',
                      color: isDark ? '#ffffff' : '#000000'
                    }}>
                      <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>{key}:</Text>
                      <Text code style={{ 
                        color: isDark ? '#52c41a' : '#1890ff',
                        backgroundColor: isDark ? '#1f1f1f' : '#f0f0f0',
                        padding: '2px 6px',
                        borderRadius: '4px'
                      }}>
                        {value || '(пусто)'}
                      </Text>
                    </div>
                  ))}
                </Space>
              </ProCard>
            )}
          </Space>
        </ProCard>
      </div>
    </div>
  );
};

export default CrossServerLogin;

