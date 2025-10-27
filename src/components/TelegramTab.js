import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  Switch,
  Table,
  Modal,
  message,
  Space,
  Typography,
  Alert,
  Tag,
  Tooltip,
  Select,
  Divider
} from 'antd';
import {
  RobotOutlined,
  SendOutlined,
  UserOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  BellOutlined,
  SettingOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;
const { Option } = Select;

const TelegramTab = () => {
  const [botSettings, setBotSettings] = useState(null);
  const [telegramUsers, setTelegramUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [notificationForm] = Form.useForm();
  const [sendNotificationModal, setSendNotificationModal] = useState(false);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [notificationType, setNotificationType] = useState('');

  // Загрузка настроек бота
  const fetchBotSettings = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/telegram/bot', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBotSettings(response.data);
      if (response.data) {
        form.setFieldsValue({
          bot_token: response.data.bot_token,
          is_active: response.data.is_active
        });
      }
    } catch (error) {
      console.error('Ошибка загрузки настроек бота:', error);
    }
  };

  // Загрузка подписчиков
  const fetchTelegramUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/admin/telegram/users', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTelegramUsers(response.data);
    } catch (error) {
      console.error('Ошибка загрузки подписчиков:', error);
    }
  };

  // Загрузка мероприятий
  const fetchEvents = async () => {
    try {
      const response = await axios.get('/events/');
      setEvents(response.data);
    } catch (error) {
      console.error('Ошибка загрузки мероприятий:', error);
    }
  };

  useEffect(() => {
    fetchBotSettings();
    fetchTelegramUsers();
    fetchEvents();
  }, []);

  // Сохранение настроек бота
  const handleSaveBotSettings = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/admin/telegram/bot', {
        bot_token: values.bot_token
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBotSettings(response.data);
      message.success('Настройки Telegram бота сохранены');
      fetchBotSettings();
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
      message.error(error.response?.data?.detail || 'Ошибка сохранения настроек');
    } finally {
      setLoading(false);
    }
  };

  // Обновление статуса бота
  const handleToggleBotStatus = async (checked) => {
    if (!botSettings) return;
    
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/admin/telegram/bot/${botSettings.id}`, {
        is_active: checked
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setBotSettings({ ...botSettings, is_active: checked });
      message.success(`Telegram бот ${checked ? 'активирован' : 'деактивирован'}`);
    } catch (error) {
      console.error('Ошибка обновления статуса:', error);
      message.error('Ошибка обновления статуса бота');
    } finally {
      setLoading(false);
    }
  };

  // Отправка уведомления
  const handleSendNotification = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('/admin/telegram/send-notification', {
        message: values.message,
        event_id: values.event_id
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success(`Уведомления отправлены: ${response.data.sent} успешно, ${response.data.failed} с ошибками`);
      setSendNotificationModal(false);
      notificationForm.resetFields();
    } catch (error) {
      console.error('Ошибка отправки уведомления:', error);
      message.error(error.response?.data?.detail || 'Ошибка отправки уведомления');
    } finally {
      setLoading(false);
    }
  };

  // Отправка уведомления о мероприятии
  const handleSendEventNotification = async () => {
    if (!selectedEvent || !notificationType) {
      message.error('Выберите мероприятие и тип уведомления');
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post(`/admin/telegram/send-event-notification/${selectedEvent.id}?notification_type=${notificationType}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success(`Уведомления о мероприятии отправлены: ${response.data.sent} успешно, ${response.data.failed} с ошибками`);
    } catch (error) {
      console.error('Ошибка отправки уведомления о мероприятии:', error);
      message.error(error.response?.data?.detail || 'Ошибка отправки уведомления');
    } finally {
      setLoading(false);
    }
  };

  // Колонки таблицы подписчиков
  const userColumns = [
    {
      title: 'Пользователь',
      dataIndex: 'user_id',
      key: 'user_id',
      render: (userId) => {
        const user = telegramUsers.find(u => u.user_id === userId);
        return user ? `ID: ${userId}` : `ID: ${userId}`;
      }
    },
    {
      title: 'Telegram ID',
      dataIndex: 'telegram_id',
      key: 'telegram_id',
    },
    {
      title: 'Username',
      dataIndex: 'telegram_username',
      key: 'telegram_username',
      render: (username) => username ? `@${username}` : '-'
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'} icon={isActive ? <CheckCircleOutlined /> : <CloseCircleOutlined />}>
          {isActive ? 'Активен' : 'Неактивен'}
        </Tag>
      )
    },
    {
      title: 'Подписка',
      dataIndex: 'subscribed_at',
      key: 'subscribed_at',
      render: (date) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: 'Последнее уведомление',
      dataIndex: 'last_notification',
      key: 'last_notification',
      render: (date) => date ? new Date(date).toLocaleDateString('ru-RU') : 'Никогда'
    }
  ];

  // Типы уведомлений о мероприятиях
  const notificationTypes = [
    { value: 'event_created', label: 'Создано новое мероприятие' },
    { value: 'preregistration_started', label: 'Началась предварительная регистрация' },
    { value: 'registration_started', label: 'Началась основная регистрация' },
    { value: 'registration_ending_soon', label: 'Регистрация заканчивается скоро' },
    { value: 'event_ended', label: 'Мероприятие завершено' }
  ];

  return (
    <div>
      {/* Настройки бота */}
      <Card title={<><SettingOutlined /> Настройки бота</>} style={{ marginBottom: '24px' }}>
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveBotSettings}
        >
          <Form.Item
            label="Токен бота"
            name="bot_token"
            rules={[{ required: true, message: 'Введите токен бота' }]}
            extra="Получите токен у @BotFather в Telegram"
          >
            <Input.Password placeholder="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz" />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Сохранить настройки
              </Button>
              {botSettings && (
                <Switch
                  checked={botSettings.is_active}
                  onChange={handleToggleBotStatus}
                  loading={loading}
                  checkedChildren="Активен"
                  unCheckedChildren="Неактивен"
                />
              )}
            </Space>
          </Form.Item>
        </Form>

        {botSettings && (
          <Alert
            message={`Бот: @${botSettings.bot_username || 'неизвестно'}`}
            description={`Статус: ${botSettings.is_active ? 'Активен' : 'Неактивен'} | Создан: ${new Date(botSettings.created_at).toLocaleDateString('ru-RU')}`}
            type={botSettings.is_active ? 'success' : 'warning'}
            showIcon
            style={{ marginTop: '16px' }}
          />
        )}
      </Card>

      {/* Статистика подписчиков */}
      <Card title={<><UserOutlined /> Подписчики ({telegramUsers.length})</>} style={{ marginBottom: '24px' }}>
        <Table
          dataSource={telegramUsers}
          columns={userColumns}
          rowKey="id"
          pagination={{ pageSize: 10 }}
          size="small"
        />
      </Card>

      {/* Отправка уведомлений */}
      <Card title={<><BellOutlined /> Отправка уведомлений</>}>
        <Space direction="vertical" style={{ width: '100%' }}>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={() => setSendNotificationModal(true)}
            disabled={!botSettings?.is_active}
          >
            Отправить произвольное уведомление
          </Button>

          <Divider>Или отправить уведомление о мероприятии</Divider>

          <Space>
            <Select
              placeholder="Выберите мероприятие"
              style={{ width: 300 }}
              onChange={setSelectedEvent}
              value={selectedEvent?.id}
            >
              {events.map(event => (
                <Option key={event.id} value={event.id}>
                  {event.name}
                </Option>
              ))}
            </Select>

            <Select
              placeholder="Тип уведомления"
              style={{ width: 300 }}
              onChange={setNotificationType}
              value={notificationType}
            >
              {notificationTypes.map(type => (
                <Option key={type.value} value={type.value}>
                  {type.label}
                </Option>
              ))}
            </Select>

            <Button
              type="primary"
              onClick={handleSendEventNotification}
              loading={loading}
              disabled={!botSettings?.is_active || !selectedEvent || !notificationType}
            >
              Отправить
            </Button>
          </Space>
        </Space>
      </Card>

      {/* Модальное окно для произвольного уведомления */}
      <Modal
        title="Отправить уведомление"
        open={sendNotificationModal}
        onCancel={() => setSendNotificationModal(false)}
        footer={null}
        width={600}
      >
        <Form
          form={notificationForm}
          layout="vertical"
          onFinish={handleSendNotification}
        >
          <Form.Item
            label="Сообщение"
            name="message"
            rules={[{ required: true, message: 'Введите сообщение' }]}
          >
            <TextArea
              rows={6}
              placeholder="Введите текст уведомления..."
              maxLength={4096}
              showCount
            />
          </Form.Item>

          <Form.Item
            label="Связанное мероприятие (необязательно)"
            name="event_id"
          >
            <Select placeholder="Выберите мероприятие" allowClear>
              {events.map(event => (
                <Option key={event.id} value={event.id}>
                  {event.name}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Отправить
              </Button>
              <Button onClick={() => setSendNotificationModal(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default TelegramTab;
