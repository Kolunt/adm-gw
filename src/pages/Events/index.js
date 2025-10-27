import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Tag, Button, Row, Col, Spin, Alert } from 'antd';
import { CalendarOutlined, GiftOutlined, TeamOutlined, ClockCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import ProList from '@ant-design/pro-list';
import axios from 'axios';

const { Title, Text, Paragraph } = Typography;

const EventsPage = () => {
  const [events, setEvents] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const [eventsResponse, currentEventResponse] = await Promise.all([
        axios.get('/events/'),
        axios.get('/events/current').catch(() => null)
      ]);
      
      setEvents(eventsResponse.data);
      setCurrentEvent(currentEventResponse?.data);
    } catch (error) {
      console.error('Error fetching events:', error);
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
      return { status: 'upcoming', text: 'Скоро', color: 'blue' };
    } else if (now >= preregistrationStart && now < registrationStart) {
      return { status: 'preregistration', text: 'Предварительная регистрация', color: 'orange' };
    } else if (now >= registrationStart && now < registrationEnd) {
      return { status: 'registration', text: 'Регистрация открыта', color: 'green' };
    } else {
      return { status: 'ended', text: 'Завершено', color: 'red' };
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
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
            <Tag color="blue" style={{ fontSize: '16px', padding: '8px 16px' }}>
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
        <ProList
          dataSource={events}
          rowKey="id"
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
              <ProList.Item
                actions={[
                  <Space key="actions">
                    <Tag color={eventStatus.color}>
                      {eventStatus.text}
                    </Tag>
                    <Button type="primary" size="small">
                      Подробнее
                    </Button>
                  </Space>
                ]}
              >
                <ProList.Item.Meta
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
              </ProList.Item>
            );
          }}
        />
      </ProCard>
    </div>
  );
};

export default EventsPage;
