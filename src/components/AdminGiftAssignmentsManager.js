import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  Select, 
  Button, 
  Space, 
  Typography, 
  Alert,
  Spin
} from 'antd';
import { 
  CalendarOutlined, 
  GiftOutlined
} from '@ant-design/icons';
import axios from 'axios';
import AdminGiftAssignments from './AdminGiftAssignments';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminGiftAssignmentsManager = () => {
  const [events, setEvents] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchEvents = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/events/', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const selectedEvent = events.find(event => event.id === selectedEventId);

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3}>
              <GiftOutlined /> Управление назначениями подарков
            </Title>
            <Text type="secondary">
              Выберите мероприятие для управления назначениями подарков
            </Text>
          </div>

          <Space direction="vertical" style={{ width: '100%' }}>
            <div>
              <Text strong>Выберите мероприятие:</Text>
              <Select
                style={{ width: '100%', marginTop: 8 }}
                placeholder="Выберите мероприятие"
                value={selectedEventId}
                onChange={setSelectedEventId}
                loading={loading}
              >
                {events.map(event => (
                  <Option key={event.id} value={event.id}>
                    {event.name} (ID: {event.id})
                  </Option>
                ))}
              </Select>
            </div>

            {events.length === 0 && !loading && (
              <Alert
                message="Нет доступных мероприятий"
                description="Создайте мероприятие в разделе 'Управление мероприятиями' для работы с назначениями подарков."
                type="info"
                showIcon
              />
            )}

            {selectedEventId && selectedEvent && (
              <AdminGiftAssignments 
                eventId={selectedEventId} 
                eventName={selectedEvent.name}
              />
            )}
          </Space>
        </Space>
      </Card>
    </div>
  );
};

export default AdminGiftAssignmentsManager;
