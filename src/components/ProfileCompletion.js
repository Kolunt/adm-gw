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
  Divider,
  Select
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
import { AutoComplete } from 'antd';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const ProfileCompletion = ({ onComplete }) => {
  const { isDark } = useTheme();
  const [currentStep, setCurrentStep] = useState(0);
  const [form] = Form.useForm();
  const [profileStatus, setProfileStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [parsedNickname, setParsedNickname] = useState(null);
  const [profileUrl, setProfileUrl] = useState('');
  const [verificationToken, setVerificationToken] = useState(null);
  const [verificationError, setVerificationError] = useState(null);
  const [nicknameConfirmed, setNicknameConfirmed] = useState(false);
  const [addressOptions, setAddressOptions] = useState([]);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressSearchDelayRef = React.useRef(null);
  const [interestsList, setInterestsList] = useState([]);
  const [interestsLoading, setInterestsLoading] = useState(false);
  const [interestsSearchOptions, setInterestsSearchOptions] = useState([]);

  const fetchAddressSuggestions = async (query) => {
    if (!query || query.length < 3) {
      setAddressOptions([]);
      return;
    }
    try {
      setAddressLoading(true);
      const resp = await axios.post('/api/suggest-address', { query });
      const suggestions = (resp.data?.suggestions || []).map((s) => ({
        value: s.unrestricted_value || s.value || '',
        label: s.value || s.unrestricted_value || ''
      }));
      setAddressOptions(suggestions);
    } catch (e) {
      // Если отключено или токен не настроен — тихий фоллбек без авто-дополнения
      setAddressOptions([]);
    } finally {
      setAddressLoading(false);
    }
  };

  const fetchInterests = async () => {
    try {
      setInterestsLoading(true);
      const response = await axios.get('/api/interests');
      const interests = (response.data || []).map((interest) => ({
        value: interest.name,
        label: interest.name
      }));
      setInterestsList(interests);
      setInterestsSearchOptions(interests);
    } catch (error) {
      console.error('Error fetching interests:', error);
    } finally {
      setInterestsLoading(false);
    }
  };

  const searchInterests = async (query) => {
    if (!query || query.length < 2) {
      setInterestsSearchOptions(interestsList);
      return;
    }
    try {
      const response = await axios.get(`/api/interests/search?query=${encodeURIComponent(query)}`);
      const suggestions = (response.data || []).map((interest) => ({
        value: interest.name,
        label: interest.name
      }));
      setInterestsSearchOptions(suggestions);
    } catch (error) {
      console.error('Error searching interests:', error);
      setInterestsSearchOptions(interestsList);
    }
  };

  const createInterestIfNeeded = async (interestName) => {
    if (!interestName || !interestName.trim()) {
      return;
    }
    
    // Проверяем, есть ли уже такой интерес в списке
    const normalizedName = interestName.toLowerCase().trim();
    const exists = interestsList.some(i => i.value.toLowerCase() === normalizedName);
    
    if (exists) {
      return;
    }
    
    try {
      const response = await axios.post('/api/interests/create', { name: interestName });
      // Добавляем новый интерес в список
      const newInterest = {
        value: response.data.name,
        label: response.data.name
      };
      setInterestsList([...interestsList, newInterest]);
      return response.data.name;
    } catch (error) {
      console.error('Error creating interest:', error);
      // Если интерес уже существует или другая ошибка, просто возвращаем имя
      return interestName;
    }
  };

  useEffect(() => {
    // Загружаем интересы при переходе на шаг 3
    if (currentStep === 2) {
      fetchInterests();
    }
  }, [currentStep]); // eslint-disable-line react-hooks/exhaustive-deps

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
    // Разрешаем переход только на предыдущие шаги
    if (step < currentStep) {
      setCurrentStep(step);
    } else if (step > currentStep) {
      message.warning('Сначала завершите текущий шаг');
    }
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

  const checkProfileUrlUnique = async (profileUrl) => {
    try {
      const response = await axios.post('/profile/check-gwars-url', {
        profile_url: profileUrl
      });
      return { unique: response.data.unique, message: response.data.message };
    } catch (error) {
      // Если эндпоинт не существует или произошла ошибка, продолжаем
      return { unique: true, message: null };
    }
  };

  const handleParseProfile = async (values) => {
    setLoading(true);
    setVerificationError(null); // Очищаем предыдущие ошибки
    try {
      // Сначала проверяем уникальность URL
      const uniquenessCheck = await checkProfileUrlUnique(values.gwars_profile_url);
      if (!uniquenessCheck.unique) {
        message.error(uniquenessCheck.message || 'Этот игровой персонаж уже зарегистрирован в системе');
        setLoading(false);
        return;
      }

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
        // Если персонаж не найден, показываем специальное сообщение
        if (response.data.character_not_found) {
          message.error(response.data.error || 'Персонаж не найден на указанной странице. Пожалуйста, введите ссылку на существующего персонажа.');
          // Очищаем форму, чтобы пользователь мог ввести новую ссылку
          form.setFieldsValue({ gwars_profile_url: '' });
        } else {
          message.error(response.data.error || 'Ошибка парсинга GWars профиля');
        }
      }
    } catch (error) {
      const errorMessage = error.response?.data?.detail || 'Ошибка парсинга GWars профиля';
      // Если ошибка связана с дубликатом URL, показываем специальное сообщение
      if (errorMessage.includes('уже зарегистрирован') || error.response?.status === 400) {
        message.error(errorMessage);
      } else {
        message.error(errorMessage);
      }
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
      // Перед сохранением создаем все новые интересы
      const interests = values.interests || [];
      for (const interest of interests) {
        if (interest && interest.trim()) {
          await createInterestIfNeeded(interest);
        }
      }
      
      // Преобразуем массив интересов в строку (если backend ожидает строку)
      // или оставляем массив (если backend ожидает массив)
      const interestsValue = Array.isArray(interests) 
        ? interests.join(', ') 
        : interests;
      
      await axios.put('/auth/profile', {
        interests: interestsValue
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
        <Card
          style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}
        >
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
              Загрузка данных профиля...
            </Text>
          </div>
        </Card>
      );
    }

    switch (currentStep) {
      case 0:
        return (
          <Card
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>
              Шаг 1: Подтверждение GWars профиля
            </Title>
            <Alert
              message="Инструкция"
              description="Для участия в обмене подарками необходимо подтвердить свой игровой профиль на GWars.io"
              type="info"
              style={{
                marginBottom: '24px',
                backgroundColor: isDark ? '#2f2f2f' : '#f6ffed',
                border: isDark ? '1px solid #404040' : '1px solid #b7eb8f',
                color: isDark ? '#ffffff' : '#000000'
              }}
            />
            
            <Form form={form} layout="vertical">
              <Form.Item
                name="gwars_profile_url"
                label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Ссылка на профиль GWars</span>}
                rules={[
                  { required: true, message: 'Введите ссылку на профиль' },
                  { 
                    pattern: /^https?:\/\/(www\.)?gwars\.io\/info\.php\?id=\d+$/,
                    message: 'Ссылка должна быть в формате: https://gwars.io/info.php?id=123456 или https://www.gwars.io/info.php?id=123456'
                  }
                ]}
              >
                <Input
                  placeholder="https://www.gwars.io/info.php?id=123456"
                  style={{
                    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                  }}
                />
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
                      style={{
                        marginBottom: '16px',
                        backgroundColor: isDark ? '#2f2f2f' : '#f6ffed',
                        border: isDark ? '1px solid #404040' : '1px solid #b7eb8f',
                        color: isDark ? '#ffffff' : '#000000'
                      }}
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
                        style={{
                          backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                          borderColor: isDark ? '#404040' : '#d9d9d9',
                          color: isDark ? '#ffffff' : '#000000'
                        }}
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
                      style={{
                        marginBottom: '16px',
                        backgroundColor: isDark ? '#2f2f2f' : '#f6ffed',
                        border: isDark ? '1px solid #404040' : '1px solid #b7eb8f',
                        color: isDark ? '#ffffff' : '#000000'
                      }}
                    />
                    
                    {verificationToken && (
                      <Alert
                        message="Токен для верификации"
                        description={
                          <div>
                            <div style={{ marginBottom: '8px', color: isDark ? '#ffffff' : '#000000' }}>
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
                        style={{
                          marginBottom: '16px',
                          backgroundColor: isDark ? '#2f2f2f' : '#fffbe6',
                          border: isDark ? '1px solid #404040' : '1px solid #ffe58f',
                          color: isDark ? '#ffffff' : '#000000'
                        }}
                      />
                    )}
                  
                  {!verificationToken && nicknameConfirmed && (
                    <Alert
                      message="Генерация токена"
                      description="Получение токена для верификации..."
                      type="info"
                      style={{
                        marginBottom: '16px',
                        backgroundColor: isDark ? '#2f2f2f' : '#f6ffed',
                        border: isDark ? '1px solid #404040' : '1px solid #b7eb8f',
                        color: isDark ? '#ffffff' : '#000000'
                      }}
                    />
                  )}
                  
                  {verificationError && (
                    <Alert
                      message={<span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>Ошибка верификации</span>}
                      description={<span style={{ color: '#ff4d4f', fontWeight: 'bold' }}>{verificationError}</span>}
                      type="error"
                      closable
                      onClose={() => setVerificationError(null)}
                      style={{
                        marginBottom: '16px',
                        backgroundColor: isDark ? '#2f2f2f' : '#fff2f0',
                        border: isDark ? '1px solid #404040' : '1px solid #ffccc7',
                        color: isDark ? '#ffffff' : '#000000'
                      }}
                    />
                  )}
                  
                  {nicknameConfirmed && verificationToken && (
                    <>
                      <Alert
                        message="Инструкция по верификации"
                        description={
                          <div>
                            <p style={{ marginBottom: '8px', color: isDark ? '#ffffff' : '#000000' }}>
                              Для завершения верификации выполните следующие шаги:
                            </p>
                            <ol style={{ marginLeft: '20px', marginTop: '8px', color: isDark ? '#ffffff' : '#000000' }}>
                              <li style={{ marginBottom: '8px' }}>
                                Скопируйте токен выше (кнопка "Копировать")
                              </li>
                              <li style={{ marginBottom: '8px' }}>
                                Войдите в игру, перейдите в <a href="https://www.gwars.io/info.edit.php?type=pinfo" target="_blank" rel="noopener noreferrer" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>"Личные настройки"</a> и добавьте всё скопированное в "Личную информацию" о персонаже
                              </li>
                              <li style={{ marginBottom: '8px' }}>
                                Разместите в информации вашего персонажа <strong>точно</strong> следующий текст:
                                <div style={{ 
                                  padding: '8px', 
                                  background: isDark ? '#1f1f1f' : '#f0f0f0',
                                  color: isDark ? '#ffffff' : '#000000',
                                  borderRadius: '4px',
                                  fontFamily: 'monospace',
                                  fontSize: '12px',
                                  marginTop: '4px',
                                  marginLeft: '0px',
                                  border: isDark ? '1px solid #404040' : 'none'
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
                        style={{
                          marginBottom: '16px',
                          backgroundColor: isDark ? '#2f2f2f' : '#f6ffed',
                          border: isDark ? '1px solid #404040' : '1px solid #b7eb8f',
                          color: isDark ? '#ffffff' : '#000000'
                        }}
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
                          style={{
                            backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                            borderColor: isDark ? '#404040' : '#d9d9d9',
                            color: isDark ? '#ffffff' : '#000000'
                          }}
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
          <Card
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>
              Шаг 2: Личная информация
            </Title>
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
              Укажите ваши данные для отправки подарков
            </Text>
            
            <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
              <Form.Item
                name="full_name"
                label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>ФИО</span>}
                rules={[{ required: true, message: 'Введите ФИО' }]}
              >
                <Input
                  placeholder="Иванов Иван Иванович"
                  style={{
                    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                  }}
                />
              </Form.Item>
              
              <Form.Item
                name="address"
                label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Адрес для отправки подарков</span>}
                rules={[{ required: true, message: 'Введите адрес' }]}
              >
                <AutoComplete
                  options={addressOptions}
                  onSearch={(val) => {
                    if (addressSearchDelayRef.current) clearTimeout(addressSearchDelayRef.current);
                    addressSearchDelayRef.current = setTimeout(() => fetchAddressSuggestions(val), 300);
                  }}
                  onSelect={(val) => form.setFieldsValue({ address: val })}
                  style={{
                    width: '100%',
                    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                    color: isDark ? '#ffffff' : '#000000',
                    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                  }}
                  notFoundContent={addressLoading ? 'Загрузка…' : 'Нет подсказок'}
                  styles={{
                    popup: {
                      root: {
                        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                      }
                    }
                  }}
                >
                  <Input
                    placeholder="Начните вводить адрес"
                    style={{
                      backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                      color: isDark ? '#ffffff' : '#000000',
                      border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                    }}
                  />
                </AutoComplete>
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
          <Card
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>
              Шаг 3: Интересы
            </Title>
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
              Расскажите о своих интересах и предпочтениях
            </Text>
            
            <Form form={form} layout="vertical" style={{ marginTop: '24px' }}>
              <Form.Item
                name="interests"
                label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Ваши интересы</span>}
                rules={[{ required: true, message: 'Выберите или введите хотя бы один интерес' }]}
              >
                <Select
                  mode="tags"
                  placeholder="Начните вводить интерес или выберите из списка..."
                  style={{
                    width: '100%'
                  }}
                  options={interestsSearchOptions.length > 0 ? interestsSearchOptions : interestsList}
                  onSearch={async (query) => {
                    if (query && query.length >= 2) {
                      await searchInterests(query);
                    } else {
                      setInterestsSearchOptions([]);
                    }
                  }}
                  onBlur={async () => {
                    // При потере фокуса проверяем, нужно ли создать новые интересы
                    const currentValues = form.getFieldValue('interests') || [];
                    for (const interest of currentValues) {
                      if (interest && interest.trim()) {
                        await createInterestIfNeeded(interest);
                      }
                    }
                    // Обновляем список после создания новых интересов
                    await fetchInterests();
                  }}
                  tokenSeparators={[',']}
                  loading={interestsLoading}
                  filterOption={false}
                  notFoundContent={interestsLoading ? 'Загрузка...' : 'Введите новый интерес и нажмите Enter'}
                  styles={{
                    popup: {
                      root: {
                        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                      }
                    }
                  }}
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
      <Title level={2} style={{ color: isDark ? '#ffffff' : '#000000' }}>
        Заполнение профиля
      </Title>
      <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
        Для участия в обмене подарками необходимо заполнить профиль
      </Text>
      
      <Divider style={{ borderColor: isDark ? '#404040' : '#f0f0f0' }} />
      
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
              <Button
                onClick={() => setCurrentStep(currentStep - 1)}
                style={{
                  backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                  borderColor: isDark ? '#404040' : '#d9d9d9',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              >
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
