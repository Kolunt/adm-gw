import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Modal, Form, Input, DatePicker, message, Table, Tag, Popconfirm } from 'antd';
import { CalendarOutlined, PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminEvents = () => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();
  const eventStartValue = Form.useWatch('event_start', form);

  const formatTimeDiff = (target) => {
    if (!target) return '';
    const now = dayjs();
    const start = dayjs(target);
    const diffMs = start.diff(now);
    if (diffMs <= 0) return 'уже наступило или в прошлом';
    const duration = dayjs.duration(diffMs);
    const days = Math.floor(duration.asDays());
    const hours = duration.hours();
    const minutes = duration.minutes();
    const parts = [];
    if (days) parts.push(`${days} д`);
    if (hours) parts.push(`${hours} ч`);
    if (minutes) parts.push(`${minutes} м`);
    return parts.length ? parts.join(' ') : 'менее минуты';
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/events/');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
      message.error('Ошибка загрузки мероприятий');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingEvent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      name: event.name,
      description: event.description,
      preregistration_start: dayjs(event.preregistration_start),
      registration_start: dayjs(event.registration_start),
      registration_end: dayjs(event.registration_end),
      event_start: event.event_start ? dayjs(event.event_start) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (eventId) => {
    try {
      await axios.delete(`/events/${eventId}`);
      message.success('Мероприятие удалено');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      message.error('Ошибка удаления мероприятия');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const eventData = {
        ...values,
        preregistration_start: values.preregistration_start.toISOString(),
        registration_start: values.registration_start.toISOString(),
        registration_end: values.registration_end.toISOString(),
        event_start: values.event_start ? values.event_start.toISOString() : null,
      };

      if (editingEvent) {
        await axios.put(`/events/${editingEvent.id}`, eventData);
        message.success('Мероприятие обновлено');
      } else {
        await axios.post('/events/', eventData);
        message.success('Мероприятие создано');
      }
      
      setModalVisible(false);
      form.resetFields();
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      message.error('Ошибка сохранения мероприятия');
    }
  };

  const createTestEvent = async () => {
    const now = new Date();
    const testEvent = {
      name: 'Новогодний обмен подарками 2024',
      description: 'Традиционный новогодний обмен подарками в сообществе GWars.io',
      preregistration_start: new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString(), // Завтра
      registration_start: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(), // Через 3 дня
      registration_end: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString() // Через неделю
    };

    try {
      await axios.post('/events/', testEvent);
      message.success('Тестовое мероприятие создано!');
      fetchEvents();
    } catch (error) {
      console.error('Error creating test event:', error);
      message.error('Ошибка создания тестового мероприятия');
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

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong>{text}</Text>
    },
    {
      title: 'Описание',
      dataIndex: 'description',
      key: 'description',
      ellipsis: true
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
      title: 'Предварительная регистрация',
      dataIndex: 'preregistration_start',
      key: 'preregistration_start',
      render: (date) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: 'Основная регистрация',
      dataIndex: 'registration_start',
      key: 'registration_start',
      render: (date) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: 'Окончание регистрации',
      dataIndex: 'registration_end',
      key: 'registration_end',
      render: (date) => new Date(date).toLocaleDateString('ru-RU')
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="text"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          />
          <Popconfirm
            title="Удалить мероприятие?"
            description="Вы уверены, что хотите удалить это мероприятие?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
            />
          </Popconfirm>
        </Space>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>
              <Space>
                <CalendarOutlined />
                Управление мероприятиями
              </Space>
            </Title>
            <Text type="secondary">
              Создание и управление мероприятиями обмена подарками
            </Text>
          </div>
          <Space>
            <Button
              type="default"
              onClick={createTestEvent}
            >
              Создать тестовое мероприятие
            </Button>
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={handleCreate}
            >
              Создать мероприятие
            </Button>
          </Space>
        </div>
      </ProCard>

      <ProCard>
        <Table
          columns={columns}
          dataSource={events}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} мероприятий`
          }}
        />
      </ProCard>

      <Modal
        title={editingEvent ? 'Редактировать мероприятие' : 'Создать мероприятие'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          {/* Информация о времени до события — удалено по запросу */}

          <Form.Item
            name="name"
            label="Название мероприятия"
            rules={[{ required: true, message: 'Пожалуйста, введите название' }]}
          >
            <Input placeholder="Введите название мероприятия" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <TextArea rows={3} placeholder="Краткое описание" />
          </Form.Item>

          <Form.Item
            name="preregistration_start"
            label="Дата начала предварительной регистрации"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Выберите дату начала предварительной регистрации"
            />
          </Form.Item>

          <Form.Item
            name="registration_start"
            label="Дата начала основной регистрации"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Выберите дату начала основной регистрации"
            />
          </Form.Item>

          <Form.Item
            name="registration_end"
            label="Дата окончания регистрации"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Выберите дату окончания регистрации"
            />
          </Form.Item>

          <Form.Item
            name="event_start"
            label="Дата и время события"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату и время события' }]}
          >
            <DatePicker
              showTime
              style={{ width: '100%' }}
              placeholder="Выберите дату и время события"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingEvent ? 'Обновить' : 'Создать'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminEvents;
