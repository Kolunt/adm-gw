import React, { useState, useEffect, useCallback } from 'react';
import { 
  Card, 
  List, 
  Typography, 
  Tag, 
  Space, 
  Button, 
  Alert,
  Spin,
  Divider,
  Row,
  Col
} from 'antd';
import { 
  GiftOutlined, 
  UserOutlined,
  MailOutlined,
  HomeOutlined,
  CalendarOutlined,
  CheckCircleOutlined,
  SendOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

const UserGiftAssignments = () => {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchAssignments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await axios.get('/user/gift-assignments', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setAssignments(response.data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  const giverAssignments = assignments.filter(a => a.assignment_type === 'giver');
  const receiverAssignments = assignments.filter(a => a.assignment_type === 'receiver');

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={3}>
              <GiftOutlined /> Мои задания по подаркам
            </Title>
            <Text type="secondary">
              Здесь отображаются ваши задания по отправке и получению подарков
            </Text>
          </div>

          {assignments.length === 0 && !loading && (
            <Alert
              message="Нет активных заданий"
              description="У вас пока нет назначенных заданий по подаркам. Задания появятся после утверждения назначений администратором."
              type="info"
              showIcon
            />
          )}

          <Spin spinning={loading}>
            {giverAssignments.length > 0 && (
              <Card title={<><SendOutlined /> Задания на отправку подарков</>} size="small">
                <List
                  dataSource={giverAssignments}
                  renderItem={(assignment) => (
                    <List.Item>
                      <Card size="small" style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Title level={5}>
                              <CalendarOutlined /> {assignment.event_name}
                            </Title>
                          </div>
                          
                          <Row gutter={16}>
                            <Col span={12}>
                              <div>
                                <Text strong>Получатель подарка:</Text>
                                <div style={{ marginTop: 4 }}>
                                  <div><UserOutlined /> {assignment.receiver_name}</div>
                                  <div><MailOutlined /> {assignment.receiver_email}</div>
                                </div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div>
                                <Text strong>Адрес для отправки:</Text>
                                <div style={{ marginTop: 4 }}>
                                  <div><HomeOutlined /> {assignment.receiver_address}</div>
                                </div>
                              </div>
                            </Col>
                          </Row>

                          <Divider />

                          <Alert
                            message="Ваше задание"
                            description={
                              <div>
                                <p>Отправьте подарок по указанному адресу:</p>
                                <p><strong>{assignment.receiver_address}</strong></p>
                                <p>Получатель: <strong>{assignment.receiver_name}</strong></p>
                              </div>
                            }
                            type="success"
                            showIcon
                            icon={<GiftOutlined />}
                          />
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>
            )}

            {receiverAssignments.length > 0 && (
              <Card title={<><CheckCircleOutlined /> Ожидаемые подарки</>} size="small">
                <List
                  dataSource={receiverAssignments}
                  renderItem={(assignment) => (
                    <List.Item>
                      <Card size="small" style={{ width: '100%' }}>
                        <Space direction="vertical" style={{ width: '100%' }}>
                          <div>
                            <Title level={5}>
                              <CalendarOutlined /> {assignment.event_name}
                            </Title>
                          </div>
                          
                          <Row gutter={16}>
                            <Col span={12}>
                              <div>
                                <Text strong>От кого ожидается подарок:</Text>
                                <div style={{ marginTop: 4 }}>
                                  <div><UserOutlined /> {assignment.giver_name}</div>
                                  <div><MailOutlined /> {assignment.giver_email}</div>
                                </div>
                              </div>
                            </Col>
                            <Col span={12}>
                              <div>
                                <Text strong>Ваш адрес:</Text>
                                <div style={{ marginTop: 4 }}>
                                  <div><HomeOutlined /> {assignment.receiver_address}</div>
                                </div>
                              </div>
                            </Col>
                          </Row>

                          <Divider />

                          <Alert
                            message="Ожидаемый подарок"
                            description={
                              <div>
                                <p>Подарок будет отправлен от:</p>
                                <p><strong>{assignment.giver_name}</strong></p>
                                <p>На адрес: <strong>{assignment.receiver_address}</strong></p>
                              </div>
                            }
                            type="info"
                            showIcon
                            icon={<GiftOutlined />}
                          />
                        </Space>
                      </Card>
                    </List.Item>
                  )}
                />
              </Card>
            )}
          </Spin>
        </Space>
      </Card>
    </div>
  );
};

export default UserGiftAssignments;
