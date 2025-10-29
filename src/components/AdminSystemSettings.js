import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Typography, Space, Alert, Tabs, Switch, Row, Col, ColorPicker, InputNumber, Select } from 'antd';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined, 
  GlobalOutlined, 
  UserOutlined,
  MailOutlined,
  BgColorsOutlined,
  SecurityScanOutlined,
  DatabaseOutlined,
  NotificationOutlined,
  ClockCircleOutlined,
  TeamOutlined
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminSystemSettings = () => {
  const { isDark } = useTheme();
  
  // Общие стили для полей ввода
  const inputStyle = {
    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
  };
  
  const [form] = Form.useForm();
  const [smtpForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Получаем активный таб из URL или используем дефолтный
  const getActiveTabFromUrl = () => {
    const pathParts = location.pathname.split('/');
    const tab = pathParts[pathParts.length - 1];
    const validTabs = ['general', 'colors', 'smtp', 'security', 'notifications', 'system'];
    return validTabs.includes(tab) ? tab : 'general';
  };
  
  const [activeTab, setActiveTab] = useState(getActiveTabFromUrl());

  useEffect(() => {
    fetchSettings();
  }, []);

  // Обновляем активный таб при изменении URL
  useEffect(() => {
    const newActiveTab = getActiveTabFromUrl();
    setActiveTab(newActiveTab);
  }, [location.pathname]);

  const handleTabChange = (key) => {
    setActiveTab(key);
    navigate(`/admin/settings/${key}`);
  };

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/admin/settings');
      setSettings(response.data);
      
      // Заполняем формы данными после монтирования компонента
      const formData = {};
      response.data.forEach(setting => {
        formData[setting.key] = setting.value;
      });
      
      // Используем setTimeout для гарантии, что форма уже смонтирована
      setTimeout(() => {
        if (form && typeof form.setFieldsValue === 'function') {
          form.setFieldsValue(formData);
        }
        if (smtpForm && typeof smtpForm.setFieldsValue === 'function') {
          smtpForm.setFieldsValue(formData);
        }
      }, 0);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const adminToken = localStorage.getItem('token');
      
      // Обновляем каждую настройку
      const updatePromises = Object.entries(values).map(([key, value]) =>
        axios.put(`/admin/settings/${key}`, 
          { value: value },
          { headers: { Authorization: `Bearer ${adminToken}` } }
        )
      );
      
      await Promise.all(updatePromises);
      
      // Перезагружаем настройки
      await fetchSettings();
      
      // Показываем сообщение об успехе
      alert('Настройки успешно сохранены!');
    } catch (error) {
      console.error('Error saving settings:', error);
      alert('Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const renderGeneralTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <ProCard 
        size="small" 
        title={
          <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
            Общие настройки сайта
          </span>
        }
        style={{
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Alert
          message="Основные настройки"
          description="Настройте название сайта и описание, которые будут отображаться пользователям."
          type="info"
          showIcon
          style={{ 
            marginBottom: 16,
            backgroundColor: isDark ? '#2f2f2f' : '#f6ffed',
            border: isDark ? '1px solid #404040' : '1px solid #b7eb8f',
            color: isDark ? '#ffffff' : '#000000'
          }}
        />
        
        <Form.Item
          name="site_title"
          label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Название сайта</span>}
          rules={[
            { required: true, message: 'Название сайта обязательно' },
            { max: 100, message: 'Название сайта не должно превышать 100 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Введите название сайта"
            prefix={<GlobalOutlined />}
            maxLength={100}
            showCount
            style={inputStyle}
          />
        </Form.Item>

        <Form.Item
          name="site_description"
          label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Описание сайта</span>}
          rules={[
            { required: true, message: 'Описание сайта обязательно' },
            { max: 500, message: 'Описание сайта не должно превышать 500 символов' }
          ]}
        >
          <TextArea
            style={inputStyle}
            placeholder="Введите описание сайта"
            rows={4}
            maxLength={500}
            showCount
            style={inputStyle}
          />
        </Form.Item>
      </ProCard>

      <ProCard 
        size="small" 
        title={
          <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
            Приветственное сообщение
          </span>
        }
        style={{ 
          marginTop: 16,
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Alert
          message="Настройки главной страницы"
          description="Настройте приветственные сообщения, которые будут отображаться на главной странице."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="welcome_title"
          label="Заголовок приветствия"
          rules={[
            { required: true, message: 'Заголовок приветствия обязателен' },
            { max: 100, message: 'Заголовок не должен превышать 100 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Введите заголовок приветствия"
            prefix={<SettingOutlined />}
            maxLength={100}
            showCount
          />
                </Form.Item>

        <Form.Item
          name="welcome_subtitle"
          label="Подзаголовок приветствия"
          rules={[
            { required: true, message: 'Подзаголовок приветствия обязателен' },
            { max: 200, message: 'Подзаголовок не должен превышать 200 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Введите подзаголовок приветствия"
            prefix={<SettingOutlined />}
            maxLength={200}
            showCount
          />
                </Form.Item>

        <Form.Item
          name="welcome_message"
          label="Приветственное сообщение для пользователей"
          rules={[
            { required: true, message: 'Приветственное сообщение обязательно' },
            { max: 300, message: 'Сообщение не должно превышать 300 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Привет, Тестовый пользователь 1!"
            prefix={<UserOutlined />}
            maxLength={300}
            showCount
          />
                </Form.Item>
      </ProCard>

      <ProCard size="small" title="Настройки кнопок мероприятий" style={{ marginTop: 16 }}>
        <Alert
          message="Тексты кнопок для этапов мероприятий"
          description="Настройте названия кнопок для разных этапов участия в мероприятиях."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="button_preregistration"
          label="Кнопка предварительной регистрации"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Хочу!"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
                </Form.Item>

        <Form.Item
          name="button_registration"
          label="Кнопка основной регистрации"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Регистрация"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
                </Form.Item>

        <Form.Item
          name="button_confirm_participation"
          label="Кнопка подтверждения участия"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Подтвердить участие"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
                </Form.Item>

        <Form.Item
          name="button_soon"
          label="Кнопка для предварительно зарегистрированных"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Уже скоро :)"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
                </Form.Item>

        <Form.Item
          name="button_participating"
          label="Кнопка для подтвержденных участников"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            style={inputStyle}
            placeholder="Вы участвуете в мероприятии"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
                </Form.Item>
      </ProCard>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Space size="middle">
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            Сохранить настройки
          </Button>
          <Button 
            onClick={fetchSettings}
            icon={<ReloadOutlined />}
            size="large"
          >
            Обновить
          </Button>
        </Space>
      </div>
    </Form>
  );

  const renderColorsTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <ProCard size="small" title="Настройки цветовой схемы">
        <Alert
          message="Цветовая схема интерфейса"
          description="Настройте основные цвета интерфейса для персонализации внешнего вида системы."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
                <Form.Item
                  name="primary_color"
                  label="Основной цвет кнопок"
                  rules={[
                    { required: true, message: 'Основной цвет обязателен' }
                  ]}
                >
                  <ColorPicker
                    showText
                    format="hex"
                    placeholder="#2d5016"
                    style={{ width: '100%' }}
                  />
                </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="primary_hover_color"
              label="Цвет кнопок при наведении"
              rules={[
                { required: true, message: 'Цвет при наведении обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#3d6b1a"
                style={{ width: '100%' }}
              />
                </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="success_color"
              label="Цвет успеха"
              rules={[
                { required: true, message: 'Цвет успеха обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#52c41a"
                style={{ width: '100%' }}
              />
                </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="warning_color"
              label="Цвет предупреждения"
              rules={[
                { required: true, message: 'Цвет предупреждения обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#faad14"
                style={{ width: '100%' }}
              />
                </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="error_color"
              label="Цвет ошибки"
              rules={[
                { required: true, message: 'Цвет ошибки обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#ff4d4f"
                style={{ width: '100%' }}
              />
                </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="link_color"
              label="Цвет ссылок"
              rules={[
                { required: true, message: 'Цвет ссылок обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#2d5016"
                style={{ width: '100%' }}
              />
                </Form.Item>
          </Col>
        </Row>
      </ProCard>

      <ProCard size="small" title="Настройки кнопок" style={{ marginTop: 16 }}>
        <Alert
          message="Цвета различных типов кнопок"
          description="Настройте цвета для всех типов кнопок в интерфейсе."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="button_primary_color"
              label="Основные кнопки (Primary)"
              rules={[
                { required: true, message: 'Цвет основных кнопок обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#2d5016"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="button_primary_hover_color"
              label="Основные кнопки при наведении"
              rules={[
                { required: true, message: 'Цвет при наведении обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#3d6b1a"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="button_default_color"
              label="Обычные кнопки (Default)"
              rules={[
                { required: true, message: 'Цвет обычных кнопок обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#434343"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="button_default_hover_color"
              label="Обычные кнопки при наведении"
              rules={[
                { required: true, message: 'Цвет при наведении обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#595959"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="button_dashed_color"
              label="Пунктирные кнопки (Dashed)"
              rules={[
                { required: true, message: 'Цвет пунктирных кнопок обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#434343"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="button_dashed_hover_color"
              label="Пунктирные кнопки при наведении"
              rules={[
                { required: true, message: 'Цвет при наведении обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#595959"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="button_text_color"
              label="Текстовые кнопки (Text)"
              rules={[
                { required: true, message: 'Цвет текстовых кнопок обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#2d5016"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="button_text_hover_color"
              label="Текстовые кнопки при наведении"
              rules={[
                { required: true, message: 'Цвет при наведении обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#3d6b1a"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Form.Item
              name="button_link_color"
              label="Кнопки-ссылки (Link)"
              rules={[
                { required: true, message: 'Цвет кнопок-ссылок обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#2d5016"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <Form.Item
              name="button_link_hover_color"
              label="Кнопки-ссылки при наведении"
              rules={[
                { required: true, message: 'Цвет при наведении обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#3d6b1a"
                style={{ width: '100%' }}
              />
            </Form.Item>
          </Col>
        </Row>
      </ProCard>

      <ProCard size="small" title="Предварительный просмотр" style={{ marginTop: 16 }}>
        <Alert
          message="Примеры цветов"
          description="Посмотрите, как будут выглядеть цвета в интерфейсе."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Row gutter={[16, 16]}>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="primary" 
                style={{ 
                  marginBottom: '8px',
                  backgroundColor: '#2d5016',
                  borderColor: '#2d5016'
                }}
              >
                Основная кнопка
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Primary
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                style={{ 
                  marginBottom: '8px',
                  backgroundColor: '#434343',
                  borderColor: '#434343',
                  color: 'white'
                }}
              >
                Обычная кнопка
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Default
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="dashed"
                style={{ 
                  marginBottom: '8px',
                  borderColor: '#434343',
                  color: '#434343'
                }}
              >
                Пунктирная кнопка
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Dashed
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="text"
                style={{ 
                  marginBottom: '8px',
                  color: '#2d5016'
                }}
              >
                Текстовая кнопка
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Text
              </Text>
            </div>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginTop: '16px' }}>
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                type="link"
                style={{ 
                  marginBottom: '8px',
                  color: '#2d5016'
                }}
              >
                Кнопка-ссылка
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Link
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                style={{ 
                  marginBottom: '8px',
                  backgroundColor: '#52c41a',
                  borderColor: '#52c41a',
                  color: 'white'
                }}
              >
                Успех
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Success
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                style={{ 
                  marginBottom: '8px',
                  backgroundColor: '#faad14',
                  borderColor: '#faad14',
                  color: 'white'
                }}
              >
                Предупреждение
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Warning
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                danger
                style={{ 
                  marginBottom: '8px',
                  backgroundColor: '#ff4d4f',
                  borderColor: '#ff4d4f',
                  color: 'white'
                }}
              >
                Ошибка
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Danger
              </Text>
            </div>
          </Col>
        </Row>
      </ProCard>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Space size="middle">
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            Сохранить цвета
          </Button>
        </Space>
      </div>
    </Form>
  );

  const renderSmtpTab = () => (
    <Form
      form={smtpForm}
      layout="vertical"
      onFinish={handleSave}
    >
      <ProCard size="small" title="Настройки SMTP">
        <Alert
          message="Конфигурация почтового сервера"
          description="Настройте параметры SMTP для отправки уведомлений пользователям."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="smtp_enabled"
          label="Включить SMTP"
          valuePropName="checked"
        >
          <Switch />
                </Form.Item>

        <Form.Item
          name="smtp_host"
          label="Адрес SMTP сервера"
        >
          <Input
            style={inputStyle}
            placeholder="smtp.gmail.com"
            prefix={<MailOutlined />}
          />
                </Form.Item>

        <Form.Item
          name="smtp_port"
          label="Порт SMTP сервера"
        >
          <Input
            style={inputStyle}
            placeholder="587"
            prefix={<SettingOutlined />}
          />
                </Form.Item>

        <Form.Item
          name="smtp_username"
          label="Имя пользователя SMTP"
        >
          <Input
            style={inputStyle}
            placeholder="your-email@gmail.com"
            prefix={<UserOutlined />}
          />
                </Form.Item>

        <Form.Item
          name="smtp_password"
          label="Пароль SMTP"
        >
          <Input.Password
            style={inputStyle}
            placeholder="Введите пароль"
            prefix={<SettingOutlined />}
          />
                </Form.Item>

        <Form.Item
          name="smtp_from_email"
          label="Email отправителя"
        >
          <Input
            style={inputStyle}
            placeholder="noreply@example.com"
            prefix={<MailOutlined />}
          />
                </Form.Item>

        <Form.Item
          name="smtp_from_name"
          label="Имя отправителя"
        >
          <Input
            style={inputStyle}
            placeholder="Анонимный Дед Мороз"
            prefix={<UserOutlined />}
          />
                </Form.Item>

        <Form.Item
          name="smtp_use_tls"
          label="Использовать TLS"
          valuePropName="checked"
        >
          <Switch />
                </Form.Item>
      </ProCard>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Space size="middle">
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            Сохранить настройки SMTP
          </Button>
        </Space>
      </div>
    </Form>
  );

  const renderSecurityTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <ProCard size="small" title="Настройки безопасности">
        <Alert
          message="Параметры безопасности системы"
          description="Настройте параметры безопасности для защиты системы и пользователей."
          type="warning"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="session_timeout"
          label="Время жизни сессии (минуты)"
          rules={[
            { required: true, message: 'Время жизни сессии обязательно' },
            { type: 'number', min: 5, max: 1440, message: 'Время должно быть от 5 до 1440 минут' }
          ]}
        >
          <Input
            style={inputStyle}Number
            placeholder="480"
            prefix={<ClockCircleOutlined />}
            style={{ width: '100%' }}
            min={5}
            max={1440}
          />
        </Form.Item>

        <Form.Item
          name="max_login_attempts"
          label="Максимальное количество попыток входа"
          rules={[
            { required: true, message: 'Количество попыток обязательно' },
            { type: 'number', min: 3, max: 10, message: 'Количество должно быть от 3 до 10' }
          ]}
        >
          <Input
            style={inputStyle}Number
            placeholder="5"
            prefix={<SecurityScanOutlined />}
            style={{ width: '100%' }}
            min={3}
            max={10}
          />
        </Form.Item>

        <Form.Item
          name="password_min_length"
          label="Минимальная длина пароля"
          rules={[
            { required: true, message: 'Минимальная длина пароля обязательна' },
            { type: 'number', min: 6, max: 20, message: 'Длина должна быть от 6 до 20 символов' }
          ]}
        >
          <Input
            style={inputStyle}Number
            placeholder="8"
            prefix={<SecurityScanOutlined />}
            style={{ width: '100%' }}
            min={6}
            max={20}
          />
        </Form.Item>

        <Form.Item
          name="require_password_complexity"
          label="Требовать сложный пароль"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="enable_two_factor"
          label="Включить двухфакторную аутентификацию"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="ip_whitelist_enabled"
          label="Включить белый список IP адресов"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="allowed_ips"
          label="Разрешенные IP адреса (через запятую)"
        >
          <TextArea
            style={inputStyle}
            placeholder="192.168.1.0/24, 10.0.0.0/8"
            rows={3}
            prefix={<SecurityScanOutlined />}
          />
        </Form.Item>
      </ProCard>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Space size="middle">
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            Сохранить настройки безопасности
          </Button>
        </Space>
      </div>
    </Form>
  );

  const renderNotificationsTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <ProCard size="small" title="Настройки уведомлений">
        <Alert
          message="Параметры уведомлений"
          description="Настройте, какие уведомления отправлять пользователям и как."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="email_notifications_enabled"
          label="Включить email уведомления"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="notify_event_created"
          label="Уведомлять о создании новых мероприятий"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="notify_registration_start"
          label="Уведомлять о начале регистрации"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="notify_registration_end"
          label="Уведомлять о скором окончании регистрации"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="notify_gift_assigned"
          label="Уведомлять о назначении подарка"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="notification_days_before"
          label="За сколько дней уведомлять о начале регистрации"
          rules={[
            { required: true, message: 'Количество дней обязательно' },
            { type: 'number', min: 1, max: 30, message: 'Количество должно быть от 1 до 30 дней' }
          ]}
        >
          <Input
            style={inputStyle}Number
            placeholder="3"
            prefix={<NotificationOutlined />}
            style={{ width: '100%' }}
            min={1}
            max={30}
          />
        </Form.Item>
      </ProCard>

      <ProCard size="small" title="Настройки Telegram" style={{ marginTop: 16 }}>
        <Alert
          message="Интеграция с Telegram"
          description="Настройте отправку уведомлений через Telegram бота."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="telegram_enabled"
          label="Включить Telegram уведомления"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="telegram_bot_token"
          label="Токен Telegram бота"
        >
          <Input.Password
            style={inputStyle}
            placeholder="123456789:ABCdefGHIjklMNOpqrsTUVwxyz"
            prefix={<NotificationOutlined />}
          />
        </Form.Item>

        <Form.Item
          name="telegram_chat_id"
          label="ID чата для уведомлений"
        >
          <Input
            style={inputStyle}
            placeholder="-1001234567890"
            prefix={<NotificationOutlined />}
          />
        </Form.Item>
      </ProCard>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Space size="middle">
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            Сохранить настройки уведомлений
          </Button>
        </Space>
      </div>
    </Form>
  );

  const renderSystemTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <ProCard size="small" title="Системные параметры">
        <Alert
          message="Основные параметры системы"
          description="Настройте основные параметры работы системы."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="max_users_per_event"
          label="Максимальное количество участников на мероприятие"
          rules={[
            { required: true, message: 'Максимальное количество участников обязательно' },
            { type: 'number', min: 2, max: 1000, message: 'Количество должно быть от 2 до 1000' }
          ]}
        >
          <Input
            style={inputStyle}Number
            placeholder="100"
            prefix={<TeamOutlined />}
            style={{ width: '100%' }}
            min={2}
            max={1000}
          />
        </Form.Item>

        <Form.Item
          name="auto_assign_gifts"
          label="Автоматически назначать подарки"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="allow_self_gift"
          label="Разрешить дарить подарок самому себе"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="registration_deadline_hours"
          label="За сколько часов до мероприятия закрывать регистрацию"
          rules={[
            { required: true, message: 'Количество часов обязательно' },
            { type: 'number', min: 1, max: 168, message: 'Количество должно быть от 1 до 168 часов' }
          ]}
        >
          <Input
            style={inputStyle}Number
            placeholder="24"
            prefix={<ClockCircleOutlined />}
            style={{ width: '100%' }}
            min={1}
            max={168}
          />
        </Form.Item>

        <Form.Item
          name="default_event_duration_days"
          label="Продолжительность мероприятия по умолчанию (дни)"
          rules={[
            { required: true, message: 'Продолжительность мероприятия обязательна' },
            { type: 'number', min: 1, max: 365, message: 'Продолжительность должна быть от 1 до 365 дней' }
          ]}
        >
          <Input
            style={inputStyle}Number
            placeholder="7"
            prefix={<ClockCircleOutlined />}
            style={{ width: '100%' }}
            min={1}
            max={365}
          />
        </Form.Item>
      </ProCard>

      <ProCard size="small" title="Настройки базы данных" style={{ marginTop: 16 }}>
        <Alert
          message="Параметры базы данных"
          description="Настройки для работы с базой данных."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="db_backup_enabled"
          label="Включить автоматическое резервное копирование"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="db_backup_frequency"
          label="Частота резервного копирования"
        >
          <Select
            placeholder="Выберите частоту"
            options={[
              { value: 'daily', label: 'Ежедневно' },
              { value: 'weekly', label: 'Еженедельно' },
              { value: 'monthly', label: 'Ежемесячно' }
            ]}
          />
        </Form.Item>

        <Form.Item
          name="db_cleanup_enabled"
          label="Включить автоматическую очистку старых данных"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="db_cleanup_days"
          label="Удалять данные старше (дней)"
          rules={[
            { type: 'number', min: 30, max: 3650, message: 'Количество должно быть от 30 до 3650 дней' }
          ]}
        >
          <Input
            style={inputStyle}Number
            placeholder="365"
            prefix={<DatabaseOutlined />}
            style={{ width: '100%' }}
            min={30}
            max={3650}
          />
        </Form.Item>
      </ProCard>

      <div style={{ textAlign: 'center', marginTop: '24px' }}>
        <Space size="middle">
          <Button 
            type="primary" 
            htmlType="submit"
            loading={loading}
            icon={<SaveOutlined />}
            size="large"
          >
            Сохранить системные настройки
          </Button>
        </Space>
      </div>
    </Form>
  );

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: isDark ? '#141414' : '#ffffff',
      minHeight: '100vh'
    }}>
      <ProCard 
        style={{ 
          marginBottom: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #303030' : '1px solid #d9d9d9'
        }}
      >
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title 
              level={2}
              style={{ color: isDark ? '#ffffff' : '#000000' }}
            >
              <Space>
                <SettingOutlined />
                Системные настройки
              </Space>
            </Title>
            <Text 
              type="secondary"
              style={{ color: isDark ? '#a6a6a6' : '#666666' }}
            >
              Управление конфигурацией системы
            </Text>
          </Col>
        </Row>
      </ProCard>

      <ProCard
        style={{
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #303030' : '1px solid #d9d9d9'
        }}
      >
        <Tabs
          activeKey={activeTab}
          onChange={handleTabChange}
          style={{
            color: isDark ? '#ffffff' : '#000000'
          }}
          items={[
            {
              key: 'general',
              label: (
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  <GlobalOutlined />
                  Общие
                </span>
              ),
              children: renderGeneralTab(),
            },
            {
              key: 'colors',
              label: (
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  <BgColorsOutlined />
                  Цвета
                </span>
              ),
              children: renderColorsTab(),
            },
            {
              key: 'smtp',
              label: (
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  <MailOutlined />
                  SMTP
                </span>
              ),
              children: renderSmtpTab(),
            },
            {
              key: 'security',
              label: (
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  <SecurityScanOutlined />
                  Безопасность
                </span>
              ),
              children: renderSecurityTab(),
            },
            {
              key: 'notifications',
              label: (
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  <NotificationOutlined />
                  Уведомления
                </span>
              ),
              children: renderNotificationsTab(),
            },
            {
              key: 'system',
              label: (
                <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  <DatabaseOutlined />
                  Система
                </span>
              ),
              children: renderSystemTab(),
            },
          ]}
        />
      </ProCard>
    </div>
  );
};

export default AdminSystemSettings;
