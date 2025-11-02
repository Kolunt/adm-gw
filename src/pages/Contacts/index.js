import React from 'react';
import { Card, Typography, Space, Row, Col, Button, Divider } from 'antd';
import { ContactsOutlined, MailOutlined, PhoneOutlined, MessageOutlined, GithubOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useTheme } from '../../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;

const ContactsPage = () => {
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
            <ContactsOutlined />
            Контакты
          </Space>
        </Title>
        <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
          Свяжитесь с нами для получения помощи или решения вопросов
        </Text>
      </ProCard>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <ProCard 
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Техническая поддержка</span>} 
            style={{ 
              height: '100%',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <MailOutlined style={{ marginRight: '8px', color: isDark ? '#52c41a' : '#2d5016' }} />
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Email поддержки</Text>
                <br />
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>support@gwars.io</Text>
                <br />
                <Button type="link" size="small" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
                  Написать письмо
                </Button>
              </div>
              
              <Divider style={{ borderColor: isDark ? '#404040' : '#f0f0f0' }} />
              
              <div>
                <MessageOutlined style={{ marginRight: '8px', color: isDark ? '#52c41a' : '#52c41a' }} />
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Telegram</Text>
                <br />
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>@gwars_support</Text>
                <br />
                <Button type="link" size="small" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
                  Перейти в Telegram
                </Button>
              </div>
            </Space>
          </ProCard>
        </Col>

        <Col xs={24} md={12}>
          <ProCard 
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Разработка</span>} 
            style={{ 
              height: '100%',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <GithubOutlined style={{ marginRight: '8px', color: isDark ? '#ffffff' : '#333' }} />
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>GitHub репозиторий</Text>
                <br />
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>github.com/Kolunt/adm-gw</Text>
                <br />
                <Button type="link" size="small" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
                  Открыть репозиторий
                </Button>
              </div>
              
              <Divider style={{ borderColor: isDark ? '#404040' : '#f0f0f0' }} />
              
              <div>
                <PhoneOutlined style={{ marginRight: '8px', color: isDark ? '#faad14' : '#faad14' }} />
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Телефон</Text>
                <br />
                <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>+7 (XXX) XXX-XX-XX</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px', color: isDark ? '#8c8c8c' : '#8c8c8c' }}>
                  Рабочие дни: 9:00 - 18:00
                </Text>
              </div>
            </Space>
          </ProCard>
        </Col>
      </Row>

      <ProCard 
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Часы работы поддержки</span>} 
        style={{ 
          marginTop: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Email поддержка</Title>
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>24/7</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Ответ в течение 24 часов</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Telegram</Title>
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>9:00 - 22:00</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Ответ в течение 2 часов</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4} style={{ color: isDark ? '#ffffff' : '#000000' }}>Телефон</Title>
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>9:00 - 18:00</Text>
              <br />
              <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>Пн-Пт, рабочие дни</Text>
            </div>
          </Col>
        </Row>
      </ProCard>

      <ProCard 
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Часто задаваемые вопросы</span>} 
        style={{ 
          marginTop: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Paragraph style={{ color: isDark ? '#ffffff' : '#000000' }}>
          Перед обращением в поддержку рекомендуем ознакомиться с разделом 
          <Button type="link" href="/faq" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>FAQ</Button>, 
          где собраны ответы на самые популярные вопросы.
        </Paragraph>
        <Paragraph style={{ color: isDark ? '#ffffff' : '#000000' }}>
          Если вы не нашли ответ на свой вопрос, не стесняйтесь обращаться к нам любым удобным способом.
        </Paragraph>
      </ProCard>

      <ProCard 
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Сообщество GWars.io</span>} 
        style={{ 
          marginTop: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Официальный сайт:</Text>
            <br />
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>gwars.io</Text>
            <br />
            <Button type="link" size="small" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
              Перейти на сайт
            </Button>
          </Col>
          <Col xs={24} md={12}>
            <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>Форум сообщества:</Text>
            <br />
            <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>forum.gwars.io</Text>
            <br />
            <Button type="link" size="small" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
              Открыть форум
            </Button>
          </Col>
        </Row>
      </ProCard>
    </div>
  );
};

export default ContactsPage;
