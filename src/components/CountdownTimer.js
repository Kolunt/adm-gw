import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Statistic, Row, Col } from 'antd';
import { ClockCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text } = Typography;

const CountdownTimer = ({ event }) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0
  });
  const [targetDate, setTargetDate] = useState(null);
  const [phase, setPhase] = useState('');

  useEffect(() => {
    if (!event) return;

    const now = new Date();
    const preregistrationStart = new Date(event.preregistration_start);
    const registrationStart = new Date(event.registration_start);
    const registrationEnd = new Date(event.registration_end);

    let target;
    let currentPhase;

    if (now < preregistrationStart) {
      target = preregistrationStart;
      currentPhase = 'До начала предварительной регистрации';
    } else if (now >= preregistrationStart && now < registrationStart) {
      target = registrationStart;
      currentPhase = 'До начала основной регистрации';
    } else if (now >= registrationStart && now < registrationEnd) {
      target = registrationEnd;
      currentPhase = 'До окончания регистрации';
    } else {
      currentPhase = 'Регистрация завершена';
    }

    setTargetDate(target);
    setPhase(currentPhase);

    if (!target) return;

    const updateTimer = () => {
      const now = new Date();
      const difference = target.getTime() - now.getTime();

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (!event || !targetDate) {
    return null;
  }

  const isExpired = timeLeft.days === 0 && timeLeft.hours === 0 && 
                   timeLeft.minutes === 0 && timeLeft.seconds === 0;

  return (
    <ProCard
      title={
        <Space>
          <ClockCircleOutlined />
          Таймер обратного отсчета
        </Space>
      }
      style={{ marginBottom: '24px' }}
      extra={
        <Text type="secondary" style={{ fontSize: '14px' }}>
          {phase}
        </Text>
      }
      className="countdown-timer"
    >
      {isExpired ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Title level={3} type="success">
            🎉 Регистрация завершена!
          </Title>
          <Text type="secondary">
            Спасибо за участие в мероприятии "{event.name}"
          </Text>
        </div>
      ) : (
        <Row gutter={[16, 16]}>
          <Col xs={6} sm={6} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic
                title="Дней"
                value={timeLeft.days}
                valueStyle={{ 
                  color: timeLeft.days > 0 ? '#1890ff' : '#ff4d4f',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={6} sm={6} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic
                title="Часов"
                value={timeLeft.hours}
                valueStyle={{ 
                  color: timeLeft.hours > 0 ? '#1890ff' : '#ff4d4f',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={6} sm={6} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic
                title="Минут"
                value={timeLeft.minutes}
                valueStyle={{ 
                  color: timeLeft.minutes > 0 ? '#1890ff' : '#ff4d4f',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
          <Col xs={6} sm={6} md={6}>
            <Card style={{ textAlign: 'center' }}>
              <Statistic
                title="Секунд"
                value={timeLeft.seconds}
                valueStyle={{ 
                  color: timeLeft.seconds > 0 ? '#1890ff' : '#ff4d4f',
                  fontSize: '24px',
                  fontWeight: 'bold'
                }}
              />
            </Card>
          </Col>
        </Row>
      )}
      
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Text type="secondary">
          Мероприятие: <Text strong>{event.name}</Text>
        </Text>
      </div>
    </ProCard>
  );
};

export default CountdownTimer;
