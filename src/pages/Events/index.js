import React, { useState, useEffect } from 'react';
import { Typography, Space, Tag, Button, Row, Col, Spin, Alert, List } from 'antd';
import { CalendarOutlined, GiftOutlined, TeamOutlined, ClockCircleOutlined, EyeOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useNavigate } from 'react-router-dom';
import axios from '../../utils/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      setLoading(true);
      console.log('EventsPage: Fetching events');
      
      // Простые запросы без Promise.all
      try {
        const eventsResponse = await axios.get('/events/');
        setEvents(eventsResponse.data || []);
      } catch (err) {
        console.error('EventsPage: Error fetching events:', err);
        setEvents([]);
      }
      
      try {
        const currentEventResponse = await axios.get('/events/current');
        setCurrentEvent(currentEventResponse.data || null);
      } catch (err) {
        console.error('EventsPage: Error fetching current event:', err);
        setCurrentEvent(null);
      }
      
      console.log('EventsPage: Events loaded');
    } catch (error) {
      console.error('EventsPage: Error fetching events:', error);
    } finally {
      setLoading(false);
      console.log('EventsPage: Loading finished');
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

  const handleViewDetails = (event) => {
    navigate(`/events/${event.id}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>Загрузка мероприятий...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Row gutter={[16, 16]} align="middle">
          <Col xs={24} md={16}>
            <Title level={2}>
              <Space>
                <GiftOutlined />
                Мероприятия
              </Space>
            </Title>
            <Text type="secondary">
              Участвуйте в анонимном обмене подарками
            </Text>
          </Col>
          <Col xs={24} md={8} style={{ textAlign: 'right' }}>
            <Tag color="green" style={{ fontSize: '16px', padding: '8px 16px' }}>
              Всего мероприятий: {events.length}
            </Tag>
          </Col>
        </Row>
      </ProCard>

      {/* Current Event */}
      {currentEvent && (
        <ProCard 
          title={
            <Space>
              <CalendarOutlined />
              Текущее мероприятие
            </Space>
          }
          style={{ marginBottom: '24px' }}
          extra={
            <Tag color={getEventStatus(currentEvent).color}>
              {getEventStatus(currentEvent).text}
            </Tag>
          }
        >
          <Row gutter={[16, 16]}>
            <Col xs={24} md={16}>
              <Title level={3}>{currentEvent.name}</Title>
              <Paragraph>{currentEvent.description}</Paragraph>
            </Col>
            <Col xs={24} md={8}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Text strong>
                    <ClockCircleOutlined /> Предварительная регистрация:
                  </Text>
                  <br />
                  <Text>{new Date(currentEvent.preregistration_start).toLocaleDateString('ru-RU')}</Text>
                </div>
                <div>
                  <Text strong>
                    <ClockCircleOutlined /> Основная регистрация:
                  </Text>
                  <br />
                  <Text>{new Date(currentEvent.registration_start).toLocaleDateString('ru-RU')}</Text>
                </div>
                <div>
                  <Text strong>
                    <ClockCircleOutlined /> Окончание регистрации:
                  </Text>
                  <br />
                  <Text>{new Date(currentEvent.registration_end).toLocaleDateString('ru-RU')}</Text>
                </div>
              </Space>
            </Col>
          </Row>
        </ProCard>
      )}

      {/* All Events */}
      <ProCard>
        <List
          dataSource={events}
          rowKey="id"
          locale={{
            emptyText: (
              <span style={{ color: 'white', fontSize: 18 }}>Нет данных</span>
            )
          }}
          pagination={{
            pageSize: 6,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} из ${total} мероприятий`,
          }}
          renderItem={(event) => {
            const eventStatus = getEventStatus(event);
            return (
              <List.Item
                actions={[
                  <Space key="actions">
                    <Tag color={eventStatus.color}>
                      {eventStatus.text}
                    </Tag>
                    <Button 
                      type="primary" 
                      size="small"
                      icon={<EyeOutlined />}
                      onClick={() => handleViewDetails(event)}
                    >
                      Подробнее
                    </Button>
                  </Space>
                ]}
              >
                <List.Item.Meta
                  title={
                    <Space>
                      <Text strong style={{ fontSize: '16px' }}>
                        {event.name}
                      </Text>
                      {event.is_active && (
                        <Tag color="green">Активно</Tag>
                      )}
                    </Space>
                  }
                  description={
                    <Space direction="vertical" size="small">
                      <Text>{event.description}</Text>
                      <Space>
                        <Text type="secondary">
                          <CalendarOutlined /> Начало: {new Date(event.preregistration_start).toLocaleDateString('ru-RU')}
                        </Text>
                        <Text type="secondary">
                          <TeamOutlined /> Участников: {event.participants_count || 0}
                        </Text>
                      </Space>
                    </Space>
                  }
                />
              </List.Item>
            );
          }}
        />
      </ProCard>
    </div>
  );
};

export default EventsPage;
