import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Table, 
  Button, 
  Space, 
  message, 
  Modal, 
  Select, 
  Typography, 
  Tag, 
  Popconfirm,
  Alert,
  Spin,
  Row,
  Col,
  Statistic
} from 'antd';
import { 
  GiftOutlined, 
  CheckOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  UserOutlined,
  MailOutlined,
  HomeOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminGiftAssignments = ({ eventId, eventName }) => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [selectedGiver, setSelectedGiver] = useState(null);
  const [selectedReceiver, setSelectedReceiver] = useState(null);

  const fetchAssignments = useCallback(async () => {
    if (!eventId) return;
    
    setLoading(true);
    try {
      const response = await axios.get(`/admin/events/${eventId}/gift-assignments`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      message.error('Ошибка при загрузке назначений');
    } finally {
      setLoading(false);
    }
  }, [eventId]);

  const fetchParticipants = useCallback(async () => {
    if (!eventId) return;
    
    try {
      const response = await axios.get(`/events/${eventId}/participants`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setParticipants(response.data);
    } catch (error) {
      console.error('Error fetching participants:', error);
    }
  }, [eventId]);

  useEffect(() => {
    fetchAssignments();
    fetchParticipants();
  }, [fetchAssignments, fetchParticipants]);

  const generateAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`/admin/events/${eventId}/gift-assignments/generate`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success(response.data.message);
      fetchAssignments();
    } catch (error) {
      console.error('Error generating assignments:', error);
      message.error(error.response?.data?.detail || 'Ошибка при генерации назначений');
    } finally {
      setLoading(false);
    }
  };

  const approveAssignment = async (assignmentId) => {
    try {
      await axios.post(`/admin/gift-assignments/${assignmentId}/approve`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Назначение утверждено');
      fetchAssignments();
    } catch (error) {
      console.error('Error approving assignment:', error);
      message.error('Ошибка при утверждении назначения');
    }
  };

  const approveAllAssignments = async () => {
    setLoading(true);
    try {
      const response = await axios.post(`/admin/events/${eventId}/gift-assignments/approve-all`, {}, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success(response.data.message);
      fetchAssignments();
    } catch (error) {
      console.error('Error approving all assignments:', error);
      message.error('Ошибка при утверждении всех назначений');
    } finally {
      setLoading(false);
    }
  };

  const deleteAssignment = async (assignmentId) => {
    try {
      await axios.delete(`/admin/gift-assignments/${assignmentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Назначение удалено');
      fetchAssignments();
    } catch (error) {
      console.error('Error deleting assignment:', error);
      message.error('Ошибка при удалении назначения');
    }
  };

  const openEditModal = (assignment) => {
    setEditingAssignment(assignment);
    setSelectedGiver(assignment.giver_id);
    setSelectedReceiver(assignment.receiver_id);
    setEditModalVisible(true);
  };

  const saveAssignment = async () => {
    if (!selectedGiver || !selectedReceiver) {
      message.error('Выберите дарителя и получателя');
      return;
    }

    try {
      await axios.put(`/admin/gift-assignments/${editingAssignment.id}`, {
        giver_id: selectedGiver,
        receiver_id: selectedReceiver
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Назначение обновлено');
      setEditModalVisible(false);
      fetchAssignments();
    } catch (error) {
      console.error('Error updating assignment:', error);
      message.error('Ошибка при обновлении назначения');
    }
  };

  const columns = [
    {
      title: 'Даритель',
      dataIndex: 'giver_name',
      key: 'giver_name',
      render: (text, record) => (
        <div>
          <div><UserOutlined /> {text}</div>
          <div><MailOutlined /> {record.giver_email}</div>
        </div>
      )
    },
    {
      title: 'Получатель',
      dataIndex: 'receiver_name',
      key: 'receiver_name',
      render: (text, record) => (
        <div>
          <div><UserOutlined /> {text}</div>
          <div><MailOutlined /> {record.receiver_email}</div>
          <div><HomeOutlined /> {record.receiver_address}</div>
        </div>
      )
    },
    {
      title: 'Статус',
      dataIndex: 'is_approved',
      key: 'is_approved',
      render: (isApproved) => (
        <Tag color={isApproved ? 'green' : 'orange'}>
          {isApproved ? 'Утверждено' : 'Ожидает утверждения'}
        </Tag>
      )
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button 
            icon={<EditOutlined />} 
            size="small"
            onClick={() => openEditModal(record)}
          >
            Изменить
          </Button>
          {!record.is_approved && (
            <Button 
              icon={<CheckOutlined />} 
              size="small"
              type="primary"
              onClick={() => approveAssignment(record.id)}
            >
              Утвердить
            </Button>
          )}
          <Popconfirm
            title="Удалить назначение?"
            onConfirm={() => deleteAssignment(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button 
              icon={<DeleteOutlined />} 
              size="small"
              danger
            >
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      )
    }
  ];

  const approvedCount = assignments.filter(a => a.is_approved).length;
  const totalCount = assignments.length;

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3}>
              <GiftOutlined /> Назначения подарков
            </Title>
            <Text type="secondary">
              Мероприятие: {eventName}
            </Text>
          </div>

          <Row gutter={16}>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Всего назначений"
                  value={totalCount}
                  prefix={<GiftOutlined />}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Утверждено"
                  value={approvedCount}
                  prefix={<CheckOutlined />}
                  valueStyle={{ color: '#3f8600' }}
                />
              </Card>
            </Col>
            <Col span={8}>
              <Card>
                <Statistic
                  title="Ожидает утверждения"
                  value={totalCount - approvedCount}
                  prefix={<ReloadOutlined />}
                  valueStyle={{ color: '#cf1322' }}
                />
              </Card>
            </Col>
          </Row>

          <Space>
            <Button 
              type="primary" 
              icon={<GiftOutlined />}
              onClick={generateAssignments}
              loading={loading}
              disabled={totalCount > 0}
            >
              Сгенерировать назначения
            </Button>
            {totalCount > 0 && approvedCount < totalCount && (
              <Button 
                type="primary" 
                icon={<CheckOutlined />}
                onClick={approveAllAssignments}
                loading={loading}
              >
                Утвердить все
              </Button>
            )}
            <Button 
              icon={<ReloadOutlined />}
              onClick={fetchAssignments}
              loading={loading}
            >
              Обновить
            </Button>
          </Space>

          {totalCount === 0 && (
            <Alert
              message="Назначения не созданы"
              description="Нажмите 'Сгенерировать назначения' для создания случайного распределения подарков между участниками."
              type="info"
              showIcon
            />
          )}

          <Spin spinning={loading}>
            <Table
              columns={columns}
              dataSource={assignments}
              rowKey="id"
              pagination={false}
              size="small"
            />
          </Spin>
        </Space>
      </Card>

      <Modal
        title="Редактировать назначение"
        open={editModalVisible}
        onOk={saveAssignment}
        onCancel={() => setEditModalVisible(false)}
        okText="Сохранить"
        cancelText="Отмена"
      >
        <Space direction="vertical" style={{ width: '100%' }}>
          <div>
            <Text strong>Даритель:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedGiver}
              onChange={setSelectedGiver}
              placeholder="Выберите дарителя"
            >
              {participants.map(participant => (
                <Option key={participant.user_id} value={participant.user_id}>
                  {participant.name} ({participant.email})
                </Option>
              ))}
            </Select>
          </div>
          <div>
            <Text strong>Получатель:</Text>
            <Select
              style={{ width: '100%', marginTop: 8 }}
              value={selectedReceiver}
              onChange={setSelectedReceiver}
              placeholder="Выберите получателя"
            >
              {participants.map(participant => (
                <Option key={participant.user_id} value={participant.user_id}>
                  {participant.name} ({participant.email})
                </Option>
              ))}
            </Select>
          </div>
        </Space>
      </Modal>
    </div>
  );
};

export default AdminGiftAssignments;
