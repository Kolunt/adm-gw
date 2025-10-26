import React, { useState, useEffect } from 'react';
import { Card, Button, Table, Tag, Modal, Form, Input, message, Typography, Space, Alert } from 'antd';
import { CalendarOutlined, CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { Title, Text } = Typography;

function EventRegistration() {
  const [events, setEvents] = useState([]);
  const [userRegistrations, setUserRegistrations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchEvents();
    fetchUserRegistrations();
  }, []);

  const fetchEvents = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/events/', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      message.error('Не удалось загрузить мероприятия.');
    }
  };

  const fetchUserRegistrations = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('/user/registrations', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setUserRegistrations(response.data);
    } catch (error) {
      console.error('Error fetching user registrations:', error);
    }
  };

  const getEventStatus = (event) => {
    const now = moment();
    const preregStart = moment(event.preregistration_start);
    const regStart = moment(event.registration_start);
    const regEnd = moment(event.registration_end);

    if (now.isBefore(preregStart)) {
      return { status: 'waiting', text: 'Ожидание', color: 'default' };
    } else if (now.isBefore(regStart)) {
      return { status: 'preregistration', text: 'Предварительная регистрация', color: 'blue' };
    } else if (now.isBefore(regEnd)) {
      return { status: 'registration', text: 'Основная регистрация', color: 'green' };
    } else {
      return { status: 'ended', text: 'Завершено', color: 'red' };
    }
  };

  const getUserRegistration = (eventId) => {
    return userRegistrations.find(reg => reg.event_id === eventId);
  };

  const handleRegister = async (event, registrationType) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/events/${event.id}/register`, {
        event_id: event.id,
        registration_type: registrationType
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Регистрация успешна!');
      fetchUserRegistrations();
    } catch (error) {
      console.error('Error registering for event:', error);
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Ошибка при регистрации на мероприятие.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmParticipation = (event) => {
    setSelectedEvent(event);
    setConfirmModalVisible(true);
    form.setFieldsValue({
      confirmed_address: ''
    });
  };

  const onConfirmSubmit = async (values) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(`/events/${selectedEvent.id}/confirm`, {
        confirmed_address: values.confirmed_address
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      message.success('Участие подтверждено!');
      setConfirmModalVisible(false);
      fetchUserRegistrations();
    } catch (error) {
      console.error('Error confirming participation:', error);
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Ошибка при подтверждении участия.');
      }
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <Text strong>{text}</Text>
          {record.description && <div><Text type="secondary">{record.description}</Text></div>}
        </div>
      )
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => {
        const status = getEventStatus(record);
        return <Tag color={status.color}>{status.text}</Tag>;
      }
    },
    {
      title: 'Даты',
      key: 'dates',
      render: (_, record) => (
        <div>
          <div><Text type="secondary">Предварительная:</Text> {moment(record.preregistration_start).format('DD.MM.YYYY HH:mm')}</div>
          <div><Text type="secondary">Основная:</Text> {moment(record.registration_start).format('DD.MM.YYYY HH:mm')}</div>
          <div><Text type="secondary">До:</Text> {moment(record.registration_end).format('DD.MM.YYYY HH:mm')}</div>
        </div>
      )
    },
    {
      title: 'Ваша регистрация',
      key: 'user_registration',
      render: (_, record) => {
        const userReg = getUserRegistration(record.id);
        if (!userReg) {
          return <Text type="secondary">Не зарегистрированы</Text>;
        }
        
        return (
          <div>
            <div>
              <Tag color={userReg.registration_type === 'preregistration' ? 'blue' : 'green'}>
                {userReg.registration_type === 'preregistration' ? 'Предварительная' : 'Основная'}
              </Tag>
            </div>
            <div>
              {userReg.is_confirmed ? (
                <Tag color="green" icon={<CheckCircleOutlined />}>Подтверждено</Tag>
              ) : (
                <Tag color="orange" icon={<ClockCircleOutlined />}>Ожидает подтверждения</Tag>
              )}
            </div>
          </div>
        );
      }
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => {
        const status = getEventStatus(record);
        const userReg = getUserRegistration(record.id);
        
        if (!userReg) {
          // Пользователь не зарегистрирован
          if (status.status === 'preregistration') {
            return (
              <Button 
                type="primary" 
                onClick={() => handleRegister(record, 'preregistration')}
                loading={loading}
                icon={<CalendarOutlined />}
              >
                Предварительная регистрация
              </Button>
            );
          } else if (status.status === 'registration') {
            return (
              <Button 
                type="primary" 
                onClick={() => handleRegister(record, 'registration')}
                loading={loading}
                icon={<CalendarOutlined />}
              >
                Регистрация
              </Button>
            );
          } else {
            return <Text type="secondary">Регистрация недоступна</Text>;
          }
        } else {
          // Пользователь зарегистрирован
          if (userReg.registration_type === 'preregistration' && 
              status.status === 'registration' && 
              !userReg.is_confirmed) {
            return (
              <Button 
                type="primary" 
                onClick={() => handleConfirmParticipation(record)}
                loading={loading}
                icon={<CheckCircleOutlined />}
              >
                Подтвердить участие
              </Button>
            );
          } else if (userReg.is_confirmed) {
            return <Text type="success">Участие подтверждено</Text>;
          } else {
            return <Text type="secondary">Ожидание подтверждения</Text>;
          }
        }
      }
    }
  ];

  return (
    <div>
      <Card>
        <Title level={3}>Регистрация на мероприятия</Title>
        <Alert
          message="Информация о регистрации"
          description="Вы можете зарегистрироваться на предварительную регистрацию или сразу на основную. При предварительной регистрации вам потребуется подтвердить участие в период основной регистрации."
          type="info"
          showIcon
          style={{ marginBottom: 16 }}
        />
        
        <Table 
          dataSource={events} 
          columns={columns} 
          rowKey="id" 
          loading={loading}
          pagination={{ pageSize: 10 }}
        />
      </Card>

      <Modal
        title="Подтверждение участия"
        open={confirmModalVisible}
        onCancel={() => setConfirmModalVisible(false)}
        footer={null}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={onConfirmSubmit}
        >
          <Alert
            message="Подтверждение участия"
            description="Пожалуйста, подтвердите адрес, по которому вы будете получать подарок."
            type="warning"
            showIcon
            style={{ marginBottom: 16 }}
          />
          
          <Form.Item
            name="confirmed_address"
            label="Адрес для получения подарка"
            rules={[
              { required: true, message: 'Пожалуйста, введите адрес!' },
              { min: 10, message: 'Адрес должен содержать минимум 10 символов!' }
            ]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Введите полный адрес: индекс, город, улица, дом, квартира"
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" loading={loading}>
                Подтвердить участие
              </Button>
              <Button onClick={() => setConfirmModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EventRegistration;
