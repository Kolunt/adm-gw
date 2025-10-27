import React, { useState, useEffect } from 'react';
import { Table, Button, Modal, Form, Input, DatePicker, message, Space, Popconfirm, Tag } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';
import moment from 'moment';

const { TextArea } = Input;

function EventManagement() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [form] = Form.useForm();

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
      message.error('Ошибка при загрузке мероприятий');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEvent = () => {
    setEditingEvent(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditEvent = (event) => {
    setEditingEvent(event);
    form.setFieldsValue({
      name: event.name,
      description: event.description,
      preregistration_start: moment(event.preregistration_start),
      registration_start: moment(event.registration_start),
      registration_end: moment(event.registration_end),
    });
    setModalVisible(true);
  };

  const handleDeleteEvent = async (eventId) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/events/${eventId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      message.success('Мероприятие удалено');
      fetchEvents();
    } catch (error) {
      console.error('Error deleting event:', error);
      message.error('Ошибка при удалении мероприятия');
    }
  };

  const handleSubmit = async (values) => {
    try {
      const token = localStorage.getItem('token');
      const eventData = {
        name: values.name,
        description: values.description || '',
        preregistration_start: values.preregistration_start.toISOString(),
        registration_start: values.registration_start.toISOString(),
        registration_end: values.registration_end.toISOString(),
      };

      if (editingEvent) {
        await axios.put(`/events/${editingEvent.id}`, eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Мероприятие обновлено');
      } else {
        await axios.post('/events/', eventData, {
          headers: { Authorization: `Bearer ${token}` }
        });
        message.success('Мероприятие создано');
      }

      setModalVisible(false);
      fetchEvents();
    } catch (error) {
      console.error('Error saving event:', error);
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Ошибка при сохранении мероприятия');
      }
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <div>
          <div style={{ fontWeight: 'bold' }}>{text}</div>
          {record.description && (
            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
              {record.description.length > 50 
                ? `${record.description.substring(0, 50)}...` 
                : record.description
              }
            </div>
          )}
        </div>
      ),
    },
    {
      title: 'Предварительная регистрация',
      dataIndex: 'preregistration_start',
      key: 'preregistration_start',
      render: (date) => moment(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Регистрация',
      dataIndex: 'registration_start',
      key: 'registration_start',
      render: (date) => moment(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Закрытие регистрации',
      dataIndex: 'registration_end',
      key: 'registration_end',
      render: (date) => moment(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активно' : 'Неактивно'}
        </Tag>
      ),
    },
    {
      title: 'Создано',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => moment(date).format('DD.MM.YYYY HH:mm'),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEditEvent(record)}
          >
            Редактировать
          </Button>
          <Popconfirm
            title="Вы уверены, что хотите удалить это мероприятие?"
            onConfirm={() => handleDeleteEvent(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              type="primary"
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2>Управление мероприятиями</h2>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreateEvent}
        >
          Создать мероприятие
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={events}
        loading={loading}
        rowKey="id"
        pagination={{
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total, range) => `${range[0]}-${range[1]} из ${total} мероприятий`,
        }}
      />

      <Modal
        title={editingEvent ? 'Редактировать мероприятие' : 'Создать мероприятие'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="name"
            label="Название мероприятия"
            rules={[{ required: true, message: 'Пожалуйста, введите название мероприятия!' }]}
          >
            <Input placeholder="Например: Анонимный Дед Мороз 2024" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание"
          >
            <TextArea
              rows={3}
              placeholder="Описание мероприятия (необязательно)"
            />
          </Form.Item>

          <Form.Item
            name="preregistration_start"
            label="Дата начала предварительной регистрации"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату!' }]}
          >
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Выберите дату и время"
            />
          </Form.Item>

          <Form.Item
            name="registration_start"
            label="Дата начала регистрации"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату!' }]}
          >
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Выберите дату и время"
            />
          </Form.Item>

          <Form.Item
            name="registration_end"
            label="Дата закрытия регистрации"
            rules={[{ required: true, message: 'Пожалуйста, выберите дату!' }]}
          >
            <DatePicker
              showTime
              format="DD.MM.YYYY HH:mm"
              style={{ width: '100%' }}
              placeholder="Выберите дату и время"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit" icon={<CalendarOutlined />}>
                {editingEvent ? 'Обновить' : 'Создать'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default EventManagement;
