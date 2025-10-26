import React, { useState, useCallback } from 'react';
import { Card, Typography, Button, Space, Input, message, Spin, Tag, Alert, Divider } from 'antd';
import { UserOutlined, CheckOutlined, ReloadOutlined, LinkOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

function GWarsVerification({ onVerificationComplete }) {
  const [step, setStep] = useState(1); // 1: ввод ссылки, 2: подтверждение, 3: размещение токена, 4: проверка
  const [profileUrl, setProfileUrl] = useState('');
  const [parsedProfile, setParsedProfile] = useState(null);
  const [verificationToken, setVerificationToken] = useState('');
  const [loading, setLoading] = useState(false);
  const [verifying, setVerifying] = useState(false);

  const parseGWarsProfile = useCallback(async (url) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/auth/parse-gwars-profile', 
        { profile_url: url },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setParsedProfile(response.data.profile);
        setStep(2);
        message.success('Профиль успешно найден!');
      } else {
        message.error(response.data.error || 'Не удалось найти профиль');
      }
    } catch (error) {
      console.error('Error parsing GWars profile:', error);
      message.error('Ошибка при парсинге профиля');
    } finally {
      setLoading(false);
    }
  }, []);

  const generateVerificationToken = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/auth/generate-verification-token', 
        { profile_url: profileUrl },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setVerificationToken(response.data.token);
        setStep(3);
        message.success('Токен верификации сгенерирован!');
      } else {
        message.error(response.data.error || 'Ошибка генерации токена');
      }
    } catch (error) {
      console.error('Error generating token:', error);
      message.error('Ошибка при генерации токена');
    } finally {
      setLoading(false);
    }
  }, [profileUrl]);

  const verifyToken = useCallback(async () => {
    setVerifying(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/auth/verify-gwars-token', 
        { profile_url: profileUrl, verification_token: verificationToken },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      
      if (response.data.success) {
        setStep(4);
        message.success('Профиль успешно верифицирован!');
        onVerificationComplete();
      } else {
        message.error(response.data.error || 'Токен не найден в профиле');
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      message.error('Ошибка при проверке токена');
    } finally {
      setVerifying(false);
    }
  }, [profileUrl, verificationToken, onVerificationComplete]);

  const handleUrlSubmit = () => {
    if (!profileUrl.trim()) {
      message.error('Введите ссылку на профиль');
      return;
    }
    
    if (!profileUrl.includes('gwars.io/info.php?id=')) {
      message.error('Неверный формат ссылки. Используйте: https://www.gwars.io/info.php?id=[ID]');
      return;
    }
    
    parseGWarsProfile(profileUrl);
  };

  const handleConfirmProfile = () => {
    generateVerificationToken();
  };

  const handleRetryUrl = () => {
    setStep(1);
    setParsedProfile(null);
    setVerificationToken('');
  };

  const renderStep1 = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <UserOutlined style={{ fontSize: '48px', color: '#1890ff', marginBottom: '16px' }} />
        <Title level={3}>Верификация GWars.io профиля</Title>
        <Text type="secondary">
          Введите ссылку на ваш профиль в GWars.io для подтверждения личности
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <div>
          <Text strong>Ссылка на профиль GWars.io:</Text>
          <Input
            placeholder="https://www.gwars.io/info.php?id=12345"
            value={profileUrl}
            onChange={(e) => setProfileUrl(e.target.value)}
            prefix={<LinkOutlined />}
            size="large"
          />
        </div>

        <Alert
          message="Информация"
          description="Система проверит ваш профиль и покажет информацию для подтверждения"
          type="info"
          showIcon
        />

        <Button
          type="primary"
          size="large"
          onClick={handleUrlSubmit}
          loading={loading}
          style={{ width: '100%' }}
        >
          Проверить профиль
        </Button>
      </Space>
    </Card>
  );

  const renderStep2 = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <CheckOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
        <Title level={3}>Подтверждение профиля</Title>
        <Text type="secondary">
          Проверьте данные профиля и подтвердите, что это ваш аккаунт
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Никнейм:</Text>
              <Text style={{ marginLeft: '8px', fontSize: '16px' }}>{parsedProfile?.nickname}</Text>
            </div>
            <div>
              <Text strong>Уровень:</Text>
              <Text style={{ marginLeft: '8px' }}>{parsedProfile?.level}</Text>
            </div>
            <div>
              <Text strong>Ссылка:</Text>
              <Text style={{ marginLeft: '8px', color: '#1890ff' }}>{profileUrl}</Text>
            </div>
          </Space>
        </Card>

        <Alert
          message="Подтверждение"
          description="Если это ваш профиль, нажмите 'Подтвердить'. Если нет - можете ввести другую ссылку."
          type="warning"
          showIcon
        />

        <Space style={{ width: '100%', justifyContent: 'center' }}>
          <Button
            size="large"
            onClick={handleRetryUrl}
            icon={<ReloadOutlined />}
          >
            Другая ссылка
          </Button>
          <Button
            type="primary"
            size="large"
            onClick={handleConfirmProfile}
            loading={loading}
            icon={<CheckOutlined />}
          >
            Подтвердить профиль
          </Button>
        </Space>
      </Space>
    </Card>
  );

  const renderStep3 = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <UserOutlined style={{ fontSize: '48px', color: '#fa8c16', marginBottom: '16px' }} />
        <Title level={3}>Размещение токена верификации</Title>
        <Text type="secondary">
          Скопируйте сообщение ниже и разместите его в поле "Информация" вашего GWars.io профиля
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Alert
          message="Инструкция"
          description="1. Скопируйте текст ниже 2. Откройте ваш GWars.io профиль 3. Вставьте текст в поле 'Информация' 4. Сохраните изменения 5. Нажмите 'Проверить'"
          type="info"
          showIcon
        />

        <Card size="small" style={{ backgroundColor: '#fff7e6', border: '1px solid #ffd591' }}>
          <Title level={4} style={{ margin: 0, textAlign: 'center' }}>
            Я участвую в Анонимном Деде Морозе! Мой подарок зашифрован здесь: {verificationToken}
          </Title>
        </Card>

        <Button
          type="primary"
          size="large"
          onClick={verifyToken}
          loading={verifying}
          style={{ width: '100%' }}
          icon={<CheckOutlined />}
        >
          Проверить размещение токена
        </Button>

        <Button
          size="large"
          onClick={handleRetryUrl}
          style={{ width: '100%' }}
          icon={<ReloadOutlined />}
        >
          Начать заново
        </Button>
      </Space>
    </Card>
  );

  const renderStep4 = () => (
    <Card>
      <div style={{ textAlign: 'center', marginBottom: '24px' }}>
        <CheckOutlined style={{ fontSize: '48px', color: '#52c41a', marginBottom: '16px' }} />
        <Title level={3} style={{ color: '#52c41a' }}>Профиль верифицирован!</Title>
        <Text type="secondary">
          Ваш GWars.io профиль успешно подтвержден
        </Text>
      </div>

      <Space direction="vertical" style={{ width: '100%' }} size="large">
        <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Tag color="green" style={{ fontSize: '16px', padding: '8px 16px' }}>
                ✓ Верифицирован
              </Tag>
            </div>
            <div>
              <Text strong>Никнейм:</Text>
              <Text style={{ marginLeft: '8px', fontSize: '16px' }}>{parsedProfile?.nickname}</Text>
            </div>
            <div>
              <Text strong>Токен:</Text>
              <Text style={{ marginLeft: '8px', fontFamily: 'monospace' }}>{verificationToken}</Text>
            </div>
          </Space>
        </Card>

        <Alert
          message="Успешно!"
          description="Теперь вы можете продолжить заполнение профиля"
          type="success"
          showIcon
        />
      </Space>
    </Card>
  );

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      {step === 1 && renderStep1()}
      {step === 2 && renderStep2()}
      {step === 3 && renderStep3()}
      {step === 4 && renderStep4()}
    </div>
  );
}

export default GWarsVerification;
