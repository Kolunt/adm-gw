import React, { useState, useEffect } from 'react';
import { Typography, Space, Tag, Button, Row, Col, Spin, Alert, Descriptions, Card } from 'antd';
import { CalendarOutlined, GiftOutlined, TeamOutlined, ClockCircleOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const EventDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
      <div style={{ padding: '24px' }}>
        <Alert
          message="Ошибка"
          description={error}
          type="error"
          showIcon
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
      <div style={{ padding: '24px' }}>
        <Alert
          message="Мероприятие не найдено"
          description="Запрашиваемое мероприятие не существует или было удалено"
          type="warning"
          showIcon
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
    <div style={{ padding: '24px' }}>
      {/* Header */}
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={20}>
            <Space size="large">
              <Button 
                icon={<ArrowLeftOutlined />} 
                onClick={handleBack}
                type="text"
              >
                Назад к списку
              </Button>
              <div>
                <Title level={2} style={{ margin: 0 }}>
                  <Space>
                    <GiftOutlined />
                    {event.name}
                  </Space>
                </Title>
                <Text type="secondary">
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
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={3}>Описание мероприятия</Title>
        <Paragraph style={{ fontSize: '16px', lineHeight: '1.6' }}>
          {event.description}
        </Paragraph>
      </ProCard>

      {/* Event Details */}
      <Row gutter={[24, 24]}>
        <Col xs={24} lg={16}>
          <ProCard title="Информация о мероприятии" style={{ marginBottom: '24px' }}>
            <Descriptions
              column={1}
              bordered
              size="middle"
              items={[
                {
                  key: 'status',
                  label: 'Статус',
                  children: (
                    <Tag color={eventStatus.color}>
                      {eventStatus.text}
                    </Tag>
                  ),
                },
                {
                  key: 'participants',
                  label: 'Количество участников',
                  children: (
                    <Space>
                      <TeamOutlined />
                      {event.participants_count || 0}
                    </Space>
                  ),
                },
                {
                  key: 'is_active',
                  label: 'Активность',
                  children: event.is_active ? (
                    <Tag color="green">Активно</Tag>
                  ) : (
                    <Tag color="red">Неактивно</Tag>
                  ),
                },
                {
                  key: 'created_at',
                  label: 'Дата создания',
                  children: (
                    <Space>
                      <CalendarOutlined />
                      {new Date(event.created_at).toLocaleString('ru-RU')}
                    </Space>
                  ),
                },
              ]}
            />
          </ProCard>

          {/* Rules */}
          {event.rules && (
            <ProCard title="Правила мероприятия" style={{ marginBottom: '24px' }}>
              <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.6' }}>
                {event.rules}
              </Paragraph>
            </ProCard>
          )}

          {/* Prize Info */}
          {event.prize_info && (
            <ProCard title="Информация о призах">
              <Paragraph style={{ whiteSpace: 'pre-wrap', fontSize: '16px', lineHeight: '1.6' }}>
                {event.prize_info}
              </Paragraph>
            </ProCard>
          )}
        </Col>

        <Col xs={24} lg={8}>
          {/* Timeline */}
          <ProCard title="Временная шкала" style={{ marginBottom: '24px' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <Card size="small">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>
                    <ClockCircleOutlined /> Предварительная регистрация
                  </Text>
                  <Text type="secondary">
                    {new Date(event.preregistration_start).toLocaleString('ru-RU')}
                  </Text>
                </Space>
              </Card>
              
              <Card size="small">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>
                    <ClockCircleOutlined /> Основная регистрация
                  </Text>
                  <Text type="secondary">
                    {new Date(event.registration_start).toLocaleString('ru-RU')}
                  </Text>
                </Space>
              </Card>
              
              <Card size="small">
                <Space direction="vertical" size="small" style={{ width: '100%' }}>
                  <Text strong>
                    <ClockCircleOutlined /> Окончание регистрации
                  </Text>
                  <Text type="secondary">
                    {new Date(event.registration_end).toLocaleString('ru-RU')}
                  </Text>
                </Space>
              </Card>
            </Space>
          </ProCard>

          {/* Actions */}
          <ProCard title="Действия">
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
