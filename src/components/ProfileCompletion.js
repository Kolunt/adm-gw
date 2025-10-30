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
  CheckCircleOutlined,
  CopyOutlined,
  CheckOutlined,
  CloseOutlined
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
  const [verificationToken, setVerificationToken] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [nicknameConfirmed, setNicknameConfirmed] = useState(false);

  useEffect(() => {
    // Получаем статус профиля только один раз при загрузке
    const getProfileStatus = async () => {
      try {
        const response = await axios.get('/profile/status');
        console.log('Profile status response:', response.data);
        setProfileStatus(response.data || { steps: {} });
        
        // Загружаем данные профиля если они есть
        if (response.data) {
          // Загружаем токен, если он есть в статусе
          if (response.data.gwars_verification_token) {
            setVerificationToken(response.data.gwars_verification_token);
            // Если токен есть, значит никнейм был подтвержден ранее
            setNicknameConfirmed(true);
          }
          
          // Если есть URL профиля
          if (response.data.gwars_profile_url) {
            setProfileUrl(response.data.gwars_profile_url);
            // Если есть никнейм в статусе
            if (response.data.gwars_nickname) {
              setParsedNickname(response.data.gwars_nickname);
              // Если уже есть токен, значит никнейм был подтвержден ранее
              // Если токена нет, пользователь должен будет подтвердить никнейм заново
            }
          }
        }
        
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
          setProfileStatus({ steps: {} }); // Устанавливаем дефолтное значение
        }
      } catch (error) {
        console.error('Error fetching profile status:', error);
        // В случае ошибки устанавливаем дефолтные значения
        setProfileStatus({ steps: {} });
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

  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      message.success('Токен скопирован в буфер обмена!');
    } catch (err) {
      // Fallback для старых браузеров
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      try {
        document.execCommand('copy');
        message.success('Токен скопирован в буфер обмена!');
      } catch (err) {
        message.error('Не удалось скопировать токен');
      }
      document.body.removeChild(textArea);
    }
  };

  const handleParseProfile = async (values) => {
    setLoading(true);
    setVerificationError(null); // Очищаем предыдущие ошибки
    try {
      const response = await axios.post('/profile/parse-gwars', {
        profile_url: values.gwars_profile_url
      });
      
      if (response.data.success) {
        setParsedNickname(response.data.nickname);
        setProfileUrl(values.gwars_profile_url);
        setNicknameConfirmed(false); // Сбрасываем подтверждение
        setVerificationToken(null); // Очищаем токен до подтверждения
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

  const handleConfirmNickname = async () => {
    setLoading(true);
    try {
      // После подтверждения никнейма получаем/генерируем токен
      // Вызываем verify-gwars с параметром skip_verification для генерации токена без проверки
      const verifyResponse = await axios.post('/profile/verify-gwars', {
        profile_url: profileUrl,
        nickname: parsedNickname,
        skip_verification: true
      }, { timeout: 15000, withCredentials: true });
      
      // Получаем токен из ответа
      if (verifyResponse.data.token) {
        // Всегда перечитываем статус, чтобы гарантированно получить актуальный токен с сервера
        const statusResponse = await axios.get('/profile/status');
        const serverToken = statusResponse.data?.gwars_verification_token || verifyResponse.data.token;
        setVerificationToken(serverToken);
        setNicknameConfirmed(true);
        message.success('Никнейм подтвержден! Теперь разместите токен в вашем профиле.');
      } else {
        // Если токен не пришел в ответе, получаем из статуса профиля
        const statusResponse = await axios.get('/profile/status');
        if (statusResponse.data && statusResponse.data.gwars_verification_token) {
          setVerificationToken(statusResponse.data.gwars_verification_token);
          setNicknameConfirmed(true);
          message.success('Никнейм подтвержден! Теперь разместите токен в вашем профиле.');
        } else {
          message.error('Не удалось получить токен');
        }
      }
    } catch (error) {
      message.error(error.response?.data?.detail || 'Ошибка при получении токена');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectNickname = () => {
    setParsedNickname(null);
    setProfileUrl('');
    setNicknameConfirmed(false);
    setVerificationToken(null);
    setVerificationError(null);
    form.resetFields(['gwars_profile_url']);
    message.info('Введите правильную ссылку на ваш профиль GWars');
  };

  const handleGwarsVerification = async () => {
    setLoading(true);
    setVerificationError(null); // Очищаем предыдущую ошибку
    
    // Проверяем, что profileUrl установлен
    if (!profileUrl) {
      setVerificationError('Сначала необходимо ввести и подтвердить ссылку на GWars профиль');
      setLoading(false);
      return;
    }
    
    try {
      console.log('Проверка верификации токена для профиля:', profileUrl);
      const response = await axios.post('/profile/verify-gwars', {
        profile_url: profileUrl,
        skip_verification: false // Явно указываем, что нужна проверка
      }, { timeout: 15000, withCredentials: true });
      
      console.log('Ответ от API верификации:', response.data);
      
      if (response.data.verified) {
        message.success(response.data.message);
        setVerificationError(null);
        // Обновляем статус профиля
        const statusResponse = await axios.get('/profile/status');
        setProfileStatus(statusResponse.data);
        setCurrentStep(1); // Переходим к следующему шагу
      } else {
        // Показываем детальное сообщение об ошибке
        const errorMessage = response.data.message || 'Профиль не подтвержден. Убедитесь, что токен размещен в вашем профиле GWars.';
        setVerificationError(errorMessage);
        
        // Показываем ошибку с детальным описанием
        message.error({
          content: errorMessage,
          duration: 8, // Показываем дольше, чтобы пользователь успел прочитать
          style: {
            marginTop: '20vh',
          },
        });
        
        // Показываем токен пользователю, если он еще не видел его
        if (response.data.token) {
          setVerificationToken(response.data.token);
        }
      }
    } catch (error) {
      console.error('Ошибка при проверке верификации:', error);
      
      let errorMessage;
      if (error.response?.status === 500) {
        errorMessage = 'Ошибка сервера. Попробуйте позже или обратитесь к администратору.';
      } else if (error.response?.status === 401) {
        errorMessage = 'Сессия истекла. Пожалуйста, войдите в систему заново.';
      } else {
        errorMessage = error.response?.data?.detail || error.response?.data?.message || 'Ошибка верификации GWars профиля: возможно, вы неполностью вставили сообщение в профиль. Рекомендуем воспользоваться кнопкой "Копировать"';
      }
      
      setVerificationError(errorMessage);
      message.error({
        content: errorMessage,
        duration: 8,
        style: {
          marginTop: '20vh',
        },
      });
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
    if (profileStatus === null) {
      return (
        <Card>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary">Загрузка данных профиля...</Text>
          </div>
        </Card>
      );
    }

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
                {!nicknameConfirmed ? (
                  <>
                    <Alert
                      message="Профиль найден!"
                      description={`Никнейм: ${parsedNickname}. Это ваш персонаж?`}
                      type="success"
                      style={{ marginBottom: '16px' }}
                    />
                    
                    <Space style={{ marginBottom: '16px' }}>
                      <Button 
                        type="primary" 
                        icon={<CheckOutlined />}
                        onClick={handleConfirmNickname}
                        loading={loading}
                        size="large"
                      >
                        Да, это я
                      </Button>
                      <Button 
                        icon={<CloseOutlined />}
                        onClick={handleRejectNickname}
                        size="large"
                      >
                        Нет, это не я
                      </Button>
                    </Space>
                  </>
                ) : (
                  <>
                    <Alert
                      message="Профиль подтвержден!"
                      description={`Никнейм: ${parsedNickname}`}
                      type="success"
                      style={{ marginBottom: '16px' }}
                    />
                    
                    {verificationToken && (
                      <Alert
                        message="Токен для верификации"
                        description={
                          <div>
                            <div style={{ marginBottom: '8px' }}>
                              Разместите этот токен в информации вашего профиля GWars:
                            </div>
                            <Space 
                              direction="vertical" 
                              style={{ width: '100%' }}
                              size="small"
                            >
                              <div style={{ 
                                padding: '12px', 
                                background: '#1f1f1f', 
                                borderRadius: '4px',
                                fontFamily: 'monospace',
                                fontSize: '14px',
                                wordBreak: 'break-all',
                                color: '#ffffff',
                                border: '1px solid #434343',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between',
                                gap: '12px'
                              }}>
                                <span>Я Анонимный Дед Мороз: {verificationToken}</span>
                                <Button
                                  type="text"
                                  icon={<CopyOutlined />}
                                  onClick={() => copyToClipboard(`Я Анонимный Дед Мороз: ${verificationToken}`)}
                                  style={{
                                    color: '#ffffff',
                                    flexShrink: 0
                                  }}
                                  title="Скопировать"
                                >
                                  Копировать
                                </Button>
                              </div>
                            </Space>
                          </div>
                        }
                        type="warning"
                        style={{ marginBottom: '16px' }}
                      />
                    )}
                  
                  {!verificationToken && nicknameConfirmed && (
                    <Alert
                      message="Генерация токена"
                      description="Получение токена для верификации..."
                      type="info"
                      style={{ marginBottom: '16px' }}
                    />
                  )}
                  
                  {verificationError && (
                    <Alert
                      message={<span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Ошибка верификации</span>}
                      description={<span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{verificationError}</span>}
                      type="error"
                      closable
                      onClose={() => setVerificationError(null)}
                      style={{ marginBottom: '16px' }}
                    />
                  )}
                  
                  {nicknameConfirmed && verificationToken && (
                    <>
                      <Alert
                        message="Инструкция по верификации"
                        description={
                          <div>
                            <p style={{ marginBottom: '8px' }}>
                              Для завершения верификации выполните следующие шаги:
                            </p>
                            <ol style={{ marginLeft: '20px', marginTop: '8px' }}>
                              <li style={{ marginBottom: '8px' }}>
                                Скопируйте токен выше (кнопка "Копировать")
                              </li>
                              <li style={{ marginBottom: '8px' }}>
                                Войдите в игру, перейдите в <a href="https://www.gwars.io/info.edit.php?type=pinfo" target="_blank" rel="noopener noreferrer">"Личные настройки"</a> и добавьте всё скопированное в "Личную информацию" о персонаже
                              </li>
                              <li style={{ marginBottom: '8px' }}>
                                Разместите в информации вашего персонажа <strong>точно</strong> следующий текст:
                                <div style={{ 
                                  padding: '8px', 
                                  background: '#f0f0f0', 
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  marginTop: '4px',
                                  marginLeft: '0px'
                                }}>
                                  Я Анонимный Дед Мороз: {verificationToken}
                                </div>
                              </li>
                              <li style={{ marginBottom: '8px' }}>
                                Сохраните изменения в профиле GWars
                              </li>
                              <li>
                                Вернитесь сюда и нажмите кнопку <strong>"Проверить верификацию"</strong> ниже
                              </li>
                            </ol>
                          </div>
                        }
                        type="info"
                        style={{ marginBottom: '16px' }}
                      />
                      <Space direction="vertical" style={{ width: '100%' }} size="middle">
                        <Button 
                          type="primary" 
                          size="large"
                          onClick={handleGwarsVerification}
                          loading={loading}
                          block
                          style={{ marginTop: '8px' }}
                        >
                          Проверить верификацию
                        </Button>
                        <Button 
                          onClick={handleRejectNickname}
                          block
                        >
                          Изменить профиль
                        </Button>
                      </Space>
                    </>
                  )}
                  </>
                )}
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
        return (
          <Card>
            <Alert
              message="Неизвестный шаг"
              description="Произошла ошибка при определении текущего шага"
              type="error"
            />
          </Card>
        );
    }
  };

  return (
    <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
      <Title level={2}>Заполнение профиля</Title>
      <Text type="secondary">
        Для участия в обмене подарками необходимо заполнить профиль
      </Text>
      
      <Divider />
      
      {profileStatus !== null && (
        <div style={{ marginBottom: '32px' }}>
          <style>
            {`
              .profile-completion-steps .ant-steps-item-title,
              .profile-completion-steps .ant-steps-item-description {
                color: white !important;
              }
              .profile-completion-steps .ant-steps-item-process .ant-steps-item-title,
              .profile-completion-steps .ant-steps-item-finish .ant-steps-item-title {
                color: white !important;
              }
            `}
          </style>
          <Steps
            className="profile-completion-steps"
            current={currentStep}
            onChange={handleStepChange}
            items={steps}
          />
        </div>
      )}
      
      {renderStepContent()}
      
      {profileStatus !== null && currentStep < 3 && (
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
