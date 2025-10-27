import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Card, 
  Typography, 
  Button, 
  Space, 
  Tag, 
  List, 
  Avatar, 
  message, 
  Spin,
  Alert,
  Statistic,
  Row,
  Col,
  Divider
} from 'antd';
import { 
  CalendarOutlined, 
  UserOutlined, 
  LinkOutlined,
  ClockCircleOutlined,
  CheckCircleOutlined,
  ExclamationCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';
import useButtonSettings from '../hooks/useButtonSettings';

const { Title, Paragraph, Text } = Typography;

const EventDetail = () => {
  const { uniqueId } = useParams();
  const navigate = useNavigate();
  const [event, setEvent] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);
  const { buttonSettings } = useButtonSettings();
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [countdown, setCountdown] = useState({});
  const [currentPhase, setCurrentPhase] = useState(null);

  const fetchEvent = useCallback(async () => {
    try {
      const response = await axios.get(`/events/unique/${uniqueId}`);
      setEvent(response.data);
    } catch (error) {
      console.error('Error fetching event:', error);
      if (error.response?.status === 404) {
        message.error('Мероприятие не найдено');
        navigate('/events');
      } else {
        message.error('Ошибка при загрузке мероприятия');
      }
    }
  }, [uniqueId, navigate]);

  const fetchParticipants = useCallback(async () => {
    setParticipantsLoading(true);
    try {
      const response = await axios.get(`/events/unique/${uniqueId}/participants`);
      setParticipants(response.data);
    } catch (error) {
      console.error('Error fetching participants:', error);
      message.error('Ошибка при загрузке участников');
    } finally {
      setParticipantsLoading(false);
    }
  }, [uniqueId]);

  const updateCountdown = useCallback(() => {
    if (!event) return;

    const now = moment.utc();
    const preregStart = moment.utc(event.preregistration_start);
    const regStart = moment.utc(event.registration_start);
    const regEnd = moment.utc(event.registration_end);

    let targetTime;
    let phase;

    if (now.isBefore(preregStart)) {
      // До предварительной регистрации
      targetTime = preregStart;
      phase = {
        name: "До начала предварительной регистрации",
        color: "blue",
        description: "Предварительная регистрация еще не началась"
      };
    } else if (now.isBefore(regStart)) {
      // Предварительная регистрация
      targetTime = regStart;
      phase = {
        name: "Предварительная регистрация",
        color: "orange",
        description: "Идет предварительная регистрация"
      };
    } else if (now.isBefore(regEnd)) {
      // Основная регистрация
      targetTime = regEnd;
      phase = {
        name: "Основная регистрация",
        color: "green",
        description: "Идет основная регистрация"
      };
    } else {
      // Мероприятие завершено
      phase = {
        name: "Мероприятие завершено",
        color: "red",
        description: "Регистрация закрыта"
      };
    }

    setCurrentPhase(phase);

    if (targetTime) {
      const duration = moment.duration(targetTime.diff(now));
      const days = Math.floor(duration.asDays());
      const hours = duration.hours();
      const minutes = duration.minutes();
      const seconds = duration.seconds();

      setCountdown({
        days: days.toString().padStart(2, '0'),
        hours: hours.toString().padStart(2, '0'),
        minutes: minutes.toString().padStart(2, '0'),
        seconds: seconds.toString().padStart(2, '0')
      });
    }
  }, [event]);

  useEffect(() => {
    fetchEvent();
  }, [fetchEvent]);

  useEffect(() => {
    if (event) {
      fetchParticipants();
    }
  }, [event, fetchParticipants]);

  useEffect(() => {
    if (event) {
      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [event, updateCountdown]);

  const handleRegister = async (registrationType) => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        message.error('Необходимо войти в систему');
        navigate('/login');
        return;
      }

      await axios.post(`/events/unique/${uniqueId}/register`, {
        registration_type: registrationType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      message.success('Регистрация успешна!');
      fetchParticipants();
    } catch (error) {
      console.error('Error registering for event:', error);
      
      if (error.response?.status === 401) {
        message.error('Сессия истекла. Войдите в систему заново');
        localStorage.removeItem('token');
        navigate('/login');
      } else if (error.response?.status === 400) {
        const detail = error.response.data?.detail;
        if (detail) {
          message.error(detail);
        } else {
          message.error('Ошибка при регистрации. Проверьте данные');
        }
      } else if (error.code === 'ERR_NETWORK') {
        message.error('Backend недоступен. Запустите backend: start_backend_radical.bat');
      } else {
        message.error('Ошибка при регистрации на мероприятие');
      }
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <p>Загрузка мероприятия...</p>
      </div>
    );
  }

  if (!event) {
    return (
      <Alert
        message="Мероприятие не найдено"
        description="Мероприятие с указанным ID не существует или было удалено."
        type="error"
        showIcon
        action={
          <Button size="small" onClick={() => navigate('/events')}>
            Вернуться к списку мероприятий
          </Button>
        }
      />
    );
  }

  const now = moment.utc();
  const preregStart = moment.utc(event.preregistration_start);
  const regStart = moment.utc(event.registration_start);
  const regEnd = moment.utc(event.registration_end);

  const canPreregister = now.isAfter(preregStart) && now.isBefore(regStart);
  const canRegister = now.isAfter(regStart) && now.isBefore(regEnd);
  const isFinished = now.isAfter(regEnd);

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          {/* Заголовок мероприятия */}
          <div>
            <Title level={2}>{event.name}</Title>
            <Paragraph>{event.description}</Paragraph>
            <Text type="secondary">
              Создано: {moment.utc(event.created_at).local().format('DD.MM.YYYY HH:mm')}
            </Text>
          </div>

          {/* Текущий этап и обратный отсчет */}
          {currentPhase && (
            <Card size="small">
              <Row gutter={16}>
                <Col span={12}>
                  <Statistic
                    title="Текущий этап"
                    valueRender={() => (
                      <Tag color={currentPhase.color} icon={<ClockCircleOutlined />}>
                        {currentPhase.name}
                      </Tag>
                    )}
                  />
                </Col>
                <Col span={12}>
                  {countdown.days !== undefined ? (
                    <Statistic
                      title="До следующего этапа"
                      value={`${countdown.days}:${countdown.hours}:${countdown.minutes}:${countdown.seconds}`}
                      valueStyle={{ color: '#1890ff' }}
                    />
                  ) : (
                    <Statistic
                      title="Статус"
                      value="Завершено"
                      valueStyle={{ color: '#ff4d4f' }}
                    />
                  )}
                </Col>
              </Row>
            </Card>
          )}

          {/* Даты мероприятия */}
          <Card size="small" title="Даты мероприятия">
            <Row gutter={16}>
              <Col span={8}>
                <Statistic
                  title="Предварительная регистрация"
                  value={moment.utc(event.preregistration_start).local().format('DD.MM.YYYY HH:mm')}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Основная регистрация"
                  value={moment.utc(event.registration_start).local().format('DD.MM.YYYY HH:mm')}
                  prefix={<CalendarOutlined />}
                />
              </Col>
              <Col span={8}>
                <Statistic
                  title="Окончание регистрации"
                  value={moment.utc(event.registration_end).local().format('DD.MM.YYYY HH:mm')}
                  prefix={<CalendarOutlined />}
                />
              </Col>
            </Row>
          </Card>

          {/* Кнопки регистрации */}
          {!isFinished && (
            <Card size="small" title="Регистрация">
              <Space>
                {canPreregister && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleRegister('preregistration')}
                  >
                    {buttonSettings.button_preregistration}
                  </Button>
                )}
                {canRegister && (
                  <Button
                    type="primary"
                    icon={<CheckCircleOutlined />}
                    onClick={() => handleRegister('registration')}
                  >
                    {buttonSettings.button_registration}
                  </Button>
                )}
                {!canPreregister && !canRegister && (
                  <Text type="secondary">
                    <ExclamationCircleOutlined /> Регистрация пока недоступна
                  </Text>
                )}
              </Space>
            </Card>
          )}

          <Divider />

          {/* Участники мероприятия */}
          <Card 
            size="small" 
            title={`Участники мероприятия (${participants.length})`}
            loading={participantsLoading}
          >
            {participants.length === 0 ? (
              <Text type="secondary">Пока нет участников мероприятия</Text>
            ) : (
              <>
                <List
                  dataSource={participants}
                  renderItem={(participant) => {
                    const statusColor = participant.status === 'confirmed' ? 'green' : 'red';
                    const statusIcon = participant.status === 'confirmed' ? 
                      <CheckCircleOutlined /> : <ClockCircleOutlined />;
                    
                    return (
                      <List.Item>
                        <List.Item.Meta
                          avatar={<Avatar icon={<UserOutlined />} />}
                          title={
                            <Space>
                              <Text strong>{participant.nickname}</Text>
                              <Tag color={statusColor} icon={statusIcon}>
                                {participant.status_text}
                              </Tag>
                            </Space>
                          }
                          description={
                            participant.gwars_profile_url && (
                              <a 
                                href={participant.gwars_profile_url} 
                                target="_blank" 
                                rel="noopener noreferrer"
                              >
                                <LinkOutlined /> Профиль GWars
                              </a>
                            )
                          }
                        />
                      </List.Item>
                    );
                  }}
                />
                
                {/* Легенда */}
                <div style={{ marginTop: '16px', padding: '8px', background: '#f5f5f5', borderRadius: '4px' }}>
                  <Text type="secondary">
                    <CheckCircleOutlined style={{ color: '#52c41a' }} /> Подтвержден &nbsp;&nbsp;
                    <ClockCircleOutlined style={{ color: '#ff4d4f' }} /> Предварительная регистрация
                  </Text>
                </div>
              </>
            )}
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default EventDetail;
