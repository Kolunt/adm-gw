import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Statistic, Row, Col, Tag, Alert } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

// Используем обычный axios без кастомных interceptor'ов

const { Title, Text } = Typography;

function CurrentEventInfo() {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [loading, setLoading] = useState(true);

  const updateCountdown = useCallback((event = currentEvent) => {
    if (!event) return;

    const now = moment();
    const preregStart = moment(event.preregistration_start);
    const regStart = moment(event.registration_start);
    const regEnd = moment(event.registration_end);

    let nextPhase = null;

    if (now.isBefore(preregStart)) {
      // Ожидание предварительной регистрации
      setCurrentPhase({
        name: 'Ожидание',
        description: 'Предварительная регистрация еще не началась',
        color: 'default',
        icon: <ClockCircleOutlined />
      });
      nextPhase = preregStart;
    } else if (now.isBefore(regStart)) {
      // Предварительная регистрация
      setCurrentPhase({
        name: 'Предварительная регистрация',
        description: 'Можно зарегистрироваться заранее',
        color: 'blue',
        icon: <CalendarOutlined />
      });
      nextPhase = regStart;
    } else if (now.isBefore(regEnd)) {
      // Основная регистрация
      setCurrentPhase({
        name: 'Основная регистрация',
        description: 'Подтверждение участия и адресов',
        color: 'green',
        icon: <CheckCircleOutlined />
      });
      nextPhase = regEnd;
    } else {
      // Мероприятие завершено
      setCurrentPhase({
        name: 'Завершено',
        description: 'Регистрация завершена',
        color: 'red',
        icon: <CheckCircleOutlined />
      });
      nextPhase = null;
    }

    if (nextPhase) {
      const duration = moment.duration(nextPhase.diff(now));
      if (duration.asMilliseconds() > 0) {
        setTimeLeft({
          days: Math.floor(duration.asDays()),
          hours: duration.hours(),
          minutes: duration.minutes(),
          seconds: duration.seconds()
        });
      } else {
        setTimeLeft(null);
      }
    } else {
      setTimeLeft(null);
    }
  }, [currentEvent]);

  const fetchCurrentEvent = useCallback(async () => {
    try {
      const response = await axios.get('/events/current');
      setCurrentEvent(response.data);
      updateCountdown(response.data);
      setLoading(false);
    } catch (error) {
      // Если нет активных мероприятий (404), это нормально
      if (error.response?.status === 404) {
        setCurrentEvent(null);
        setLoading(false);
        return;
      }
      // Для других ошибок тоже просто скрываем компонент
      setCurrentEvent(null);
      setLoading(false);
    }
  }, [updateCountdown]);

  useEffect(() => {
    // Запускаем только один раз при монтировании
    fetchCurrentEvent();
  }, [fetchCurrentEvent]);

  useEffect(() => {
    // Обновляем каждую секунду только если есть активное мероприятие
    if (!currentEvent) return;
    
    const interval = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentEvent, updateCountdown]);

  // Если нет активных мероприятий, не рендерим компонент
  if (!currentEvent && !loading) {
    return null;
  }

  if (loading) {
    return (
      <Card loading={true}>
        <Title level={3}>Загрузка информации о мероприятии...</Title>
      </Card>
    );
  }

  if (!currentEvent) {
    return (
      <Alert
        message="Нет активных мероприятий"
        description="В данный момент нет активных мероприятий. Следите за обновлениями!"
        type="info"
        showIcon
        style={{ marginBottom: 24 }}
      />
    );
  }

  return (
    <Card 
      title={
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CalendarOutlined style={{ color: '#d63031' }} />
          <span>Текущее мероприятие</span>
        </div>
      }
      style={{ marginBottom: 24 }}
    >
      <div style={{ textAlign: 'center', marginBottom: 24 }}>
        <Title level={2} style={{ color: '#d63031', marginBottom: 8 }}>
          {currentEvent.name}
        </Title>
        {currentEvent.description && (
          <Text type="secondary" style={{ fontSize: '16px' }}>
            {currentEvent.description}
          </Text>
        )}
      </div>

      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="Текущий этап"
              value={currentPhase?.name || 'Неизвестно'}
              valueRender={() => (
                <Tag 
                  color={currentPhase?.color || 'default'} 
                  icon={currentPhase?.icon}
                  style={{ fontSize: '14px', padding: '4px 8px' }}
                >
                  {currentPhase?.name || 'Неизвестно'}
                </Tag>
              )}
            />
            <Text type="secondary" style={{ fontSize: '12px' }}>
              {currentPhase?.description || 'Описание недоступно'}
            </Text>
          </Card>
        </Col>

        <Col xs={24} sm={12} md={16}>
          <Card size="small" style={{ textAlign: 'center' }}>
            <Statistic
              title="До следующего этапа"
              value={timeLeft ? `${timeLeft.days > 0 ? timeLeft.days + 'д ' : ''}${String(timeLeft.hours).padStart(2, '0')}:${String(timeLeft.minutes).padStart(2, '0')}:${String(timeLeft.seconds).padStart(2, '0')}` : 'Этап завершен'}
              valueStyle={{ fontSize: '18px', fontWeight: 'bold', color: '#1890ff' }}
            />
          </Card>
        </Col>
      </Row>

      <div style={{ marginTop: 16, padding: '12px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
        <Row gutter={[16, 8]}>
          <Col xs={24} sm={8}>
            <Text strong>Предварительная регистрация:</Text><br />
            <Text>{moment(currentEvent.preregistration_start).format('DD.MM.YYYY HH:mm')}</Text>
          </Col>
          <Col xs={24} sm={8}>
            <Text strong>Основная регистрация:</Text><br />
            <Text>{moment(currentEvent.registration_start).format('DD.MM.YYYY HH:mm')}</Text>
          </Col>
          <Col xs={24} sm={8}>
            <Text strong>Завершение:</Text><br />
            <Text>{moment(currentEvent.registration_end).format('DD.MM.YYYY HH:mm')}</Text>
          </Col>
        </Row>
      </div>
    </Card>
  );
}

export default CurrentEventInfo;
