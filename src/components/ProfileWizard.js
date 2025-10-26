import React, { useState, useEffect, useCallback } from 'react';
import { Steps, Card, Form, Input, Button, Typography, message, Space } from 'antd';
import { 
  LinkOutlined, 
  UserOutlined, 
  HomeOutlined, 
  HeartOutlined,
  CheckCircleOutlined 
} from '@ant-design/icons';
import axios from 'axios';
import GWarsVerification from './GWarsVerification';

const { Title, Text } = Typography;
const { TextArea } = Input;

function ProfileWizard({ onProfileCompleted }) {
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [profileStatus, setProfileStatus] = useState(null);
  const [form] = Form.useForm();

  const fetchProfileStatus = useCallback(async () => {
    try {
      const response = await axios.get('/profile/status', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setProfileStatus(response.data);
      
      // Устанавливаем текущий шаг на основе статуса
      if (response.data.next_step) {
        setCurrentStep(response.data.next_step - 1);
      }
      
      // Заполняем форму существующими данными
      form.setFieldsValue({
        gwars_profile_url: response.data.step1_completed ? 'completed' : '',
        full_name: response.data.step2_completed ? 'completed' : '',
        address: response.data.step2_completed ? 'completed' : '',
        interests: response.data.step3_completed ? 'completed' : ''
      });
    } catch (error) {
      console.error('Ошибка при получении статуса профиля:', error);
    }
  }, [form]);

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

  const onStep2Finish = async (values) => {
    setLoading(true);
    try {
      await axios.post('/profile/step2', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Шаг 2 завершен!');
      setCurrentStep(2);
      fetchProfileStatus();
    } catch (error) {
      message.error('Ошибка при сохранении данных');
    } finally {
      setLoading(false);
    }
  };

  const onStep3Finish = async (values) => {
    setLoading(true);
    try {
      await axios.post('/profile/step3', values, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
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
          <GWarsVerification onVerificationComplete={handleGWarsVerificationComplete} />
        );

      case 1:
        return (
          <Card>
            <Title level={3} style={{ color: '#d63031', marginBottom: '20px' }}>
              <UserOutlined /> Шаг 2: Личные данные
            </Title>
            <Text style={{ marginBottom: '20px', display: 'block' }}>
              Укажите ваше полное имя и адрес для отправки подарков.
            </Text>
            <Form
              form={form}
              layout="vertical"
              onFinish={onStep2Finish}
              size={window.innerWidth <= 768 ? "middle" : "large"}
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
                  prefix={<HomeOutlined />}
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
                    style={{ backgroundColor: '#d63031', borderColor: '#d63031' }}
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
            <Title level={3} style={{ color: '#d63031', marginBottom: '20px' }}>
              <HeartOutlined /> Шаг 3: Интересы
            </Title>
            <Text style={{ marginBottom: '20px', display: 'block' }}>
              Расскажите о ваших интересах и предпочтениях, чтобы ваш тайный Санта мог выбрать подходящий подарок.
            </Text>
            <Form
              form={form}
              layout="vertical"
              onFinish={onStep3Finish}
              size={window.innerWidth <= 768 ? "middle" : "large"}
            >
              <Form.Item
                name="interests"
                label="Ваши интересы и предпочтения"
                rules={[
                  { required: true, message: 'Пожалуйста, расскажите о ваших интересах!' },
                  { min: 10, message: 'Описание должно содержать минимум 10 символов!' }
                ]}
              >
                <TextArea 
                  placeholder="Например: люблю читать фантастику, коллекционирую марки, увлекаюсь программированием, предпочитаю практичные подарки..."
                  rows={4}
                  prefix={<HeartOutlined />}
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
                    icon={<CheckCircleOutlined />}
                    style={{ backgroundColor: '#d63031', borderColor: '#d63031' }}
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
      <Card>
        <div style={{ textAlign: 'center', padding: '40px' }}>
          <CheckCircleOutlined style={{ fontSize: '64px', color: '#52c41a', marginBottom: '20px' }} />
          <Title level={2} style={{ color: '#52c41a' }}>
            Профиль заполнен!
          </Title>
          <Text style={{ fontSize: '16px' }}>
            Спасибо! Ваш профиль полностью заполнен. Теперь вы можете участвовать в обмене подарками.
          </Text>
        </div>
      </Card>
    );
  }

  return (
    <div style={{ 
      maxWidth: window.innerWidth <= 768 ? '100%' : '600px', 
      margin: '0 auto',
      padding: window.innerWidth <= 768 ? '10px' : '20px'
    }}>
      <Card className="santa-card">
        <Title level={2} style={{ 
          color: '#d63031', 
          textAlign: 'center',
          marginBottom: '30px',
          fontSize: window.innerWidth <= 768 ? '20px' : '24px'
        }}>
          🎅 Заполнение профиля
        </Title>
        
        <Steps
          current={currentStep}
          items={steps}
          style={{ marginBottom: '30px' }}
          size={window.innerWidth <= 768 ? "small" : "default"}
        />
        
        {renderStepContent()}
      </Card>
    </div>
  );
}

export default ProfileWizard;

