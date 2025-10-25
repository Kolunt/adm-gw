import React, { useState } from 'react';
import { Form, Input, Select, Button, Card, message, Space, Typography } from 'antd';
import { GiftOutlined, UserOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;
const { Option } = Select;

const GiftExchange = ({ users, onGiftCreated }) => {
  const [loading, setLoading] = useState(false);

  const onFinish = async (values) => {
    setLoading(true);
    try {
      await axios.post('/gifts/', values);
      message.success('Подарок успешно отправлен!');
      onGiftCreated();
    } catch (error) {
      message.error('Ошибка при отправке подарка: ' + (error.response?.data?.detail || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
      <Card 
        title={
          <Space>
            <GiftOutlined style={{ color: '#d63031' }} />
            <span>Отправить анонимный подарок</span>
          </Space>
        }
        className="santa-card"
      >
        <Title level={4} style={{ textAlign: 'center', color: '#636e72', marginBottom: '30px' }}>
          Выберите кому хотите подарить подарок и опишите что это будет
        </Title>
        
        <Form
          name="gift"
          onFinish={onFinish}
          layout="vertical"
          size="large"
        >
          <Form.Item
            name="receiver_id"
            label="Получатель подарка"
            rules={[{ required: true, message: 'Пожалуйста, выберите получателя!' }]}
          >
            <Select
              placeholder="Выберите кому подарить подарок"
              showSearch
              optionFilterProp="children"
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {users.map(user => (
                <Option key={user.id} value={user.id}>
                  <Space>
                    <UserOutlined />
                    <span>{user.name}</span>
                    <span style={{ color: '#999', fontSize: '12px' }}>({user.email})</span>
                  </Space>
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="gift_description"
            label="Описание подарка"
            rules={[{ required: true, message: 'Пожалуйста, опишите подарок!' }]}
          >
            <Input.TextArea 
              rows={4}
              placeholder="Опишите что вы хотите подарить..."
            />
          </Form.Item>

          <Form.Item>
            <Button 
              type="primary" 
              htmlType="submit" 
              loading={loading}
              size="large"
              block
              icon={<GiftOutlined />}
            >
              Отправить подарок
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
};

export default GiftExchange;
