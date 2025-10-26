import React, { useState, useEffect, useCallback } from 'react';
import { Card, Typography, Statistic, Row, Col, Tag, Alert, List, Button, Space } from 'antd';
import { CalendarOutlined, ClockCircleOutlined, CheckCircleOutlined, UserAddOutlined, CheckOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import UserAvatar from './UserAvatar';

const { Title, Text } = Typography;

function CurrentEventInfo({ user, isAuthenticated, onNavigate }) {
  const [currentEvent, setCurrentEvent] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [participants, setParticipants] = useState([]);
  const [hasChecked, setHasChecked] = useState(false);
  const [userRegistration, setUserRegistration] = useState(null);

  const updateCountdown = useCallback((event = currentEvent) => {
    if (!event) return;

    const now = moment();
    const preregStart = moment(event.preregistration_start);
    const regStart = moment(event.registration_start);
    const regEnd = moment(event.registration_end);

    let nextPhase = null;

    if (now.isBefore(preregStart)) {
      // Предварительная регистрация
      nextPhase = {
        name: "Предварительная регистрация",
        color: "blue",
        timeLeft: preregStart.diff(now)
      };
    } else if (now.isBefore(regStart)) {
      // Предварительная регистрация
      nextPhase = {
        name: "Предварительная регистрация",
        color: "orange",
        timeLeft: regStart.diff(now)
      };
    } else if (now.isBefore(regEnd)) {
      // Основная регистрация
      nextPhase = {
        name: "Основная регистрация",
        color: "green",
        timeLeft: regEnd.diff(now)
      };
    } else {
      // Мероприятие завершено
      nextPhase = {
        name: "Мероприятие завершено",
        color: "red",
        timeLeft: 0
      };
    }

    setCurrentPhase(nextPhase);

    if (nextPhase.timeLeft > 0) {
      const duration = moment.duration(nextPhase.timeLeft);
      const days = Math.floor(duration.asDays());
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        formatted: `${days.toString().padStart(2, '0')}:${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      });
    } else {
      setTimeLeft({
        days: 0,
        hours: 0,
        minutes: 0,
        seconds: 0,
        formatted: "00:00:00:00"
      });
    }
  }, [currentEvent]);

  const fetchParticipants = useCallback(async (eventId) => {
    if (!eventId) return;
    
    try {
      const response = await axios.get(`/events/${eventId}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error('Error fetching participants:', error);
      setParticipants([]);
    }
  }, []);

  const fetchUserRegistration = useCallback(async (eventId) => {
    if (!eventId || !isAuthenticated || !user) return;
    
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`/events/${eventId}/user-registration`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRegistration(response.data);
    } catch (error) {
      if (error.response?.status === 404) {
        // Пользователь не зарегистрирован
        setUserRegistration(null);
      } else {
        console.error('Error fetching user registration:', error);
        setUserRegistration(null);
      }
    }
  }, [isAuthenticated, user]);

  const getActionButton = () => {
    if (!isAuthenticated || !user) {
      return null;
    }

    if (!currentEvent) {
      return null;
    }

    const now = moment();
    const preregStart = moment(currentEvent.preregistration_start);
    const regStart = moment(currentEvent.registration_start);
    const regEnd = moment(currentEvent.registration_end);

    // Проверяем, может ли пользователь участвовать
    const canPreregister = now.isAfter(preregStart) && now.isBefore(regStart);
    const canRegister = now.isAfter(regStart) && now.isBefore(regEnd);
    const canConfirm = userRegistration && userRegistration.is_preregistration && !userRegistration.is_confirmed && now.isAfter(regStart);

    if (userRegistration) {
      if (userRegistration.is_confirmed) {
        return (
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            disabled
            style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
          >
            Вы участвуете в мероприятии
          </Button>
        );
      } else if (canConfirm) {
        return (
          <Button 
            type="primary" 
            icon={<CheckOutlined />}
            onClick={() => onNavigate('/events')}
            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
          >
            Подтвердить участие
          </Button>
        );
      } else {
        return (
          <Button 
            type="primary" 
            icon={<ClockCircleOutlined />}
            disabled
            style={{ backgroundColor: '#1890ff', borderColor: '#1890ff' }}
          >
            Предварительно зарегистрированы
          </Button>
        );
      }
    } else if (canPreregister || canRegister) {
      return (
        <Button 
          type="primary" 
          icon={<UserAddOutlined />}
          onClick={() => onNavigate('/events')}
          style={{ backgroundColor: '#d63031', borderColor: '#d63031' }}
        >
          Принять участие
        </Button>
      );
    }

    return null;
  };

  const fetchCurrentEvent = useCallback(async () => {
    // Если уже проверяли, не делаем повторный запрос
    if (hasChecked) return;
    
    try {
      const response = await axios.get('/events/current');
      setCurrentEvent(response.data);
      updateCountdown(response.data);
      setLoading(false);
      setHasChecked(true);
      
      // Загружаем участников и регистрацию пользователя
      fetchParticipants(response.data.id);
      fetchUserRegistration(response.data.id);
    } catch (error) {
      if (error.response?.status === 404) {
        // Нет активных мероприятий - это нормально
        setCurrentEvent(null);
        setLoading(false);
        setHasChecked(true);
        return;
      }
      // Другие ошибки
      console.error('Error fetching current event:', error);
      setCurrentEvent(null);
      setLoading(false);
      setHasChecked(true);
    }
  }, [updateCountdown, fetchParticipants, fetchUserRegistration, hasChecked]);

  // Запускаем проверку только один раз при монтировании
  useEffect(() => {
    if (!hasChecked) {
      fetchCurrentEvent();
    }
  }, [fetchCurrentEvent, hasChecked]);

  // Обновляем счетчик каждую секунду
  useEffect(() => {
    if (!currentEvent) return;
    
    const interval = setInterval(() => {
      updateCountdown();
    }, 1000);

    return () => clearInterval(interval);
  }, [currentEvent, updateCountdown]);

  // Если нет активного мероприятия, показываем сообщение
  if (!currentEvent && !loading) {
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
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12}>
          <Statistic
            title="Название мероприятия"
            value={currentEvent.name}
            valueStyle={{ color: '#1890ff' }}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="Текущий этап"
            valueRender={() => (
              <Tag color={currentPhase?.color || 'default'}>
                {currentPhase?.name || 'Неизвестно'}
              </Tag>
            )}
          />
        </Col>
        <Col xs={24} sm={12}>
          <Statistic
            title="До следующего этапа"
            value={timeLeft?.formatted || '00:00:00:00'}
            valueStyle={{ color: '#52c41a', fontSize: '24px', fontFamily: 'monospace' }}
          />
        </Col>
      </Row>

      {/* Кнопка действия для авторизованных пользователей */}
      {isAuthenticated && (
        <div style={{ marginTop: '24px', textAlign: 'center' }}>
          {getActionButton()}
        </div>
      )}

      {/* Список участников */}
      {participants.length > 0 && (
        <div style={{ marginTop: '24px' }}>
          <Title level={4} style={{ marginBottom: '16px' }}>
            Участники мероприятия
          </Title>
          
          {/* Легенда */}
          <div style={{ marginBottom: '12px', fontSize: '12px', color: '#666' }}>
            <Tag color="green" size="small">
              <CheckCircleOutlined /> Подтвержденные
            </Tag>
            <Tag color="red" size="small" style={{ marginLeft: '8px' }}>
              <ClockCircleOutlined /> Предварительно зарегистрированные
            </Tag>
          </div>

          <List
            dataSource={participants}
            renderItem={(participant) => {
              const statusColor = participant.status === 'confirmed' ? 'green' : 'red';
              const statusIcon = participant.status === 'confirmed' ? 
                <CheckCircleOutlined /> : <ClockCircleOutlined />;
              
              return (
                <List.Item>
                  <List.Item.Meta
                    avatar={
                      <UserAvatar 
                        user={participant} 
                        size={40} 
                        showTooltip={true}
                      />
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span>{participant.gwars_nickname || 'Неизвестно'}</span>
                        <Tag color={statusColor} size="small">
                          {statusIcon} {participant.status_text}
                        </Tag>
                      </div>
                    }
                    description={
                      participant.gwars_profile_url ? (
                        <a 
                          href={participant.gwars_profile_url} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          style={{ color: '#1890ff' }}
                        >
                          Профиль GWars
                        </a>
                      ) : 'Профиль не указан'
                    }
                  />
                </List.Item>
              );
            }}
          />
        </div>
      )}

      {participants.length === 0 && (
        <div style={{ marginTop: '24px', textAlign: 'center', color: '#666' }}>
          <Text>Пока нет участников мероприятия</Text>
        </div>
      )}
    </Card>
  );
}

export default CurrentEventInfo;