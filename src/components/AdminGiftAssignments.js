import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Space, 
  Button, 
  Table, 
  message,
  Modal,
  Form,
  Select,
  Tag,
  Statistic,
  Row,
  Col,
  Alert,
  Popconfirm
} from 'antd';
import { 
  GiftOutlined, 
  UserOutlined,
  ReloadOutlined,
  CheckOutlined,
  EditOutlined,
  DeleteOutlined,
  ThunderboltOutlined
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminGiftAssignments = () => {
  const { isDark } = useTheme();
  const [assignments, setAssignments] = useState([]);
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [eventParticipants, setEventParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
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
      message.error('Ошибка загрузки мероприятий');
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async (eventId) => {
    try {
      // Пока используем моковые данные
      const mockAssignments = [
        {
          id: 1,
          giver_id: 1,
          receiver_id: 2,
          giver_name: 'Иван Иванов',
          receiver_name: 'Петр Петров',
          event_id: eventId,
          status: 'draft'
        },
        {
          id: 2,
          giver_id: 2,
          receiver_id: 3,
          giver_name: 'Петр Петров',
          receiver_name: 'Мария Сидорова',
          event_id: eventId,
          status: 'draft'
        }
      ];
      setAssignments(mockAssignments);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      message.error('Ошибка загрузки назначений');
    }
  };

  const fetchEventParticipants = async (eventId) => {
    try {
      // Пока используем моковые данные
      const mockParticipants = [
        { id: 1, name: 'Иван Иванов', email: 'ivan@example.com' },
        { id: 2, name: 'Петр Петров', email: 'petr@example.com' },
        { id: 3, name: 'Мария Сидорова', email: 'maria@example.com' },
        { id: 4, name: 'Анна Козлова', email: 'anna@example.com' },
        { id: 5, name: 'Сергей Волков', email: 'sergey@example.com' }
      ];
      setEventParticipants(mockParticipants);
    } catch (error) {
      console.error('Error fetching participants:', error);
      message.error('Ошибка загрузки участников');
    }
  };

  const handleEventSelect = (eventId) => {
    const event = events.find(e => e.id === eventId);
    setSelectedEvent(event);
    fetchEventParticipants(eventId);
    fetchAssignments(eventId);
  };

  const generateAssignments = async () => {
    if (!selectedEvent || eventParticipants.length < 2) {
      message.warning('Недостаточно участников для генерации назначений');
      return;
    }

    setGenerating(true);
    try {
      // Алгоритм генерации назначений
      const shuffledParticipants = [...eventParticipants].sort(() => Math.random() - 0.5);
      const newAssignments = [];

      for (let i = 0; i < shuffledParticipants.length; i++) {
        const giver = shuffledParticipants[i];
        const receiver = shuffledParticipants[(i + 1) % shuffledParticipants.length];
        
        newAssignments.push({
          id: i + 1,
          giver_id: giver.id,
          receiver_id: receiver.id,
          giver_name: giver.name,
          receiver_name: receiver.name,
          event_id: selectedEvent.id,
          status: 'draft'
        });
      }

      setAssignments(newAssignments);
      message.success('Список назначений сгенерирован!');
    } catch (error) {
      console.error('Error generating assignments:', error);
      message.error('Ошибка генерации назначений');
    } finally {
      setGenerating(false);
    }
  };

  const handleEditAssignment = (assignment) => {
    setEditingAssignment(assignment);
    form.setFieldsValue({
      giver_id: assignment.giver_id,
      receiver_id: assignment.receiver_id
    });
    setModalVisible(true);
  };

  const handleSaveAssignment = async (values) => {
    try {
      const updatedAssignments = assignments.map(assignment => 
        assignment.id === editingAssignment.id 
          ? {
              ...assignment,
              giver_id: values.giver_id,
              receiver_id: values.receiver_id,
              giver_name: eventParticipants.find(p => p.id === values.giver_id)?.name,
              receiver_name: eventParticipants.find(p => p.id === values.receiver_id)?.name
            }
          : assignment
      );
      
      setAssignments(updatedAssignments);
      message.success('Назначение обновлено');
      setModalVisible(false);
      setEditingAssignment(null);
    } catch (error) {
      console.error('Error updating assignment:', error);
      message.error('Ошибка обновления назначения');
    }
  };

  const handleDeleteAssignment = (assignmentId) => {
    setAssignments(assignments.filter(a => a.id !== assignmentId));
    message.success('Назначение удалено');
  };

  const approveAssignments = async () => {
    try {
      // Здесь будет API вызов для утверждения назначений
      const approvedAssignments = assignments.map(assignment => ({
        ...assignment,
        status: 'approved'
      }));
      
      setAssignments(approvedAssignments);
      message.success('Список назначений утвержден!');
    } catch (error) {
      console.error('Error approving assignments:', error);
      message.error('Ошибка утверждения назначений');
    }
  };

  const columns = [
    {
      title: 'Даритель (Дед Мороз)',
      key: 'giver',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: isDark ? '#ffffff' : '#000000' }} />
          <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>{record.giver_name}</Text>
        </Space>
      ),
    },
    {
      title: 'Получатель (Внучок)',
      key: 'receiver',
      render: (_, record) => (
        <Space>
          <UserOutlined style={{ color: isDark ? '#ffffff' : '#000000' }} />
          <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>{record.receiver_name}</Text>
        </Space>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Tag color={status === 'approved' ? 'green' : 'orange'}>
          {status === 'approved' ? 'Утверждено' : 'Черновик'}
        </Tag>
      ),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            type="text" 
            icon={<EditOutlined />} 
            onClick={() => handleEditAssignment(record)}
            disabled={record.status === 'approved'}
          />
          <Popconfirm
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Удалить назначение?</span>}
            onConfirm={() => handleDeleteAssignment(record.id)}
            disabled={record.status === 'approved'}
          >
            <Button 
              type="text" 
              danger 
              icon={<DeleteOutlined />}
              disabled={record.status === 'approved'}
            />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const isAllApproved = assignments.length > 0 && assignments.every(a => a.status === 'approved');
  const hasDraftAssignments = assignments.some(a => a.status === 'draft');

  const inputStyle = {
    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
  };

  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ padding: '24px' }}>
      <ProCard style={{ 
        marginBottom: '24px',
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
      }}>
        <Title level={2} style={{ color: isDark ? '#ffffff' : '#000000' }}>
          <Space>
            <GiftOutlined />
            Назначения подарков
          </Space>
        </Title>
        <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
          Генерация и управление назначениями подарков между участниками мероприятия
        </Text>
      </ProCard>

      {/* Выбор мероприятия */}
      <ProCard style={{ 
        marginBottom: '24px',
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
      }}>
        <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Выберите мероприятие</Title>
        <Select
          placeholder="Выберите мероприятие"
          style={{ width: '100%', marginBottom: '16px', ...inputStyle }}
          onChange={handleEventSelect}
          loading={loading}
          styles={{
            popup: {
              root: {
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }
            }
          }}
        >
          {events.map(event => {
            const eventDate = event.start_date ? new Date(event.start_date) : null;
            const isValidDate = eventDate && !isNaN(eventDate.getTime());
            const formattedDate = isValidDate ? eventDate.toLocaleDateString('ru-RU') : 'Дата не указана';
            
            return (
              <Option key={event.id} value={event.id}>
                {event.title || `Мероприятие ${event.id}`} ({formattedDate})
              </Option>
            );
          })}
        </Select>
        
        {selectedEvent && (
          <Alert
            message={`Выбрано мероприятие: ${selectedEvent.title || `Мероприятие ${selectedEvent.id}`}`}
            description={`Дата: ${(() => {
              const eventDate = selectedEvent.start_date ? new Date(selectedEvent.start_date) : null;
              const isValidDate = eventDate && !isNaN(eventDate.getTime());
              return isValidDate ? eventDate.toLocaleDateString('ru-RU') : 'Дата не указана';
            })()} | Участников: ${eventParticipants.length}`}
            type="info"
            showIcon
            style={{
              backgroundColor: isDark ? '#2f2f2f' : '#e6f7ff',
              border: isDark ? '1px solid #404040' : '1px solid #91d5ff',
              color: isDark ? '#ffffff' : '#000000'
            }}
          />
        )}
      </ProCard>

      {selectedEvent && (
        <>
          {/* Статистика */}
          <Row gutter={[16, 16]} style={{ marginBottom: '24px' }}>
            <Col xs={24} sm={8}>
              <ProCard style={{
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}>
                <Statistic
                  title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Участников</span>}
                  value={eventParticipants.length}
                  prefix={<UserOutlined />}
                  valueStyle={{ color: '#1890ff' }}
                />
              </ProCard>
            </Col>
            <Col xs={24} sm={8}>
              <ProCard style={{
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}>
                <Statistic
                  title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Назначений</span>}
                  value={assignments.length}
                  prefix={<GiftOutlined />}
                  valueStyle={{ color: '#52c41a' }}
                />
              </ProCard>
            </Col>
            <Col xs={24} sm={8}>
              <ProCard style={{
                backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
              }}>
                <Statistic
                  title={<span style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Статус</span>}
                  value={isAllApproved ? 'Утверждено' : 'Черновик'}
                  prefix={<CheckOutlined />}
                  valueStyle={{ color: isAllApproved ? '#52c41a' : '#faad14' }}
                />
              </ProCard>
            </Col>
          </Row>

          {/* Управление */}
          <ProCard style={{ 
            marginBottom: '24px',
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
              <Space>
                <Button 
                  type="primary" 
                  icon={<ThunderboltOutlined />} 
                  onClick={generateAssignments}
                  loading={generating}
                  disabled={eventParticipants.length < 2}
                >
                  Сгенерировать список
                </Button>
                <Button 
                  icon={<ReloadOutlined />} 
                  onClick={() => fetchAssignments(selectedEvent.id)}
                  style={{
                    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                    borderColor: isDark ? '#404040' : '#d9d9d9',
                    color: isDark ? '#ffffff' : '#000000'
                  }}
                >
                  Обновить
                </Button>
              </Space>
              
              {hasDraftAssignments && (
                <Popconfirm
                  title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Утвердить список назначений?</span>}
                  description={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>После утверждения изменения будут невозможны</span>}
                  onConfirm={approveAssignments}
                  okText="Утвердить"
                  cancelText="Отмена"
                >
                  <Button 
                    type="primary" 
                    icon={<CheckOutlined />}
                    style={{ backgroundColor: '#52c41a', borderColor: '#52c41a' }}
                  >
                    Утвердить список
                  </Button>
                </Popconfirm>
              )}
            </div>
          </ProCard>

          {/* Таблица назначений */}
          <ProCard style={{
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
          }}>
            <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Список назначений</Title>
              {assignments.length > 0 && (
                <Tag color={isAllApproved ? 'green' : 'orange'}>
                  {isAllApproved ? 'Список утвержден' : 'Черновик'}
                </Tag>
              )}
            </div>

            {assignments.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px' }}>
                <GiftOutlined style={{ fontSize: '48px', color: isDark ? '#666666' : '#d9d9d9', marginBottom: '16px' }} />
                <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Назначения не созданы</Title>
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
                  Нажмите "Сгенерировать список" для создания назначений
                </Text>
              </div>
            ) : (
              <Table
                columns={columns}
                dataSource={assignments}
                loading={loading}
                rowKey="id"
                style={{
                  backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                }}
                pagination={{
                  pageSize: 10,
                  showSizeChanger: true,
                  showQuickJumper: true,
                  showTotal: (total, range) =>
                    `${range[0]}-${range[1]} из ${total} назначений`,
                }}
              />
            )}
          </ProCard>
        </>
      )}

      {/* Модальное окно для редактирования назначения */}
      <Modal
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Редактировать назначение</span>}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          setEditingAssignment(null);
          form.resetFields();
        }}
        footer={null}
        width={600}
        styles={{
          content: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          },
          header: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            borderBottom: isDark ? '1px solid #404040' : '1px solid #f0f0f0'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSaveAssignment}
        >
          <Form.Item
            name="giver_id"
            label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Даритель (Дед Мороз)</span>}
            rules={[{ required: true, message: 'Выберите дарителя' }]}
          >
            <Select 
              placeholder="Выберите дарителя"
              style={inputStyle}
              styles={{
                popup: {
                  root: {
                    backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                  }
                }
              }}
            >
              {eventParticipants.map(participant => (
                <Option key={participant.id} value={participant.id}>
                  {participant.name || participant.email || `Участник ${participant.id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="receiver_id"
            label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Получатель (Внучок)</span>}
            rules={[{ required: true, message: 'Выберите получателя' }]}
          >
            <Select 
              placeholder="Выберите получателя"
              style={inputStyle}
              styles={{
                popup: {
                  root: {
                    backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                  }
                }
              }}
            >
              {eventParticipants.map(participant => (
                <Option key={participant.id} value={participant.id}>
                  {participant.name || participant.email || `Участник ${participant.id}`}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button 
                onClick={() => {
                  setModalVisible(false);
                  setEditingAssignment(null);
                  form.resetFields();
                }}
                style={{
                  backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                  borderColor: isDark ? '#404040' : '#d9d9d9',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              >
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Сохранить
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminGiftAssignments;