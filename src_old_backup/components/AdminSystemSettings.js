import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, Button, Switch, Divider, Typography, message, Space, Tag, Alert, Tabs } from 'antd';
import { SettingOutlined, SaveOutlined, ReloadOutlined, KeyOutlined, CheckCircleOutlined, CheckOutlined, GlobalOutlined, DatabaseOutlined, PictureOutlined, RobotOutlined, MailOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import SiteIconManagement from './SiteIconManagement';
import TelegramTab from './TelegramTab';

const { Title, Paragraph, Text } = Typography;
const { TabPane } = Tabs;
const { TextArea } = Input;

function AdminSystemSettings({ activeTab: initialActiveTab = 'general' }) {
  const navigate = useNavigate();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState([]);
  const [tokenVerifying, setTokenVerifying] = useState(false);
  const [tokenValue, setTokenValue] = useState('');
  const [activeTab, setActiveTab] = useState(initialActiveTab);

  // Обновляем активный таб при изменении пропса
  useEffect(() => {
    setActiveTab(initialActiveTab);
  }, [initialActiveTab]);

  const handleTabChange = (tabKey) => {
    setActiveTab(tabKey);
  };

  const fetchSettings = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.get('/admin/settings', {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      const settingsData = {};
      response.data.forEach(setting => {
        settingsData[setting.key] = setting.value;
      });
      
      setSettings(response.data);
      // Устанавливаем значения формы
      form.setFieldsValue(settingsData);
      setTokenValue(settingsData.dadata_token || '');
    } catch (error) {
      // Только логируем ошибку если это не 401 (неавторизован)
      if (error.response?.status !== 401) {
        console.error('Error fetching settings:', error);
        message.error('Ошибка при загрузке настроек');
      }
    } finally {
      setLoading(false);
    }
  }, [form]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      
      // Обновляем каждую настройку
      for (const [key, value] of Object.entries(values)) {
        await axios.put(`/admin/settings/${key}`, 
          { value: value.toString() },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      }
      
      message.success('Настройки сохранены');
      fetchSettings(); // Перезагружаем настройки
    } catch (error) {
      console.error('Error saving settings:', error);
      message.error('Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    const settingsData = {};
    settings.forEach(setting => {
      settingsData[setting.key] = setting.value;
    });
    // Устанавливаем значения формы только если форма существует
    if (form) {
      form.setFieldsValue(settingsData);
    }
    setTokenValue(settingsData.dadata_token || '');
  };

  const handleVerifyToken = async () => {
    const token = tokenValue || form.getFieldValue('dadata_token');
    if (!token) {
      message.error('Введите токен для проверки');
      return;
    }

    setTokenVerifying(true);
    try {
      const adminToken = localStorage.getItem('token');
      const response = await axios.post('/admin/verify-dadata-token', 
        { token },
        { headers: { Authorization: `Bearer ${adminToken}` } }
      );

      if (response.data.valid) {
        message.success(response.data.message);
      } else {
        message.error(`Токен недействителен: ${response.data.error}`);
      }
    } catch (error) {
      console.error('Error verifying token:', error);
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Ошибка при проверке токена');
      }
    } finally {
      setTokenVerifying(false);
    }
  };

  const getDadataStatus = () => {
    const dadataEnabled = settings.find(s => s.key === 'dadata_enabled');
    const dadataToken = settings.find(s => s.key === 'dadata_token');
    
    if (!dadataEnabled || dadataEnabled.value !== 'true') {
      return { status: 'disabled', text: 'Отключено', color: 'red' };
    }
    
    if (!dadataToken || !dadataToken.value) {
      return { status: 'no-token', text: 'Токен не настроен', color: 'orange' };
    }
    
    return { status: 'enabled', text: 'Активно', color: 'green' };
  };

  const dadataStatus = getDadataStatus();

  const renderSmtpTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <Card size="small" title="Настройки SMTP">
        <Alert
          message="Настройки почтового сервера"
          description="Настройте SMTP сервер для отправки уведомлений пользователям. Функциональность отправки писем будет добавлена позже."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="smtp_enabled"
          label="Включить SMTP"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Включено"
            unCheckedChildren="Отключено"
          />
        </Form.Item>

        <Form.Item
          name="smtp_host"
          label="SMTP сервер"
          rules={[
            { max: 255, message: 'Адрес сервера не должен превышать 255 символов' }
          ]}
        >
          <Input
            placeholder="smtp.gmail.com"
            prefix={<SettingOutlined />}
            maxLength={255}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="smtp_port"
          label="Порт SMTP"
          rules={[
            { pattern: /^\d+$/, message: 'Порт должен содержать только цифры' },
            { max: 5, message: 'Порт не должен превышать 5 символов' }
          ]}
        >
          <Input
            placeholder="587"
            prefix={<SettingOutlined />}
            maxLength={5}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="smtp_username"
          label="Имя пользователя SMTP"
          rules={[
            { max: 255, message: 'Имя пользователя не должно превышать 255 символов' }
          ]}
        >
          <Input
            placeholder="your-email@gmail.com"
            prefix={<SettingOutlined />}
            maxLength={255}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="smtp_password"
          label="Пароль SMTP"
          rules={[
            { max: 255, message: 'Пароль не должен превышать 255 символов' }
          ]}
        >
          <Input.Password
            placeholder="Введите пароль приложения"
            prefix={<SettingOutlined />}
            maxLength={255}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="smtp_from_email"
          label="Email отправителя"
          rules={[
            { type: 'email', message: 'Введите корректный email адрес' },
            { max: 255, message: 'Email не должен превышать 255 символов' }
          ]}
        >
          <Input
            placeholder="noreply@yourdomain.com"
            prefix={<SettingOutlined />}
            maxLength={255}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="smtp_from_name"
          label="Имя отправителя"
          rules={[
            { max: 100, message: 'Имя отправителя не должно превышать 100 символов' }
          ]}
        >
          <Input
            placeholder="Анонимный Дед Мороз"
            prefix={<SettingOutlined />}
            maxLength={100}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="smtp_use_tls"
          label="Использовать TLS"
          valuePropName="checked"
        >
          <Switch
            checkedChildren="Да"
            unCheckedChildren="Нет"
          />
        </Form.Item>
      </Card>

      <Divider />

      <Space>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={loading}
        >
          Сохранить настройки
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          disabled={loading}
        >
          Сбросить
        </Button>
      </Space>
    </Form>
  );

  const renderGeneralTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      <Card size="small" title="Общие настройки сайта">
        <Alert
          message="Основные настройки"
          description="Настройте название сайта и описание, которые будут отображаться пользователям."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
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
        </Form.Item>

        <Form.Item
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
        </Form.Item>
      </Card>

      <Card size="small" title="Приветственное сообщение" style={{ marginTop: 16 }}>
        <Alert
          message="Настройки главной страницы"
          description="Настройте заголовок и подзаголовок, которые будут отображаться на главной странице."
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
            placeholder="Привет, Тестовый пользователь 1!"
            prefix={<UserOutlined />}
            maxLength={300}
            showCount
          />
        </Form.Item>
      </Card>

      <Card size="small" title="Настройки кнопок мероприятий" style={{ marginTop: 16 }}>
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
            placeholder="Подтвердить участие"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
        </Form.Item>

        <Form.Item
          name="button_soon"
          label="Кнопка ожидания (предварительно зарегистрирован)"
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
            placeholder="Вы участвуете в мероприятии"
            prefix={<SettingOutlined />}
            maxLength={50}
            showCount
          />
        </Form.Item>
      </Card>

      <Divider />

      <Space>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={loading}
        >
          Сохранить настройки
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          disabled={loading}
        >
          Сбросить
        </Button>
      </Space>
    </Form>
  );

  const renderDadataTab = () => (
    <Form
      form={form}
      layout="vertical"
      onFinish={handleSave}
    >
      {/* Статус Dadata */}
      <Card size="small" title="Статус автодополнения адресов">
        <Space>
          <Tag color={dadataStatus.color} icon={<CheckCircleOutlined />}>
            {dadataStatus.text}
          </Tag>
          {dadataStatus.status === 'disabled' && (
            <Text type="secondary">Включите автодополнение в настройках ниже</Text>
          )}
          {dadataStatus.status === 'no-token' && (
            <Text type="secondary">Укажите API токен Dadata.ru</Text>
          )}
          {dadataStatus.status === 'enabled' && (
            <Text type="success">Автодополнение адресов работает</Text>
          )}
        </Space>
      </Card>

      <Card size="small" title="Настройки Dadata.ru">
        <Alert
          message="Интеграция с Dadata.ru"
          description="Для работы автодополнения адресов необходимо получить API токен на сайте dadata.ru. Это поможет пользователям быстрее и точнее заполнять адреса."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Form.Item
          name="dadata_enabled"
          label="Включить автодополнение адресов"
          valuePropName="checked"
        >
          <Switch />
        </Form.Item>

        <Form.Item
          name="dadata_token"
          label="API токен Dadata.ru"
          rules={[
            {
              validator: (_, value) => {
                const dadataEnabled = form.getFieldValue('dadata_enabled');
                if (dadataEnabled && !value) {
                  return Promise.reject('Токен обязателен при включенном автодополнении');
                }
                return Promise.resolve();
              }
            }
          ]}
        >
          <div style={{ display: 'flex', gap: '8px' }}>
            <Input.Password
              placeholder="Введите API токен Dadata.ru"
              prefix={<KeyOutlined />}
              style={{ flex: 1 }}
              value={tokenValue}
              onChange={(e) => {
                setTokenValue(e.target.value);
                form.setFieldValue('dadata_token', e.target.value);
              }}
            />
            <Button
              type="default"
              icon={<CheckOutlined />}
              loading={tokenVerifying}
              onClick={handleVerifyToken}
              style={{ minWidth: '120px' }}
            >
              Проверить
            </Button>
          </div>
        </Form.Item>
      </Card>

      <Divider />

      <Space>
        <Button
          type="primary"
          htmlType="submit"
          icon={<SaveOutlined />}
          loading={loading}
        >
          Сохранить настройки
        </Button>
        <Button
          icon={<ReloadOutlined />}
          onClick={handleReset}
          disabled={loading}
        >
          Сбросить
        </Button>
      </Space>
    </Form>
  );

  return (
    <div>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3}>
              <SettingOutlined /> Настройки системы
            </Title>
            <Paragraph type="secondary">
              Управление настройками системы Анонимный Дед Мороз
            </Paragraph>
          </div>

          <Tabs 
            activeKey={activeTab} 
            onChange={handleTabChange}
            defaultActiveKey="general"
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
                key: 'dadata',
                label: (
                  <span>
                    <DatabaseOutlined />
                    Dadata
                  </span>
                ),
                children: renderDadataTab(),
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
              {
                key: 'icon',
                label: (
                  <span>
                    <PictureOutlined />
                    Иконка сайта
                  </span>
                ),
                children: <SiteIconManagement />,
              },
              {
                key: 'telegram',
                label: (
                  <span>
                    <RobotOutlined />
                    Telegram
                  </span>
                ),
                children: <TelegramTab />,
              },
            ]}
          />
        </Space>
      </Card>
    </div>
  );
}

export default AdminSystemSettings;