import React from 'react';
import { Card, Typography, Space, Collapse, Tag, Divider, Row, Col } from 'antd';
import { BookOutlined, FileTextOutlined, SettingOutlined, TeamOutlined, CalendarOutlined, GiftOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text, Paragraph } = Typography;

const AdminDocumentation = () => {
  const documentationSections = [
    {
      key: '1',
      label: 'Обзор системы',
      children: (
        <div>
          <Paragraph>
            <strong>Система анонимного обмена подарками</strong> - это веб-приложение для организации 
            мероприятий с анонимным обменом подарками между участниками.
          </Paragraph>
          <Paragraph>
            <strong>Основные возможности:</strong>
          </Paragraph>
          <ul>
            <li>Регистрация и управление пользователями</li>
            <li>Создание и управление мероприятиями</li>
            <li>Автоматическое назначение подарков</li>
            <li>Система интересов и пожеланий</li>
            <li>Административная панель</li>
          </ul>
        </div>
      )
    },
    {
      key: '2',
      label: 'Управление пользователями',
      children: (
        <div>
          <Paragraph>
            <strong>Функции управления пользователями:</strong>
          </Paragraph>
          <ul>
            <li>Просмотр списка всех пользователей</li>
            <li>Редактирование профилей пользователей</li>
            <li>Управление ролями (пользователь/администратор)</li>
            <li>Блокировка и разблокировка аккаунтов</li>
            <li>Просмотр статистики активности</li>
          </ul>
          <Divider />
          <Paragraph>
            <Tag color="green">Совет:</Tag> Регулярно проверяйте активность пользователей 
            и удаляйте неактивные аккаунты.
          </Paragraph>
        </div>
      )
    },
    {
      key: '3',
      label: 'Управление мероприятиями',
      children: (
        <div>
          <Paragraph>
            <strong>Создание и управление мероприятиями:</strong>
          </Paragraph>
          <ul>
            <li>Создание новых мероприятий</li>
            <li>Настройка даты и времени проведения</li>
            <li>Управление участниками</li>
            <li>Настройка правил участия</li>
            <li>Автоматическое назначение подарков</li>
          </ul>
          <Divider />
          <Paragraph>
            <Tag color="green">Важно:</Tag> Убедитесь, что все участники зарегистрированы 
            до начала назначения подарков.
          </Paragraph>
        </div>
      )
    },
    {
      key: '4',
      label: 'Система подарков',
      children: (
        <div>
          <Paragraph>
            <strong>Назначение и управление подарками:</strong>
          </Paragraph>
          <ul>
            <li>Автоматическое назначение получателей</li>
            <li>Просмотр назначений подарков</li>
            <li>Ручное переназначение при необходимости</li>
            <li>Отслеживание статуса подарков</li>
            <li>Уведомления участникам</li>
          </ul>
          <Divider />
          <Paragraph>
            <Tag color="orange">Внимание:</Tag> Назначения подарков происходят автоматически 
            и не могут быть изменены после начала мероприятия.
          </Paragraph>
        </div>
      )
    },
    {
      key: '5',
      label: 'Настройки системы',
      children: (
        <div>
          <Paragraph>
            <strong>Конфигурация системы:</strong>
          </Paragraph>
          <ul>
            <li>Настройка цветовой схемы</li>
            <li>Управление системными параметрами</li>
            <li>Настройка уведомлений</li>
            <li>Конфигурация безопасности</li>
            <li>Резервное копирование данных</li>
          </ul>
          <Divider />
          <Paragraph>
            <Tag color="red">Критично:</Tag> Регулярно создавайте резервные копии 
            базы данных и настроек системы.
          </Paragraph>
        </div>
      )
    },
    {
      key: '6',
      label: 'FAQ и поддержка',
      children: (
        <div>
          <Paragraph>
            <strong>Управление часто задаваемыми вопросами:</strong>
          </Paragraph>
          <ul>
            <li>Добавление новых вопросов и ответов</li>
            <li>Редактирование существующих FAQ</li>
            <li>Удаление устаревших вопросов</li>
            <li>Категоризация вопросов</li>
          </ul>
          <Divider />
          <Paragraph>
            <strong>Контактная информация:</strong>
          </Paragraph>
          <ul>
            <li>Email поддержки: support@gwars.io</li>
            <li>Telegram: @gwars_support</li>
            <li>GitHub: github.com/Kolunt/adm-gw</li>
          </ul>
        </div>
      )
    },
    {
      key: '7',
      label: 'Безопасность и права доступа',
      children: (
        <div>
          <Paragraph>
            <strong>Система безопасности:</strong>
          </Paragraph>
          <ul>
            <li>Аутентификация через JWT токены</li>
            <li>Роли пользователей (user/admin)</li>
            <li>Защищенные маршруты</li>
            <li>Валидация входных данных</li>
            <li>Логирование действий администраторов</li>
          </ul>
          <Divider />
          <Paragraph>
            <Tag color="purple">Рекомендация:</Tag> Регулярно меняйте пароли 
            администраторов и следите за активностью.
          </Paragraph>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <BookOutlined />
            Документация системы
          </Space>
        </Title>
        <Text type="secondary">
          Полное руководство по управлению системой анонимного обмена подарками
        </Text>
      </ProCard>

      <ProCard>
        <Collapse
          size="large"
          items={documentationSections.map((section) => ({
            key: section.key,
            label: (
              <Text strong style={{ fontSize: '16px', color: '#ffffff' }}>
                {section.label}
              </Text>
            ),
            children: section.children
          }))}
        />
      </ProCard>

      <ProCard title="Быстрые ссылки" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <TeamOutlined style={{ fontSize: '24px', color: '#2d5016', marginBottom: '8px' }} />
              <div>
                <Text strong>Пользователи</Text>
                <br />
                <Text type="secondary">Управление участниками</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <CalendarOutlined style={{ fontSize: '24px', color: '#52c41a', marginBottom: '8px' }} />
              <div>
                <Text strong>Мероприятия</Text>
                <br />
                <Text type="secondary">Создание событий</Text>
              </div>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card size="small" style={{ textAlign: 'center' }}>
              <GiftOutlined style={{ fontSize: '24px', color: '#faad14', marginBottom: '8px' }} />
              <div>
                <Text strong>Подарки</Text>
                <br />
                <Text type="secondary">Назначения подарков</Text>
              </div>
            </Card>
          </Col>
        </Row>
      </ProCard>
    </div>
  );
};

export default AdminDocumentation;
