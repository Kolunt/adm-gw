import React from 'react';
import { Card, Typography, Space, Row, Col, Divider } from 'antd';
import { InfoCircleOutlined, GiftOutlined, TeamOutlined, CalendarOutlined, HeartOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text, Paragraph } = Typography;

const AboutPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <InfoCircleOutlined />
            О системе "Анонимный Дед Мороз"
          </Space>
        </Title>
        <Text type="secondary">
          Информация о системе анонимного обмена подарками
        </Text>
      </ProCard>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <ProCard title="Что это такое?" style={{ height: '100%' }}>
            <Paragraph>
              "Анонимный Дед Мороз" — это веб-система для организации анонимного обмена подарками 
              между участниками сообщества GWars.io. Система позволяет создавать мероприятия, 
              регистрировать участников и автоматически назначать получателей подарков.
            </Paragraph>
            <Paragraph>
              Главная особенность — полная анонимность процесса. Вы не знаете, кто вам дарит подарок, 
              а получатель не знает, кто его подарил.
            </Paragraph>
          </ProCard>
        </Col>

        <Col xs={24} md={12}>
          <ProCard title="Как это работает?" style={{ height: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <CalendarOutlined style={{ marginRight: '8px', color: '#2d5016' }} />
                <Text strong>1. Регистрация на мероприятие</Text>
                <br />
                <Text type="secondary">Выбираете мероприятие и регистрируетесь</Text>
              </div>
              <div>
                <GiftOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                <Text strong>2. Указание пожеланий</Text>
                <br />
                <Text type="secondary">Заполняете список желаемых подарков</Text>
              </div>
              <div>
                <TeamOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                <Text strong>3. Автоматическое назначение</Text>
                <br />
                <Text type="secondary">Система случайно назначает получателя</Text>
              </div>
              <div>
                <HeartOutlined style={{ marginRight: '8px', color: '#f5222d' }} />
                <Text strong>4. Обмен подарками</Text>
                <br />
                <Text type="secondary">Дарите и получаете подарки анонимно</Text>
              </div>
            </Space>
          </ProCard>
        </Col>
      </Row>

      <ProCard title="Технические детали" style={{ marginTop: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Backend</Title>
              <Text type="secondary">FastAPI (Python)</Text>
              <br />
              <Text type="secondary">SQLite база данных</Text>
              <br />
              <Text type="secondary">JWT аутентификация</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Frontend</Title>
              <Text type="secondary">React + Ant Design Pro</Text>
              <br />
              <Text type="secondary">Адаптивный дизайн</Text>
              <br />
              <Text type="secondary">Современный UI/UX</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Функции</Title>
              <Text type="secondary">Управление мероприятиями</Text>
              <br />
              <Text type="secondary">Админ-панель</Text>
              <br />
              <Text type="secondary">Система настроек</Text>
            </div>
          </Col>
        </Row>
      </ProCard>

      <ProCard title="Версия системы" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text strong>Текущая версия:</Text>
            <br />
            <Text type="secondary">0.1.14 (Ant Design Pro Edition)</Text>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>Дата обновления:</Text>
            <br />
            <Text type="secondary">Декабрь 2024</Text>
          </Col>
        </Row>
      </ProCard>
    </div>
  );
};

export default AboutPage;
