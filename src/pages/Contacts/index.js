import React from 'react';
import { Card, Typography, Space, Row, Col, Button, Divider } from 'antd';
import { ContactsOutlined, MailOutlined, PhoneOutlined, MessageOutlined, GithubOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text, Paragraph } = Typography;

const ContactsPage = () => {
  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <ContactsOutlined />
            Контакты
          </Space>
        </Title>
        <Text type="secondary">
          Свяжитесь с нами для получения помощи или решения вопросов
        </Text>
      </ProCard>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <ProCard title="Техническая поддержка" style={{ height: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <MailOutlined style={{ marginRight: '8px', color: '#2d5016' }} />
                <Text strong>Email поддержки</Text>
                <br />
                <Text type="secondary">support@gwars.io</Text>
                <br />
                <Button type="link" size="small">
                  Написать письмо
                </Button>
              </div>
              
              <Divider />
              
              <div>
                <MessageOutlined style={{ marginRight: '8px', color: '#52c41a' }} />
                <Text strong>Telegram</Text>
                <br />
                <Text type="secondary">@gwars_support</Text>
                <br />
                <Button type="link" size="small">
                  Перейти в Telegram
                </Button>
              </div>
            </Space>
          </ProCard>
        </Col>

        <Col xs={24} md={12}>
          <ProCard title="Разработка" style={{ height: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <div>
                <GithubOutlined style={{ marginRight: '8px', color: '#333' }} />
                <Text strong>GitHub репозиторий</Text>
                <br />
                <Text type="secondary">github.com/Kolunt/adm-gw</Text>
                <br />
                <Button type="link" size="small">
                  Открыть репозиторий
                </Button>
              </div>
              
              <Divider />
              
              <div>
                <PhoneOutlined style={{ marginRight: '8px', color: '#faad14' }} />
                <Text strong>Телефон</Text>
                <br />
                <Text type="secondary">+7 (XXX) XXX-XX-XX</Text>
                <br />
                <Text type="secondary" style={{ fontSize: '12px' }}>
                  Рабочие дни: 9:00 - 18:00
                </Text>
              </div>
            </Space>
          </ProCard>
        </Col>
      </Row>

      <ProCard title="Часы работы поддержки" style={{ marginTop: '24px' }}>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Email поддержка</Title>
              <Text type="secondary">24/7</Text>
              <br />
              <Text type="secondary">Ответ в течение 24 часов</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Telegram</Title>
              <Text type="secondary">9:00 - 22:00</Text>
              <br />
              <Text type="secondary">Ответ в течение 2 часов</Text>
            </div>
          </Col>
          <Col xs={24} md={8}>
            <div style={{ textAlign: 'center' }}>
              <Title level={4}>Телефон</Title>
              <Text type="secondary">9:00 - 18:00</Text>
              <br />
              <Text type="secondary">Пн-Пт, рабочие дни</Text>
            </div>
          </Col>
        </Row>
      </ProCard>

      <ProCard title="Часто задаваемые вопросы" style={{ marginTop: '24px' }}>
        <Paragraph>
          Перед обращением в поддержку рекомендуем ознакомиться с разделом 
          <Button type="link" href="/faq">FAQ</Button>, 
          где собраны ответы на самые популярные вопросы.
        </Paragraph>
        <Paragraph>
          Если вы не нашли ответ на свой вопрос, не стесняйтесь обращаться к нам любым удобным способом.
        </Paragraph>
      </ProCard>

      <ProCard title="Сообщество GWars.io" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <Text strong>Официальный сайт:</Text>
            <br />
            <Text type="secondary">gwars.io</Text>
            <br />
            <Button type="link" size="small">
              Перейти на сайт
            </Button>
          </Col>
          <Col xs={24} md={12}>
            <Text strong>Форум сообщества:</Text>
            <br />
            <Text type="secondary">forum.gwars.io</Text>
            <br />
            <Button type="link" size="small">
              Открыть форум
            </Button>
          </Col>
        </Row>
      </ProCard>
    </div>
  );
};

export default ContactsPage;
