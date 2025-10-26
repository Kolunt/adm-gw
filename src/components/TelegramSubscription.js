import React, { useState, useEffect } from 'react';
import {
  Card,
  Form,
  Input,
  Button,
  message,
  Space,
  Typography,
  Alert,
  Switch,
  Divider
} from 'antd';
import {
  RobotOutlined,
  BellOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const TelegramSubscription = ({ currentUser }) => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [subscription, setSubscription] = useState(null);
  const [botSettings, setBotSettings] = useState(null);

  // Проверяем, есть ли подписка у пользователя
  const checkSubscription = async () => {
    try {
      const response = await axios.get('/admin/telegram/users');
      const userSubscription = response.data.find(user => user.user_id === currentUser.id);
      setSubscription(userSubscription);
      
      if (userSubscription) {
        form.setFieldsValue({
          telegram_id: userSubscription.telegram_id,
          telegram_username: userSubscription.telegram_username
        });
      }
    } catch (error) {
      console.error('Ошибка проверки подписки:', error);
    }
  };

  // Проверяем настройки бота
  const checkBotSettings = async () => {
    try {
      const response = await axios.get('/admin/telegram/bot');
      setBotSettings(response.data);
    } catch (error) {
      console.error('Ошибка проверки настроек бота:', error);
    }
  };

  useEffect(() => {
    if (currentUser) {
      checkSubscription();
      checkBotSettings();
    }
  }, [currentUser]);

  // Подписка на уведомления
  const handleSubscribe = async (values) => {
    setLoading(true);
    try {
      await axios.post('/api/telegram/subscribe', {
        telegram_id: values.telegram_id,
        telegram_username: values.telegram_username
      });
      
      message.success('Подписка на Telegram уведомления активирована!');
      checkSubscription();
    } catch (error) {
      console.error('Ошибка подписки:', error);
      message.error(error.response?.data?.detail || 'Ошибка подписки');
    } finally {
      setLoading(false);
    }
  };

  // Отписка от уведомлений
  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      await axios.delete('/api/telegram/unsubscribe');
      
      message.success('Подписка на Telegram уведомления отключена');
      checkSubscription();
    } catch (error) {
      console.error('Ошибка отписки:', error);
      message.error(error.response?.data?.detail || 'Ошибка отписки');
    } finally {
      setLoading(false);
    }
  };

  // Если бот не настроен
  if (!botSettings || !botSettings.is_active) {
    return (
      <Card>
        <Title level={4}>
          <RobotOutlined /> Telegram уведомления
        </Title>
        <Alert
          message="Telegram бот не настроен"
          description="Администратор еще не настроил Telegram бота для отправки уведомлений."
          type="info"
          showIcon
        />
      </Card>
    );
  }

  return (
    <Card>
      <Title level={4}>
        <RobotOutlined /> Telegram уведомления
      </Title>
      
      <Text type="secondary" style={{ display: 'block', marginBottom: '16px' }}>
        Получайте уведомления о новых мероприятиях и важных событиях прямо в Telegram!
      </Text>

      {subscription && subscription.is_active ? (
        <div>
          <Alert
            message="Вы подписаны на Telegram уведомления"
            description={
              <div>
                <div>Telegram ID: {subscription.telegram_id}</div>
                {subscription.telegram_username && (
                  <div>Username: @{subscription.telegram_username}</div>
                )}
                <div>Подписка с: {new Date(subscription.subscribed_at).toLocaleDateString('ru-RU')}</div>
                {subscription.last_notification && (
                  <div>Последнее уведомление: {new Date(subscription.last_notification).toLocaleDateString('ru-RU')}</div>
                )}
              </div>
            }
            type="success"
            showIcon
            icon={<CheckCircleOutlined />}
            style={{ marginBottom: '16px' }}
          />
          
          <Button
            danger
            onClick={handleUnsubscribe}
            loading={loading}
            icon={<CloseCircleOutlined />}
          >
            Отписаться от уведомлений
          </Button>
        </div>
      ) : (
        <div>
          <Alert
            message="Как получить Telegram ID?"
            description={
              <div>
                <p>1. Найдите бота @userinfobot в Telegram</p>
                <p>2. Отправьте ему команду /start</p>
                <p>3. Скопируйте ваш ID из ответа бота</p>
                <p>4. Введите ID в поле ниже</p>
              </div>
            }
            type="info"
            showIcon
            style={{ marginBottom: '16px' }}
          />

          <Form
            form={form}
            layout="vertical"
            onFinish={handleSubscribe}
          >
            <Form.Item
              label="Ваш Telegram ID"
              name="telegram_id"
              rules={[
                { required: true, message: 'Введите ваш Telegram ID' },
                { pattern: /^\d+$/, message: 'Telegram ID должен содержать только цифры' }
              ]}
              extra="Например: 123456789"
            >
              <Input placeholder="123456789" />
            </Form.Item>

            <Form.Item
              label="Ваш Telegram username (необязательно)"
              name="telegram_username"
              extra="Например: username (без @)"
            >
              <Input placeholder="username" />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<BellOutlined />}
                block
              >
                Подписаться на уведомления
              </Button>
            </Form.Item>
          </Form>
        </div>
      )}

      <Divider />
      
      <div style={{ fontSize: '12px', color: '#666' }}>
        <Text type="secondary">
          <BellOutlined /> Вы будете получать уведомления о:
        </Text>
        <ul style={{ marginTop: '8px', paddingLeft: '20px' }}>
          <li>Создании новых мероприятий</li>
          <li>Начале регистрации</li>
          <li>Важных изменениях в мероприятиях</li>
          <li>Завершении мероприятий</li>
        </ul>
      </div>
    </Card>
  );
};

export default TelegramSubscription;
