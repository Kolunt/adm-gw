import React from 'react';
import { List, Card, Typography, Space, Tag } from 'antd';
import { GiftOutlined, ClockCircleOutlined } from '@ant-design/icons';

const { Title, Text } = Typography;

const GiftList = ({ gifts, users }) => {
  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : 'Неизвестный пользователь';
  };

  return (
    <div>
      <Title level={2} style={{ textAlign: 'center', color: '#d63031', marginBottom: '30px' }}>
        🎁 Список подарков
      </Title>
      
      {gifts.length === 0 ? (
        <Card className="santa-card" style={{ textAlign: 'center', padding: '50px' }}>
          <Title level={4} style={{ color: '#636e72' }}>
            Пока нет подарков. Будьте первым, кто подарит подарок! 🎁
          </Title>
        </Card>
      ) : (
        <List
          dataSource={gifts}
          renderItem={(gift) => (
            <List.Item>
              <Card
                className="gift-item"
                style={{ width: '100%' }}
                title={
                  <Space>
                    <GiftOutlined style={{ color: '#00b894' }} />
                    <span>Подарок для {getUserName(gift.receiver_id)}</span>
                  </Space>
                }
                extra={
                  <Tag color={gift.is_delivered ? 'green' : 'orange'}>
                    {gift.is_delivered ? 'Доставлен' : 'В пути'}
                  </Tag>
                }
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Text strong>Описание подарка:</Text>
                  <Text style={{ fontSize: '16px', lineHeight: '1.5' }}>
                    {gift.gift_description}
                  </Text>
                  
                  <Space>
                    <ClockCircleOutlined />
                    <Text type="secondary">
                      Создан: {new Date(gift.created_at).toLocaleString('ru-RU')}
                    </Text>
                  </Space>
                </Space>
              </Card>
            </List.Item>
          )}
        />
      )}
    </div>
  );
};

export default GiftList;
