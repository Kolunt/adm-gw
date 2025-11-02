import React from 'react';
import { Card, Typography, Space, Row, Col, Divider } from 'antd';
import { InfoCircleOutlined, GiftOutlined, TeamOutlined, CalendarOutlined, HeartOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;

const AboutPage = () => {
  const { isDark } = useTheme();
  
  return (
    <div className={isDark ? 'dark-theme' : 'light-theme'} style={{ padding: '24px' }}>
      <ProCard style={{ 
        marginBottom: '24px',
        backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
        border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
      }}>
        <Title level={2} style={{ color: isDark ? '#ffffff' : '#000000' }}>
          <Space>
            <InfoCircleOutlined />
            О системе "Анонимный Дед Мороз"
          </Space>
        </Title>
        <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
          Информация о системе анонимного обмена подарками
        </Text>
      </ProCard>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <ProCard 
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Что это такое?</span>} 
            style={{ 
              height: '100%',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Paragraph style={{ color: isDark ? '#ffffff' : '#000000' }}>
              "Анонимный Дед Мороз" — это веб-система для организации анонимного обмена подарками 
              между участниками сообщества GWars.io. Система позволяет создавать мероприятия, 
              регистрировать участников и автоматически назначать получателей подарков.
            </Paragraph>
            <Paragraph style={{ color: isDark ? '#ffffff' : '#000000' }}>
              Главная особенность — полная анонимность процесса. Вы не знаете, кто вам дарит подарок, 
              а получатель не знает, кто его подарил.
            </Paragraph>
          </ProCard>
        </Col>

        <Col xs={24} md={12}>
          <ProCard 
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Как это работает?</span>} 
            style={{ 
              height: '100%',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <CalendarOutlined style={{ marginRight: '8px', color: isDark ? '#52c41a' : '#2d5016' }} />
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>1. Регистрация на мероприятие</Text>
                <br />
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Выбираете мероприятие и регистрируетесь</Text>
              </div>
              <div>
                <GiftOutlined style={{ marginRight: '8px', color: isDark ? '#52c41a' : '#52c41a' }} />
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>2. Указание пожеланий</Text>
                <br />
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Заполняете список желаемых подарков</Text>
              </div>
              <div>
                <TeamOutlined style={{ marginRight: '8px', color: isDark ? '#faad14' : '#faad14' }} />
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>3. Автоматическое назначение</Text>
                <br />
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Система случайно назначает получателя</Text>
              </div>
              <div>
                <HeartOutlined style={{ marginRight: '8px', color: isDark ? '#f5222d' : '#f5222d' }} />
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>4. Обмен подарками</Text>
                <br />
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Дарите и получаете подарки анонимно</Text>
              </div>
            </Space>
          </ProCard>
        </Col>
      </Row>

      <ProCard 
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Технические детали</span>} 
        style={{ 
          marginTop: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Backend</Title>
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>FastAPI (Python)</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>SQLite база данных</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>JWT аутентификация</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Frontend</Title>
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>React + Ant Design Pro</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Адаптивный дизайн</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Современный UI/UX</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Функции</Title>
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Управление мероприятиями</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Админ-панель</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Система настроек</Text>
            </div>
          </Col>
        </Row>
      </ProCard>

      <ProCard 
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Версия системы</span>} 
        style={{ 
          marginTop: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Текущая версия:</Text>
            <br />
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>0.1.14 (Ant Design Pro Edition)</Text>
          </Col>
          <Col xs={24} md={12}>
            <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Дата обновления:</Text>
            <br />
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Декабрь 2024</Text>
          </Col>
        </Row>
      </ProCard>
    </div>
  );
};

export default AboutPage;
