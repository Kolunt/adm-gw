import React, { useState, useEffect, useCallback } from 'react';
import { Steps, Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { 
  LinkOutlined, 
  UserOutlined, 
  HomeOutlined, 
  HeartOutlined,
  CheckCircleOutlined,
  PhoneOutlined,
  MessageOutlined
} from '@ant-design/icons';
import axios from '../utils/axiosConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

function ProfileWizard({ onProfileCompleted }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const [form] = Form.useForm();

  const fetchProfileStatus = useCallback(async () => {
    try {
      const response = await axios.get('/profile/status');
      setProfileStatus(response.data);
      
      // Устанавливаем текущий шаг на основе статуса
      if (response.data.next_step) {
        if (response.data.next_step === 2.5) {
          setCurrentStep(2); // Шаг 2.5 соответствует индексу 2
        } else {
          setCurrentStep(response.data.next_step - 1);
        }
      }
    } catch (error) {
      console.error('Ошибка при получении статуса профиля:', error);
    }
  }, []);

  useEffect(() => {
    fetchProfileStatus();
  }, [fetchProfileStatus]);

  const steps = [
    {
      title: 'GWars профиль',
      icon: <LinkOutlined />,
      description: 'Ссылка на профиль в GWars.io'
    },
    {
      title: 'Личные данные',
      icon: <UserOutlined />,
      description: 'ФИО и адрес'
    },
    {
      title: 'Контакты',
      icon: <PhoneOutlined />,
      description: 'Телефон и Telegram (необязательно)'
    },
    {
      title: 'Интересы',
      icon: <HeartOutlined />,
      description: 'Ваши интересы и предпочтения'
    }
  ];

  const handleGWarsVerificationComplete = () => {
    message.success('GWars профиль верифицирован!');
    setCurrentStep(1);
    fetchProfileStatus();
  };

  const onStep1Finish = async (values) => {
    setLoading(true);
    try {
      await axios.post('/profile/step1', values);
      message.success('Шаг 1 завершен!');
      setCurrentStep(1);
      fetchProfileStatus();
    } catch (error) {
      message.error('Ошибка при сохранении данных');
    } finally {
      setLoading(false);
    }
  };

  const onStep2Finish = async (values) => {
    setLoading(true);
    try {
      await axios.post('/profile/step2', values);
      message.success('Шаг 2 завершен!');
      setCurrentStep(2); // Переходим к шагу 2.5 (контакты)
      fetchProfileStatus();
    } catch (error) {
      message.error('Ошибка при сохранении данных');
    } finally {
      setLoading(false);
    }
  };

  const onStep2_5Finish = async (values) => {
    setLoading(true);
    try {
      await axios.post('/profile/step2_5', values);
      
      message.success('Контактная информация сохранена!');
      setCurrentStep(3); // Переходим к шагу 3 (интересы)
      await fetchProfileStatus();
    } catch (error) {
      console.error('Ошибка при сохранении контактной информации:', error);
      message.error('Ошибка при сохранении контактной информации');
    } finally {
      setLoading(false);
    }
  };

  const onStep3Finish = async (values) => {
    setLoading(true);
    try {
      await axios.post('/profile/step3', values);
      message.success('Профиль полностью заполнен!');
      fetchProfileStatus();
      onProfileCompleted();
    } catch (error) {
      message.error('Ошибка при сохранении данных');
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <Title level={3} style={{ color: '#2d5016', marginBottom: '20px' }}>
              <LinkOutlined /> Шаг 1: GWars профиль
            </Title>
            <Text style={{ marginBottom: '20px', display: 'block', color: '#ffffff' }}>
              Укажите ссылку на ваш профиль в GWars.io для верификации.
            </Text>
            <Form
              form={form}
              layout="vertical"
              onFinish={onStep1Finish}
            >
              <Form.Item
                name="gwars_profile_url"
                label="Ссылка на профиль GWars"
                rules={[
                  { required: true, message: 'Пожалуйста, введите ссылку на профиль!' },
                  { type: 'url', message: 'Введите корректную ссылку!' }
                ]}
              >
                <Input 
                  placeholder="https://www.gwars.io/info.php?id=12345"
                  prefix={<LinkOutlined />}
                />
              </Form.Item>
              <Form.Item>
                <Button 
                  type="primary" 
                  htmlType="submit" 
                  loading={loading}
                >
                  Сохранить и продолжить
                </Button>
              </Form.Item>
            </Form>
          </Card>
        );

      case 1:
        return (
          <Card>
            <Title level={3} style={{ color: '#2d5016', marginBottom: '20px' }}>
              <UserOutlined /> Шаг 2: Личные данные
            </Title>
            <Text style={{ marginBottom: '20px', display: 'block', color: '#ffffff' }}>
              Укажите ваше полное имя и адрес для отправки подарков.
            </Text>
            <Form
              form={form}
              layout="vertical"
              onFinish={onStep2Finish}
            >
              <Form.Item
                name="full_name"
                label="Полное имя (ФИО)"
                rules={[
                  { required: true, message: 'Пожалуйста, введите ваше полное имя!' },
                  { min: 2, message: 'Имя должно содержать минимум 2 символа!' }
                ]}
              >
                <Input 
                  placeholder="Иванов Иван Иванович"
                  prefix={<UserOutlined />}
                />
              </Form.Item>
              <Form.Item
                name="address"
                label="Адрес для отправки подарков"
                rules={[
                  { required: true, message: 'Пожалуйста, введите адрес!' },
                  { min: 10, message: 'Адрес должен содержать минимум 10 символов!' }
                ]}
              >
                <TextArea 
                  placeholder="г. Москва, ул. Примерная, д. 1, кв. 1, индекс 123456"
                  rows={3}
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button onClick={() => setCurrentStep(0)}>
                    Назад
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                  >
                    Сохранить и продолжить
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      case 2:
        return (
          <Card>
            <Title level={3} style={{ color: '#2d5016', marginBottom: '20px' }}>
              <PhoneOutlined /> Шаг 2.5: Контактная информация
            </Title>
            <Text style={{ marginBottom: '20px', display: 'block', color: '#ffffff' }}>
              Укажите дополнительные контактные данные (необязательно). Это поможет организаторам связаться с вами при необходимости.
            </Text>
            <Form
              form={form}
              layout="vertical"
              onFinish={onStep2_5Finish}
            >
              <Form.Item
                name="phone_number"
                label="Номер телефона"
                rules={[
                  { pattern: /^[\+]?[0-9\s\-\(\)]{10,}$/, message: 'Введите корректный номер телефона!' }
                ]}
              >
                <Input 
                  placeholder="+7 (999) 123-45-67"
                  prefix={<PhoneOutlined />}
                />
              </Form.Item>
              <Form.Item
                name="telegram_username"
                label="Никнейм в Telegram"
                rules={[
                  { pattern: /^@?[a-zA-Z0-9_]{5,32}$/, message: 'Введите корректный никнейм Telegram!' }
                ]}
              >
                <Input 
                  placeholder="@username или username"
                  prefix={<MessageOutlined />}
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button onClick={() => setCurrentStep(1)}>
                    Назад
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                  >
                    Продолжить
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      case 3:
        return (
          <Card>
            <Title level={3} style={{ color: '#2d5016', marginBottom: '20px' }}>
              <HeartOutlined /> Шаг 3: Интересы
            </Title>
            <Text style={{ marginBottom: '20px', display: 'block', color: '#ffffff' }}>
              Расскажите о ваших интересах и предпочтениях, чтобы ваш тайный Санта мог выбрать подходящий подарок.
            </Text>
            <Form
              form={form}
              layout="vertical"
              onFinish={onStep3Finish}
            >
              <Form.Item
                name="interests"
                label="Ваши интересы и предпочтения"
                rules={[
                  { required: true, message: 'Пожалуйста, добавьте хотя бы один интерес!' }
                ]}
              >
                <TextArea 
                  placeholder="Например: книги, музыка, спорт, путешествия, технологии..."
                  rows={4}
                />
              </Form.Item>
              <Form.Item>
                <Space>
                  <Button onClick={() => setCurrentStep(2)}>
                    Назад
                  </Button>
                  <Button 
                    type="primary" 
                    htmlType="submit" 
                    loading={loading}
                    icon={<CheckCircleOutlined />}
                  >
                    Завершить профиль
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        );

      default:
        return null;
    }
  };

  if (profileStatus?.profile_completed) {
    return (
      <div style={{ 
        maxWidth: '600px', 
        margin: '0 auto',
        padding: '20px'
      }}>
        <Card style={{ marginBottom: '20px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '20px' }} />
            <Title level={2} style={{ color: '#52c41a' }}>
              Профиль заполнен!
            </Title>
            <Text style={{ fontSize: '16px', color: '#ffffff' }}>
              Спасибо! Ваш профиль полностью заполнен. Теперь вы можете участвовать в обмене подарками.
            </Text>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div style={{ 
      maxWidth: '600px', 
      margin: '0 auto',
      padding: '20px'
    }}>
      <Card className="santa-card">
        <Title level={2} style={{ 
          color: '#2d5016', 
          textAlign: 'center',
          marginBottom: '30px'
        }}>
          🎅 Заполнение профиля
        </Title>
        
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: '30px' }}
        />
        
        {renderStepContent()}
      </Card>
    </div>
  );
}

export default ProfileWizard;
