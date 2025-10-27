import React, { useState, useEffect } from 'react';
import { Card, Collapse, Spin, Alert, Typography, Space } from 'antd';
import { QuestionCircleOutlined, DownOutlined, RightOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;

function FAQ() {
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/faq');
      setFaqItems(response.data);
      setError(null);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      setError('Ошибка при загрузке FAQ');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
        <div style={{ marginTop: '16px' }}>
          <Text>Загрузка FAQ...</Text>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Alert
        message="Ошибка"
        description={error}
        type="error"
        showIcon
        style={{ margin: '20px' }}
      />
    );
  }

  if (faqItems.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <QuestionCircleOutlined style={{ fontSize: '48px', color: '#d63031', marginBottom: '16px' }} />
        <Title level={3}>FAQ пока пуст</Title>
        <Text type="secondary">
          Часто задаваемые вопросы будут добавлены администратором
        </Text>
      </div>
    );
  }

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <QuestionCircleOutlined style={{ fontSize: '48px', color: '#d63031', marginBottom: '16px' }} />
        <Title level={1} style={{ color: '#d63031', marginBottom: '10px' }}>
          Часто задаваемые вопросы
        </Title>
        <Text type="secondary" style={{ fontSize: '16px' }}>
          Ответы на самые популярные вопросы о системе "Анонимный Дед Мороз"
        </Text>
      </div>

      <Collapse
        size="large"
        expandIcon={({ isActive }) => 
          isActive ? <DownOutlined /> : <RightOutlined />
        }
        style={{ marginBottom: '20px' }}
        items={faqItems.map((item) => ({
          key: item.id,
          label: (
            <Space>
              <Text strong style={{ fontSize: '16px' }}>
                {item.question}
              </Text>
            </Space>
          ),
          children: (
            <div style={{ paddingLeft: '20px' }}>
              <Text style={{ fontSize: '15px', lineHeight: '1.6' }}>
                {item.answer}
              </Text>
            </div>
          ),
          style: { marginBottom: '8px' }
        }))}
      />

      <Card style={{ marginTop: '30px', backgroundColor: '#f8f9fa' }}>
        <div style={{ textAlign: 'center' }}>
          <Title level={4} style={{ color: '#666' }}>
            Не нашли ответ на свой вопрос?
          </Title>
          <Text type="secondary">
            Обратитесь к администратору системы или создайте тему в обсуждениях
          </Text>
        </div>
      </Card>
    </div>
  );
}

export default FAQ;
