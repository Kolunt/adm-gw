import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Statistic, Row, Col, Badge } from 'antd';
import { ClockCircleOutlined, CalendarOutlined, FireOutlined } from '@ant-design/icons';
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
          <ClockCircleOutlined style={{ color: '#2d5016' }} />
          Таймер обратного отсчета
        </Space>
      }
      style={{ marginBottom: '24px' }}
      extra={
        <Space>
          <Badge 
            status={isExpired ? 'error' : 'processing'} 
            text={
              <Text type="secondary" style={{ fontSize: '14px' }}>
                {phase}
              </Text>
            }
          />
        </Space>
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
            <Card 
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #2d5016 0%, #3d6b1a 100%)',
                border: 'none',
                color: 'white'
              }}
              styles={{ body: { padding: '16px' } }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Дней</span>}
                value={timeLeft.days}
                valueStyle={{ 
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
                prefix={<CalendarOutlined />}
              />
            </Card>
          </Col>
          <Col xs={6} sm={6} md={6}>
            <Card 
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #52c41a 0%, #73d13d 100%)',
                border: 'none',
                color: 'white'
              }}
              styles={{ body: { padding: '16px' } }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Часов</span>}
                value={timeLeft.hours}
                valueStyle={{ 
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
          <Col xs={6} sm={6} md={6}>
            <Card 
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #faad14 0%, #ffc53d 100%)',
                border: 'none',
                color: 'white'
              }}
              styles={{ body: { padding: '16px' } }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Минут</span>}
                value={timeLeft.minutes}
                valueStyle={{ 
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
                prefix={<FireOutlined />}
              />
            </Card>
          </Col>
          <Col xs={6} sm={6} md={6}>
            <Card 
              style={{ 
                textAlign: 'center',
                background: 'linear-gradient(135deg, #ff4d4f 0%, #ff7875 100%)',
                border: 'none',
                color: 'white'
              }}
              styles={{ body: { padding: '16px' } }}
            >
              <Statistic
                title={<span style={{ color: 'rgba(255,255,255,0.8)' }}>Секунд</span>}
                value={timeLeft.seconds}
                valueStyle={{ 
                  color: 'white',
                  fontSize: '28px',
                  fontWeight: 'bold'
                }}
                prefix={<ClockCircleOutlined />}
              />
            </Card>
          </Col>
        </Row>
      )}
      
      <div style={{ marginTop: '16px', textAlign: 'center' }}>
        <Text type="secondary">
          Мероприятие: <Text strong style={{ color: '#2d5016' }}>{event.name}</Text>
        </Text>
      </div>
    </ProCard>
  );
};

export default CountdownTimer;
