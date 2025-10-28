import React, { useState, useEffect } from 'react';
import { 
  Steps, 
  Card, 
  Form, 
  Input, 
  Button, 
  Typography, 
  Space, 
  Alert, 
  message,
  Divider
} from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  HeartOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import axios from '../utils/axiosConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProfileCompletion = ({ onComplete }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsedNickname, setParsedNickname] = useState(null);
  const [profileUrl, setProfileUrl] = useState('');

  useEffect(() => {
    // Получаем статус профиля только один раз при загрузке
    const getProfileStatus = async () => {
      try {
        const response = await axios.get('/profile/status');
        setProfileStatus(response.data);
        
        // Устанавливаем текущий шаг на основе заполненности
        if (response.data && response.data.steps) {
          if (!response.data.steps.gwars_verified) {
            setCurrentStep(0);
          } else if (!response.data.steps.personal_info) {
            setCurrentStep(1);
          } else if (!response.data.steps.interests) {
            setCurrentStep(2);
          } else {
            setCurrentStep(3);
          }
        } else {
          // Если структура данных неожиданная, начинаем с первого шага
          setCurrentStep(0);
        }
      } catch (error) {
        console.error('Error fetching profile status:', error);
        // В случае ошибки начинаем с первого шага
        setCurrentStep(0);
      }
    };
    
    getProfileStatus();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps


  const handleStepChange = (step) => {
    setCurrentStep(step);
  };

  const handleNext = async () => {
    try {
      if (currentStep === 0) {
        // Шаг 1: GWars парсинг профиля - валидируем только URL
        const values = await form.validateFields(['gwars_profile_url']);
        await handleParseProfile(values);
      } else if (currentStep === 1) {
        // Шаг 2: Личная информация - валидируем соответствующие поля
        const values = await form.validateFields(['full_name', 'address']);
        await handlePersonalInfo(values);
      } else if (currentStep === 2) {
        // Шаг 3: Интересы - валидируем поле интересов
        const values = await form.validateFields(['interests']);
        await handleInterests(values);
      }
      
      // Статус обновится автоматически через AuthService
    } catch (error) {
      console.error('Error in step:', error);
      // Если ошибка валидации, показываем сообщение пользователю
      if (error.errorFields && error.errorFields.length > 0) {
        message.error('Пожалуйста, заполните все обязательные поля');
      }
    }
  };

  const handleParseProfile = async (values) => {
    setLoading(true);
    try {
      const response = await axios.post('/profile/parse-gwars', {
        profile_url: values.gwars_profile_url
      });
      
      if (response.data.success) {
        setParsedNickname(response.data.nickname);
        setProfileUrl(values.gwars_profile_url);
        message.success(response.data.message);
      } else {
        message.error(response.data.error);
      }
    } catch (error) {
      message.error(error.response?.data?.detail || 'Ошибка парсинга GWars профиля');
    } finally {
      setLoading(false);
    }
  };

  const handleGwarsVerification = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/profile/verify-gwars', {
        profile_url: profileUrl
      });
      
      if (response.data.verified) {
        message.success(response.data.message);
        setCurrentStep(1); // Переходим к следующему шагу
      } else {
        message.error(response.data.message);
        // Показываем токен пользователю
        if (response.data.token) {
          message.info(`Ваш токен: ${response.data.token}`);
        }
      }
    } catch (error) {
      message.error(error.response?.data?.detail || 'Ошибка верификации GWars профиля');
    } finally {
      setLoading(false);
    }
  };

  const handlePersonalInfo = async (values) => {
    setLoading(true);
    try {
      await axios.put('/auth/profile', {
        full_name: values.full_name,
        address: values.address
      });
      
      message.success('Личная информация сохранена!');
      setCurrentStep(2); // Переходим к следующему шагу
    } catch (error) {
      message.error('Ошибка сохранения личной информации');
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const handleInterests = async (values) => {
    setLoading(true);
    try {
      await axios.put('/auth/profile', {
        interests: values.interests
      });
      
      message.success('Интересы сохранены!');
      setCurrentStep(3); // Переходим к финальному шагу
    } catch (error) {
      message.error('Ошибка сохранения интересов');
      throw error;
    } finally {
      setLoading(false);
    }
  };


  const steps = [
    {
      title: 'GWars Профиль',
      icon: <UserOutlined />,
      description: 'Подтвердите свой игровой профиль'
    },
    {
      title: 'Личная информация',
      icon: <HomeOutlined />,
      description: 'ФИО и адрес для подарков'
    },
    {
      title: 'Интересы',
      icon: <HeartOutlined />,
      description: 'Расскажите о своих интересах'
    },
    {
      title: 'Завершено',
      icon: <CheckCircleOutlined />,
      description: 'Профиль полностью заполнен'
    }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <Card>
            <Title level={4}>Шаг 1: Подтверждение GWars профиля</Title>
            <Alert
              message="Инструкция"
              description="Для участия в обмене подарками необходимо подтвердить свой игровой профиль на GWars.io"
              type="info"
              style={{ marginBottom: '24px' }}
            />
            
            <Form form={form} layout="vertical">
              <Form.Item
                name="gwars_profile_url"
                label="Ссылка на профиль GWars"
                  rules={[
                    { required: true, message: 'Введите ссылку на профиль' },
                    { 
                      pattern: /^https?:\/\/(www\.)?gwars\.io\/info\.php\?id=\d+$/,
                      message: 'Ссылка должна быть в формате: https://gwars.io/info.php?id=123456 или https://www.gwars.io/info.php?id=123456'
                    }
                  ]}
              >
                <Input placeholder="https://www.gwars.io/info.php?id=123456" />
              </Form.Item>
            </Form>
            
            {!parsedNickname ? (
              <Button 
                type="primary" 
                onClick={handleNext}
                loading={loading}
                style={{ marginTop: '16px' }}
              >
                Проверить профиль
              </Button>
            ) : (
              <div style={{ marginTop: '16px' }}>
                <Alert
                  message="Профиль найден!"
                  description={`Никнейм: ${parsedNickname}. Это ваш персонаж?`}
                  type="success"
                  style={{ marginBottom: '16px' }}
                />
                
                <Alert
                  message="Токен для верификации"
                  description={`Разместите этот токен в информации вашего профиля GWars: "Я Анонимный Дед Мороз: ${profileStatus?.gwars_verification_token || 'Токен будет сгенерирован при проверке'}"`}
                  type="warning"
                  style={{ marginBottom: '16px' }}
                />
                
                <Button 
                  type="primary" 
                  onClick={handleGwarsVerification}
                  loading={loading}
                >
                  Подтвердить и продолжить
                </Button>
              </div>
            )}
          </Card>
        );
        
      case 1:
        return (
          <Card>
            <Title level={4}>Шаг 2: Личная информация</Title>
            <Text type="secondary">Укажите ваши данные для отправки подарков</Text>
            
            <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
              <Form.Item
                name="full_name"
                label="ФИО"
                rules={[{ required: true, message: 'Введите ФИО' }]}
              >
                <Input placeholder="Иванов Иван Иванович" />
              </Form.Item>
              
              <Form.Item
                name="address"
                label="Адрес для отправки подарков"
                rules={[{ required: true, message: 'Введите адрес' }]}
              >
                <TextArea 
                  rows={4} 
                  placeholder="Полный адрес с индексом для почтовой отправки"
                />
              </Form.Item>
            </Form>
            
            <Button 
              type="primary" 
              onClick={handleNext}
              loading={loading}
              style={{ marginTop: '16px' }}
            >
              Сохранить и продолжить
            </Button>
          </Card>
        );
        
      case 2:
        return (
          <Card>
            <Title level={4}>Шаг 3: Интересы</Title>
            <Text type="secondary">Расскажите о своих интересах и предпочтениях</Text>
            
            <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
              <Form.Item
                name="interests"
                label="Ваши интересы"
                rules={[{ required: true, message: 'Расскажите о своих интересах' }]}
              >
                <TextArea 
                  rows={6} 
                  placeholder="Например: книги, музыка, спорт, технологии, путешествия, кулинария..."
                />
              </Form.Item>
            </Form>
            
            <Button 
              type="primary" 
              onClick={handleNext}
              loading={loading}
              style={{ marginTop: '16px' }}
            >
              Завершить заполнение профиля
            </Button>
          </Card>
        );
        
      case 3:
        return (
          <Card>
            <Title level={4}>🎉 Профиль заполнен!</Title>
            <Alert
              message="Поздравляем!"
              description="Ваш профиль полностью заполнен. Теперь вы можете участвовать в обмене подарками!"
              type="success"
              showIcon
            />
            
            <div style={{ marginTop: '24px' }}>
              <Title level={5}>Что дальше?</Title>
              <ul>
                <li>Регистрируйтесь на мероприятия</li>
                <li>Участвуйте в обмене подарками</li>
                <li>Получайте и дарите подарки</li>
              </ul>
            </div>
            
            <Button 
              type="primary" 
              size="large"
              onClick={() => {
                if (onComplete) onComplete();
                // Перенаправляем на главную страницу
                window.location.href = '/';
              }}
              style={{ marginTop: '24px' }}
            >
              Перейти к основному функционалу
            </Button>
          </Card>
        );
        
      default:
        return null;
    }
  };

  if (!profileStatus) {
    return <div>Загрузка...</div>;
  }

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Заполнение профиля</Title>
      <Text type="secondary">
        Для участия в обмене подарками необходимо заполнить профиль
      </Text>
      
      <Divider />
      
      <Steps
        current={currentStep}
        onChange={handleStepChange}
        items={steps}
        style={{ marginBottom: '32px' }}
      />
      
      {renderStepContent()}
      
      {currentStep < 3 && (
        <div style={{ marginTop: '24px', textAlign: 'right' }}>
          <Space>
            {currentStep > 0 && (
              <Button onClick={() => setCurrentStep(currentStep - 1)}>
                Назад
              </Button>
            )}
            <Button 
              type="primary" 
              onClick={handleNext}
              loading={loading}
            >
              {currentStep === 2 ? 'Завершить' : 'Далее'}
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
};

export default ProfileCompletion;
