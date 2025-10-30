import React, { useState, useEffect } from 'react';
import { Row, Col, Typography, Button, Space, Spin, Alert } from 'antd';
import { GiftOutlined, TeamOutlined, CalendarOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../../utils/axiosConfig';
import CountdownTimer from '../../components/CountdownTimer';

const { Title, Paragraph, Text } = Typography;

const HomePage = () => {
  const [settings, setSettings] = useState({});
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      console.log('HomePage: Fetching data');
      
      // Простые запросы без Promise.all
      try {
        const settingsResponse = await axios.get('/api/settings/public');
        setSettings(settingsResponse.data || {});
      } catch (err) {
        console.error('HomePage: Error fetching settings:', err);
        setSettings({});
      }
      
      try {
        const eventResponse = await axios.get('/events/current');
        setCurrentEvent(eventResponse.data || null);
      } catch (err) {
        console.error('HomePage: Error fetching current event:', err);
        setCurrentEvent(null);
      }
      
      console.log('HomePage: Data loaded');
    } catch (error) {
      console.error('HomePage: Error fetching data:', error);
    } finally {
      setLoading(false);
      console.log('HomePage: Loading finished');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Загрузка данных...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      {/* Welcome Section */}
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[24, 24]} align="middle">
          <Col xs={24} md={16}>
            <Title level={1} style={{ marginBottom: '16px' }}>
              {settings.welcome_title || '🎅 Анонимный Дед Мороз'}
            </Title>
            <Paragraph style={{ fontSize: '18px', marginBottom: '16px' }}>
              {settings.welcome_subtitle || 'Добро пожаловать в систему обмена подарками!'}
            </Paragraph>
            <Text type="secondary" style={{ fontSize: '16px' }}>
              {settings.welcome_message || 'Привет, Тестовый пользователь 1!'}
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '120px' }}>🎅</div>
          </Col>
        </Row>
      </ProCard>

      {/* Countdown Timer */}
      {currentEvent ? (
        <CountdownTimer event={currentEvent} />
      ) : (
        <ProCard style={{ marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <CalendarOutlined style={{ fontSize: '48px', color: '#2d5016', marginBottom: '16px' }} />
            <Title level={3} style={{ color: 'white' }}>Нет активных мероприятий</Title>
            <Text style={{ fontSize: '16px', marginBottom: '24px', display: 'block', color: 'white' }}>
              В данный момент нет активных мероприятий обмена подарками
            </Text>
            <Button type="primary" href="/events">
              Посмотреть все мероприятия
            </Button>
          </div>
        </ProCard>
      )}

      {/* Current Event Section */}
      {currentEvent && (
        <ProCard 
          title={
            <Space>
              <CalendarOutlined />
              Текущее мероприятие
            </Space>
          }
          style={{ marginBottom: '24px' }}
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
              <Title level={3}>{currentEvent.name}</Title>
              <Paragraph>{currentEvent.description}</Paragraph>
            </Col>
            <Col xs={24} md={12}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>Предварительная регистрация:</Text>
                  <br />
                  <Text>{new Date(currentEvent.preregistration_start).toLocaleDateString('ru-RU')}</Text>
                </div>
                <div>
                  <Text strong>Основная регистрация:</Text>
                  <br />
                  <Text>{new Date(currentEvent.registration_start).toLocaleDateString('ru-RU')}</Text>
                </div>
                <div>
                  <Text strong>Окончание регистрации:</Text>
                  <br />
                  <Text>{new Date(currentEvent.registration_end).toLocaleDateString('ru-RU')}</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </ProCard>
      )}

      {/* Quick Actions */}
      <Row gutter={[16, 16]}>
        <Col xs={24} md={8}>
          <ProCard 
            title={
              <Space>
                <GiftOutlined />
                Мероприятия
              </Space>
            }
            hoverable
            actions={[
              <Button type="primary" href="/events">
                Посмотреть мероприятия
              </Button>
            ]}
          >
            <Paragraph>
              Участвуйте в анонимном обмене подарками с другими участниками сообщества GWars.io
            </Paragraph>
          </ProCard>
        </Col>
        
        <Col xs={24} md={8}>
          <ProCard 
            title={
              <Space>
                <TeamOutlined />
                Участники
              </Space>
            }
            hoverable
            actions={[
              <Button type="primary" href="/users">
                Посмотреть участников
              </Button>
            ]}
          >
            <Paragraph>
              Познакомьтесь с другими участниками системы обмена подарками
            </Paragraph>
          </ProCard>
        </Col>
        
        <Col xs={24} md={8}>
          <ProCard 
            title={
              <Space>
                <CalendarOutlined />
                Профиль
              </Space>
            }
            hoverable
            actions={[
              <Button type="primary" href="/profile">
                Мой профиль
              </Button>
            ]}
          >
            <Paragraph>
              Управляйте своим профилем и настройками участия в мероприятиях
            </Paragraph>
          </ProCard>
        </Col>
      </Row>
    </div>
  );
};

export default HomePage;
