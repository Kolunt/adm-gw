import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Typography, Space, Alert, Tabs, Switch, Row, Col, ColorPicker } from 'antd';
import { 
  SettingOutlined, 
  SaveOutlined, 
  ReloadOutlined, 
  GlobalOutlined, 
  UserOutlined,
  MailOutlined,
  BgColorsOutlined
} from '@ant-design/icons';
import ProForm from '@ant-design/pro-form';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminSystemSettings = () => {
  const [form] = Form.useForm();
  const [colorsForm] = Form.useForm();
  const [smtpForm] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState([]);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await axios.get('/admin/settings');
      setSettings(response.data);
      
      // Заполняем формы данными
      const formData = {};
      response.data.forEach(setting => {
        formData[setting.key] = setting.value;
      });
      form.setFieldsValue(formData);
      colorsForm.setFieldsValue(formData);
      smtpForm.setFieldsValue(formData);
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
    <ProForm
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <ProCard size="small" title="Общие настройки сайта">
        <Alert
          message="Основные настройки"
          description="Настройте название сайта и описание, которые будут отображаться пользователям."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <ProForm.Item
          name="site_title"
          label="Название сайта"
          rules={[
            { required: true, message: 'Название сайта обязательно' },
            { max: 100, message: 'Название сайта не должно превышать 100 символов' }
          ]}
        >
          <Input
            placeholder="Введите название сайта"
            prefix={<GlobalOutlined />}
            maxLength={100}
            showCount
          />
        </ProForm.Item>

        <ProForm.Item
          name="site_description"
          label="Описание сайта"
          rules={[
            { required: true, message: 'Описание сайта обязательно' },
            { max: 500, message: 'Описание сайта не должно превышать 500 символов' }
          ]}
        >
          <TextArea
            placeholder="Введите описание сайта"
            rows={4}
            maxLength={500}
            showCount
          />
        </ProForm.Item>
      </ProCard>

      <ProCard size="small" title="Приветственное сообщение" style={{ marginTop: 16 }}>
        <Alert
          message="Настройки главной страницы"
          description="Настройте приветственные сообщения, которые будут отображаться на главной странице."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <ProForm.Item
          name="welcome_title"
          label="Заголовок приветствия"
          rules={[
            { required: true, message: 'Заголовок приветствия обязателен' },
            { max: 100, message: 'Заголовок не должен превышать 100 символов' }
          ]}
        >
          <Input
            placeholder="Введите заголовок приветствия"
            prefix={<SettingOutlined />}
            maxLength={100}
            showCount
          />
        </ProForm.Item>

        <ProForm.Item
          name="welcome_subtitle"
          label="Подзаголовок приветствия"
          rules={[
            { required: true, message: 'Подзаголовок приветствия обязателен' },
            { max: 200, message: 'Подзаголовок не должен превышать 200 символов' }
          ]}
        >
          <Input
            placeholder="Введите подзаголовок приветствия"
            prefix={<SettingOutlined />}
            maxLength={200}
            showCount
          />
        </ProForm.Item>

        <ProForm.Item
          name="welcome_message"
          label="Приветственное сообщение для пользователей"
          rules={[
            { required: true, message: 'Приветственное сообщение обязательно' },
            { max: 300, message: 'Сообщение не должно превышать 300 символов' }
          ]}
        >
          <Input
            placeholder="Привет, Тестовый пользователь 1!"
            prefix={<UserOutlined />}
            maxLength={300}
            showCount
          />
        </ProForm.Item>
      </ProCard>

      <ProCard size="small" title="Настройки кнопок мероприятий" style={{ marginTop: 16 }}>
        <Alert
          message="Тексты кнопок для этапов мероприятий"
          description="Настройте названия кнопок для разных этапов участия в мероприятиях."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <ProForm.Item
          name="button_preregistration"
          label="Кнопка предварительной регистрации"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            placeholder="Хочу!"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
        </ProForm.Item>

        <ProForm.Item
          name="button_registration"
          label="Кнопка основной регистрации"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            placeholder="Регистрация"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
        </ProForm.Item>

        <ProForm.Item
          name="button_confirm_participation"
          label="Кнопка подтверждения участия"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            placeholder="Подтвердить участие"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
        </ProForm.Item>

        <ProForm.Item
          name="button_soon"
          label="Кнопка для предварительно зарегистрированных"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            placeholder="Уже скоро :)"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
        </ProForm.Item>

        <ProForm.Item
          name="button_participating"
          label="Кнопка для подтвержденных участников"
          rules={[
            { required: true, message: 'Текст кнопки обязателен' },
            { max: 50, message: 'Текст кнопки не должен превышать 50 символов' }
          ]}
        >
          <Input
            placeholder="Вы участвуете в мероприятии"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
        </ProForm.Item>
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
    </ProForm>
  );

  const renderColorsTab = () => (
    <ProForm
      form={colorsForm}
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
            <ProForm.Item
              name="primary_color"
              label="Основной цвет кнопок"
              rules={[
                { required: true, message: 'Основной цвет обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#1890ff"
                style={{ width: '100%' }}
              />
            </ProForm.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <ProForm.Item
              name="primary_hover_color"
              label="Цвет кнопок при наведении"
              rules={[
                { required: true, message: 'Цвет при наведении обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#40a9ff"
                style={{ width: '100%' }}
              />
            </ProForm.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <ProForm.Item
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
            </ProForm.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <ProForm.Item
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
            </ProForm.Item>
          </Col>
        </Row>

        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <ProForm.Item
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
            </ProForm.Item>
          </Col>
          
          <Col xs={24} md={12}>
            <ProForm.Item
              name="link_color"
              label="Цвет ссылок"
              rules={[
                { required: true, message: 'Цвет ссылок обязателен' }
              ]}
            >
              <ColorPicker
                showText
                format="hex"
                placeholder="#1890ff"
                style={{ width: '100%' }}
              />
            </ProForm.Item>
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
                  backgroundColor: colorsForm.getFieldValue('primary_color') || '#1890ff',
                  borderColor: colorsForm.getFieldValue('primary_color') || '#1890ff'
                }}
              >
                Основная кнопка
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Основной цвет
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                style={{ 
                  marginBottom: '8px',
                  backgroundColor: colorsForm.getFieldValue('success_color') || '#52c41a',
                  borderColor: colorsForm.getFieldValue('success_color') || '#52c41a',
                  color: 'white'
                }}
              >
                Успех
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Цвет успеха
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                style={{ 
                  marginBottom: '8px',
                  backgroundColor: colorsForm.getFieldValue('warning_color') || '#faad14',
                  borderColor: colorsForm.getFieldValue('warning_color') || '#faad14',
                  color: 'white'
                }}
              >
                Предупреждение
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Цвет предупреждения
              </Text>
            </div>
          </Col>
          
          <Col xs={24} md={6}>
            <div style={{ textAlign: 'center' }}>
              <Button 
                style={{ 
                  marginBottom: '8px',
                  backgroundColor: colorsForm.getFieldValue('error_color') || '#ff4d4f',
                  borderColor: colorsForm.getFieldValue('error_color') || '#ff4d4f',
                  color: 'white'
                }}
              >
                Ошибка
              </Button>
              <br />
              <Text type="secondary" style={{ fontSize: '12px' }}>
                Цвет ошибки
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
    </ProForm>
  );

  const renderSmtpTab = () => (
    <ProForm
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
        
        <ProForm.Item
          name="smtp_enabled"
          label="Включить SMTP"
          valuePropName="checked"
        >
          <Switch />
        </ProForm.Item>

        <ProForm.Item
          name="smtp_host"
          label="Адрес SMTP сервера"
        >
          <Input
            placeholder="smtp.gmail.com"
            prefix={<MailOutlined />}
          />
        </ProForm.Item>

        <ProForm.Item
          name="smtp_port"
          label="Порт SMTP сервера"
        >
          <Input
            placeholder="587"
            prefix={<SettingOutlined />}
          />
        </ProForm.Item>

        <ProForm.Item
          name="smtp_username"
          label="Имя пользователя SMTP"
        >
          <Input
            placeholder="your-email@gmail.com"
            prefix={<UserOutlined />}
          />
        </ProForm.Item>

        <ProForm.Item
          name="smtp_password"
          label="Пароль SMTP"
        >
          <Input.Password
            placeholder="Введите пароль"
            prefix={<SettingOutlined />}
          />
        </ProForm.Item>

        <ProForm.Item
          name="smtp_from_email"
          label="Email отправителя"
        >
          <Input
            placeholder="noreply@example.com"
            prefix={<MailOutlined />}
          />
        </ProForm.Item>

        <ProForm.Item
          name="smtp_from_name"
          label="Имя отправителя"
        >
          <Input
            placeholder="Анонимный Дед Мороз"
            prefix={<UserOutlined />}
          />
        </ProForm.Item>

        <ProForm.Item
          name="smtp_use_tls"
          label="Использовать TLS"
          valuePropName="checked"
        >
          <Switch />
        </ProForm.Item>
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
    </ProForm>
  );

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2}>
              <Space>
                <SettingOutlined />
                Системные настройки
              </Space>
            </Title>
            <Text type="secondary">
              Управление конфигурацией системы
            </Text>
          </Col>
        </Row>
      </ProCard>

      <ProCard>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={[
            {
              key: 'general',
              label: (
                <span>
                  <GlobalOutlined />
                  Общие
                </span>
              ),
              children: renderGeneralTab(),
            },
            {
              key: 'colors',
              label: (
                <span>
                  <BgColorsOutlined />
                  Цвета
                </span>
              ),
              children: renderColorsTab(),
            },
            {
              key: 'smtp',
              label: (
                <span>
                  <MailOutlined />
                  SMTP
                </span>
              ),
              children: renderSmtpTab(),
            },
          ]}
        />
      </ProCard>
    </div>
  );
};

export default AdminSystemSettings;
