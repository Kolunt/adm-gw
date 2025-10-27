import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Collapse, Spin } from 'antd';
import { QuestionCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const FAQPage = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      // Пока используем статические данные, позже можно подключить API
      const staticFAQ = [
        {
          id: 1,
          question: "Как работает система анонимного обмена подарками?",
          answer: "Система позволяет участникам регистрироваться на мероприятия, указывать свои желания и получать подарки от других участников. Все происходит анонимно - вы не знаете, кто вам дарит подарок."
        },
        {
          id: 2,
          question: "Как зарегистрироваться на мероприятие?",
          answer: "Перейдите в раздел 'Все мероприятия', выберите интересующее вас мероприятие и нажмите кнопку регистрации. Заполните форму с вашими пожеланиями."
        },
        {
          id: 3,
          question: "Могу ли я выбрать, кому дарить подарок?",
          answer: "Нет, система автоматически назначает получателей подарков случайным образом, чтобы сохранить анонимность процесса."
        },
        {
          id: 4,
          question: "Что делать, если я не получил подарок?",
          answer: "Свяжитесь с администраторами системы через раздел 'Контакты'. Мы поможем решить проблему."
        },
        {
          id: 5,
          question: "Как изменить свои данные в профиле?",
          answer: "Перейдите в раздел 'Профиль' и нажмите кнопку 'Редактировать профиль'. Вы сможете изменить свои контактные данные и пожелания."
        }
      ];
      setFaqData(staticFAQ);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <QuestionCircleOutlined />
            Часто задаваемые вопросы
          </Space>
        </Title>
        <Text type="secondary">
          Ответы на самые популярные вопросы о системе анонимного обмена подарками
        </Text>
      </ProCard>

      <ProCard>
        <Collapse
          size="large"
          items={faqData.map((item) => ({
            key: item.id,
            label: (
              <Text strong style={{ fontSize: '16px' }}>
                {item.question}
              </Text>
            ),
            children: (
              <Paragraph style={{ fontSize: '15px', marginBottom: 0 }}>
                {item.answer}
              </Paragraph>
            ),
          }))}
        />
      </ProCard>
    </div>
  );
};

export default FAQPage;
