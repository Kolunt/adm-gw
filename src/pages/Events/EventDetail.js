import React, { useState, useEffect } from 'react';
import { Typography, Space, Tag, Button, Row, Col, Spin, Alert, Descriptions, Card } from 'antd';
import { CalendarOutlined, GiftOutlined, TeamOutlined, ClockCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../services/AuthService';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { isDark } = useTheme();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Простая проверка авторизации
  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
  }, [user, navigate]);

  useEffect(() => {
    if (id) {
      fetchEvent();
    }
  }, [id]);

  const fetchEvent = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/events/${id}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      if (error.response?.status === 404) {
        setError('Мероприятие не найдено');
      } else {
        setError('Ошибка загрузки мероприятия');
      }
    } finally {
      setLoading(false);
    }
  };

  const getEventStatus = (event) => {
    const now = new Date();
    const preregistrationStart = new Date(event.preregistration_start);
    const registrationStart = new Date(event.registration_start);
    const registrationEnd = new Date(event.registration_end);

    if (now < preregistrationStart) {
      return { status: 'upcoming', text: 'Скоро', color: 'green' };
    } else if (now >= preregistrationStart && now < registrationStart) {
      return { status: 'preregistration', text: 'Предварительная регистрация', color: 'orange' };
    } else if (now >= registrationStart && now < registrationEnd) {
      return { status: 'registration', text: 'Регистрация открыта', color: 'green' };
    } else {
      return { status: 'ended', text: 'Завершено', color: 'red' };
    }
  };

  const handleBack = () => {
    navigate('/events');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ padding: '24px' }}>
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
          style={{
            backgroundColor: isDark ? '#2f2f2f' : '#fff2f0',
            border: isDark ? '1px solid #404040' : '1px solid #ffccc7',
            color: isDark ? '#ffffff' : '#000000'
          }}
          action={
            <Button size="small" onClick={handleBack}>
              Вернуться к списку
            </Button>
          }
        />
      </div>
    );
  }

  if (!event) {
    return (
      <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ padding: '24px' }}>
        <Alert
          message="Мероприятие не найдено"
          description="Запрашиваемое мероприятие не существует или было удалено"
          type="warning"
          showIcon
          style={{
            backgroundColor: isDark ? '#2f2f2f' : '#fffbe6',
            border: isDark ? '1px solid #404040' : '1px solid #ffe58f',
            color: isDark ? '#ffffff' : '#000000'
          }}
          action={
            <Button size="small" onClick={handleBack}>
              Вернуться к списку
            </Button>
          }
        />
      </div>
    );
  }

  const eventStatus = getEventStatus(event);

  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ padding: '24px' }}>
      {/* Header */}
      <ProCard style={{ 
        marginBottom: '24px',
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
      }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={20}>
            <Space size="large">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                type="text"
                style={{ color: isDark ? '#ffffff' : '#000000' }}
              >
                Назад к списку
              </Button>
              <div>
                <Title level={2} style={{ margin: 0, color: isDark ? '#ffffff' : '#000000' }}>
                  <Space>
                    <GiftOutlined />
                    {event.name}
                  </Space>
                </Title>
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
                  Подробная информация о мероприятии
                </Text>
              </div>
            </Space>
          </Col>
          <Col xs={24} md={4} style={{ textAlign: 'right' }}>
            <Tag color={eventStatus.color} style={{ fontSize: '16px', padding: '8px 16px' }}>
              {eventStatus.text}
            </Tag>
          </Col>
        </Row>
      </ProCard>

      {/* Event Description */}
      <ProCard style={{ 
        marginBottom: '24px',
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
      }}>
        <Title level={3} style={{ color: isDark ? '#ffffff' : '#000000' }}>Описание мероприятия</Title>
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.6', color: isDark ? '#ffffff' : '#000000' }}>
          {event.description}
        </Paragraph>
      </ProCard>

      {/* Event Details */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <ProCard 
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Информация о мероприятии</span>} 
            style={{ 
              marginBottom: '24px',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Descriptions
              column={1}
              bordered
              size="middle"
              style={{
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              }}
              items={[
                {
                  key: 'status',
                  label: <span style={{ color: isDark ? '#bfbfbf' : '#000000' }}>Статус</span>,
                  children: (
                    <Tag color={eventStatus.color}>
                      {eventStatus.text}
                    </Tag>
                  ),
                },
                {
                  key: 'participants',
                  label: <span style={{ color: isDark ? '#bfbfbf' : '#000000' }}>Количество участников</span>,
                  children: (
                    <Space>
                      <TeamOutlined style={{ color: isDark ? '#ffffff' : '#000000' }} />
                      <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{event.participants_count || 0}</span>
                    </Space>
                  ),
                },
                {
                  key: 'is_active',
                  label: <span style={{ color: isDark ? '#bfbfbf' : '#000000' }}>Активность</span>,
                  children: event.is_active ? (
                    <Tag color="green">Активно</Tag>
                  ) : (
                    <Tag color="red">Неактивно</Tag>
                  ),
                },
                {
                  key: 'created_at',
                  label: <span style={{ color: isDark ? '#bfbfbf' : '#000000' }}>Дата создания</span>,
                  children: (
                    <Space>
                      <CalendarOutlined style={{ color: isDark ? '#ffffff' : '#000000' }} />
                      <span style={{ color: isDark ? '#ffffff' : '#000000' }}>{new Date(event.created_at).toLocaleString('ru-RU')}</span>
                    </Space>
                  ),
                },
              ]}
            />
          </ProCard>

          {/* Rules */}
          {event.rules && (
            <ProCard 
              title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Правила мероприятия</span>} 
              style={{ 
                marginBottom: '24px',
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}
            >
              <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.6', color: isDark ? '#ffffff' : '#000000' }}>
                {event.rules}
              </Paragraph>
            </ProCard>
          )}

          {/* Prize Info */}
          {event.prize_info && (
            <ProCard 
              title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Информация о призах</span>}
              style={{
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}
            >
              <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.6', color: isDark ? '#ffffff' : '#000000' }}>
                {event.prize_info}
              </Paragraph>
            </ProCard>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Timeline */}
          <ProCard 
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Временная шкала</span>} 
            style={{ 
              marginBottom: '24px',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card size="small" style={{
                backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                    <ClockCircleOutlined /> Предварительная регистрация
                  </Text>
                  <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
                    {new Date(event.preregistration_start).toLocaleString('ru-RU')}
                  </Text>
                </Space>
              </Card>
              
              <Card size="small" style={{
                backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                    <ClockCircleOutlined /> Основная регистрация
                  </Text>
                  <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
                    {new Date(event.registration_start).toLocaleString('ru-RU')}
                  </Text>
                </Space>
              </Card>
              
              <Card size="small" style={{
                backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}>
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                    <ClockCircleOutlined /> Окончание регистрации
                  </Text>
                  <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
                    {new Date(event.registration_end).toLocaleString('ru-RU')}
                  </Text>
                </Space>
              </Card>
            </Space>
          </ProCard>

          {/* Actions */}
          <ProCard 
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Действия</span>}
            style={{
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Button 
                type="primary" 
                block
                size="large"
                disabled={eventStatus.status === 'ended'}
              >
                {eventStatus.status === 'upcoming' && 'Регистрация скоро откроется'}
                {eventStatus.status === 'preregistration' && 'Предварительная регистрация'}
                {eventStatus.status === 'registration' && 'Зарегистрироваться'}
                {eventStatus.status === 'ended' && 'Регистрация завершена'}
              </Button>
              
              <Button 
                block
                onClick={handleBack}
                style={{
                  backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                  borderColor: isDark ? '#404040' : '#d9d9d9',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              >
                Вернуться к списку мероприятий
              </Button>
            </Space>
          </ProCard>
        </Col>
      </Row>
    </div>
  );
};

export default EventDetail;
