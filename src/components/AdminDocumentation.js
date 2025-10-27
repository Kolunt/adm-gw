import React, { useState } from 'react';
import { Card, Typography, Divider, Space, Alert, Steps, Tag, List, Collapse, Button, Tabs } from 'antd';
import { 
  BookOutlined, 
  SettingOutlined, 
  DatabaseOutlined, 
  RobotOutlined, 
  GlobalOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  UserOutlined,
  CalendarOutlined,
  QuestionCircleOutlined,
  HeartOutlined,
  CodeOutlined,
  CopyOutlined,
  LinkOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;
const { Panel } = Collapse;

const AdminDocumentation = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
  };

  const telegramBotSteps = [
    {
      title: 'Создание бота',
      content: (
        <div>
          <Paragraph>
            <strong>1. Откройте Telegram и найдите @BotFather</strong>
          </Paragraph>
          <Paragraph>
            <strong>2. Отправьте команду:</strong>
            <Text code>/newbot</Text>
          </Paragraph>
          <Paragraph>
            <strong>3. Введите имя бота:</strong> (например: "Анонимный Дед Мороз")
          </Paragraph>
          <Paragraph>
            <strong>4. Введите username бота:</strong> (например: "anonymous_santa_bot")
          </Paragraph>
          <Paragraph>
            <strong>5. Получите токен бота</strong> - он будет выглядеть примерно так:
          </Paragraph>
          <Alert
            message="Пример токена:"
            description="1234567890:ABCdefGHIjklMNOpqrsTUVwxyz"
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        </div>
      )
    },
    {
      title: 'Настройка команд бота',
      content: (
        <div>
          <Paragraph>
            <strong>Настройте команды бота для удобства пользователей:</strong>
          </Paragraph>
          <List
            size="small"
            dataSource={[
              '/start - Начать работу с ботом',
              '/help - Получить помощь',
              '/profile - Просмотреть профиль',
              '/events - Список мероприятий',
              '/notifications - Настройки уведомлений'
            ]}
            renderItem={item => <List.Item><Text code>{item}</Text></List.Item>}
          />
          <Paragraph>
            <strong>Для настройки команд отправьте @BotFather:</strong>
          </Paragraph>
          <Text code>/setcommands</Text>
          <Paragraph>
            Затем выберите вашего бота и отправьте список команд в формате:
          </Paragraph>
          <Text code>
            start - Начать работу с ботом{'\n'}
            help - Получить помощь{'\n'}
            profile - Просмотреть профиль{'\n'}
            events - Список мероприятий{'\n'}
            notifications - Настройки уведомлений
          </Text>
        </div>
      )
    },
    {
      title: 'Настройка в системе',
      content: (
        <div>
          <Paragraph>
            <strong>1. Перейдите в раздел "Настройки" → "Telegram"</strong>
          </Paragraph>
          <Paragraph>
            <strong>2. Введите токен бота</strong> в поле "Токен бота"
          </Paragraph>
          <Paragraph>
            <strong>3. Нажмите "Проверить токен"</strong> для валидации
          </Paragraph>
          <Paragraph>
            <strong>4. Включите бота</strong> переключателем "Активен"
          </Paragraph>
          <Alert
            message="Важно!"
            description="После активации бота пользователи смогут подписаться на уведомления о мероприятиях"
            type="warning"
            showIcon
            style={{ marginTop: 8 }}
          />
        </div>
      )
    },
    {
      title: 'Подписка пользователей',
      content: (
        <div>
          <Paragraph>
            <strong>Как пользователи подписываются на уведомления:</strong>
          </Paragraph>
          <Steps
            direction="vertical"
            size="small"
            items={[
              {
                title: 'Пользователь находит бота',
                description: 'По username или ссылке, которую вы предоставите'
              },
              {
                title: 'Отправляет /start',
                description: 'Бот приветствует пользователя'
              },
              {
                title: 'Вводит свой email',
                description: 'Тот же email, который использовался при регистрации в системе'
              },
              {
                title: 'Подтверждает подписку',
                description: 'Система связывает Telegram аккаунт с профилем пользователя'
              }
            ]}
          />
          <Alert
            message="Совет!"
            description="Разместите ссылку на бота в FAQ или на главной странице для удобства пользователей"
            type="info"
            showIcon
            style={{ marginTop: 8 }}
          />
        </div>
      )
    },
    {
      title: 'Типы уведомлений',
      content: (
        <div>
          <Paragraph>
            <strong>Система автоматически отправляет уведомления о:</strong>
          </Paragraph>
          <List
            size="small"
            dataSource={[
              'Начале предварительной регистрации на мероприятие',
              'Начале основной регистрации',
              'Окончании регистрации',
              'Напоминания о необходимости подтвердить участие',
              'Изменениях в мероприятиях',
              'Новых сообщениях от администратора'
            ]}
            renderItem={item => <List.Item><CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />{item}</List.Item>}
          />
          <Divider />
          <Paragraph>
            <strong>Примеры сообщений:</strong>
          </Paragraph>
          <Card size="small" style={{ backgroundColor: '#f6ffed', border: '1px solid #b7eb8f' }}>
            <Paragraph>
              <strong>🎅 Новое мероприятие!</strong>{'\n'}
              Началась предварительная регистрация на "Анонимный Дед Мороз 2024"{'\n'}
              <Text type="secondary">Перейдите в систему для регистрации</Text>
            </Paragraph>
          </Card>
        </div>
      )
    }
  ];

  const tabItems = [
    {
      key: 'overview',
      label: 'Обзор системы',
      children: (
        <div>
          <Card title={<><GlobalOutlined /> Обзор системы</>} size="small">
            <Paragraph>
              <strong>Анонимный Дед Мороз</strong> — это система для организации обмена подарками между пользователями. 
              Система позволяет администраторам создавать мероприятия, а пользователям регистрироваться на них.
            </Paragraph>
            
            <Title level={4}>Основные компоненты:</Title>
            <List
              size="small"
              dataSource={[
                'FastAPI Backend (Python) - серверная часть',
                'React Frontend - пользовательский интерфейс', 
                'SQLite Database - хранение данных',
                'Telegram Bot - уведомления пользователей',
                'Dadata.ru API - автодополнение адресов'
              ]}
              renderItem={item => <List.Item>{item}</List.Item>}
            />

            <Divider />

            <Title level={4}>Роли пользователей:</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <Tag color="blue" icon={<SettingOutlined />}>
                <strong>Администратор</strong> - полный доступ ко всем функциям системы
              </Tag>
              <Tag color="green" icon={<CheckCircleOutlined />}>
                <strong>Пользователь</strong> - может регистрироваться на мероприятия и заполнять профиль
              </Tag>
            </Space>
          </Card>
        </div>
      )
    },
    {
      key: 'telegram',
      label: 'Telegram Bot',
      children: (
        <div>
          <Card title={<><RobotOutlined /> Настройка Telegram бота</>} size="small">
            <Alert
              message="Полное руководство по настройке Telegram бота"
              description="Следуйте пошаговой инструкции для настройки уведомлений пользователей"
              type="info"
              showIcon
              icon={<InfoCircleOutlined />}
            />

            <Collapse>
              {telegramBotSteps.map((step, index) => (
                <Panel header={`${index + 1}. ${step.title}`} key={index}>
                  {step.content}
                </Panel>
              ))}
            </Collapse>

            <Divider />

            <Title level={4}>Полезные ссылки:</Title>
            <List
              size="small"
              dataSource={[
                'Telegram Bot API: https://core.telegram.org/bots/api',
                'BotFather: https://t.me/BotFather',
                'Документация по ботам: https://core.telegram.org/bots'
              ]}
              renderItem={item => (
                <List.Item>
                  <LinkOutlined style={{ marginRight: 8 }} />
                  <a href={item.split(': ')[1]} target="_blank" rel="noopener noreferrer">
                    {item}
                  </a>
                </List.Item>
              )}
            />
          </Card>
        </div>
      )
    },
    {
      key: 'settings',
      label: 'Настройки системы',
      children: (
        <div>
          <Card title={<><SettingOutlined /> Настройка системы</>} size="small">
            <Steps
              direction="vertical"
              size="small"
              items={[
                {
                  title: 'Общие настройки',
                  description: (
                    <div>
                      <Paragraph>
                        Настройте основную информацию о сайте:
                      </Paragraph>
                      <List
                        size="small"
                        dataSource={[
                          'Название сайта - отображается в заголовке',
                          'Описание сайта - краткое описание проекта',
                          'Заголовок приветствия - текст на главной странице',
                          'Подзаголовок приветствия - дополнительная информация'
                        ]}
                        renderItem={item => <List.Item>{item}</List.Item>}
                      />
                    </div>
                  ),
                  icon: <GlobalOutlined />
                },
                {
                  title: 'Настройка Dadata.ru',
                  description: (
                    <div>
                      <Paragraph>
                        Для автодополнения адресов пользователей:
                      </Paragraph>
                      <List
                        size="small"
                        dataSource={[
                          'Получите API токен на сайте dadata.ru',
                          'Включите автодополнение в настройках',
                          'Введите токен и проверьте его валидность'
                        ]}
                        renderItem={item => <List.Item>{item}</List.Item>}
                      />
                      <Alert
                        message="Важно!"
                        description="Токен Dadata.ru необходим для корректной работы автодополнения адресов"
                        type="warning"
                        showIcon
                        style={{ marginTop: 8 }}
                      />
                    </div>
                  ),
                  icon: <DatabaseOutlined />
                },
                {
                  title: 'Настройка иконки сайта',
                  description: (
                    <div>
                      <Paragraph>
                        Для персонализации сайта:
                      </Paragraph>
                      <List
                        size="small"
                        dataSource={[
                          'Загрузите изображение иконки (рекомендуется 32x32px)',
                          'Поддерживаемые форматы: PNG, JPG, ICO',
                          'Иконка будет отображаться во вкладке браузера'
                        ]}
                        renderItem={item => <List.Item>{item}</List.Item>}
                      />
                    </div>
                  ),
                  icon: <PictureOutlined />
                }
              ]}
            />
          </Card>
        </div>
      )
    },
    {
      key: 'users',
      label: 'Управление пользователями',
      children: (
        <div>
          <Card title={<><UserOutlined /> Управление пользователями</>} size="small">
            <Title level={4}>Процесс регистрации пользователей:</Title>
            <Steps
              direction="vertical"
              size="small"
              items={[
                {
                  title: 'Регистрация',
                  description: 'Пользователь вводит email и пароль для создания аккаунта',
                  icon: <CheckCircleOutlined />
                },
                {
                  title: 'Верификация GWars.io',
                  description: 'Пользователь подтверждает свой профиль в игре GWars.io',
                  icon: <CheckCircleOutlined />
                },
                {
                  title: 'Заполнение профиля',
                  description: 'Пользователь указывает ФИО, адрес и интересы',
                  icon: <CheckCircleOutlined />
                },
                {
                  title: 'Дополнительные контакты',
                  description: 'Опционально: телефон и Telegram никнейм',
                  icon: <CheckCircleOutlined />
                }
              ]}
            />

            <Divider />

            <Title level={4}>Верификация GWars.io:</Title>
            <Alert
              message="Процесс верификации"
              description="Пользователь должен разместить специальный токен в поле 'Информация' своего профиля GWars.io для подтверждения личности"
              type="info"
              showIcon
            />
          </Card>
        </div>
      )
    },
    {
      key: 'events',
      label: 'Управление мероприятиями',
      children: (
        <div>
          <Card title={<><CalendarOutlined /> Управление мероприятиями</>} size="small">
            <Title level={4}>Создание мероприятия:</Title>
            <List
              size="small"
              dataSource={[
                'Название мероприятия - отображается пользователям',
                'Описание - дополнительная информация о мероприятии',
                'Дата начала предварительной регистрации - когда пользователи могут предварительно зарегистрироваться',
                'Дата начала основной регистрации - когда начинается основная регистрация',
                'Дата окончания регистрации - когда регистрация закрывается'
              ]}
              renderItem={item => <List.Item>{item}</List.Item>}
            />

            <Divider />

            <Title level={4}>Этапы мероприятия:</Title>
            <Steps
              direction="vertical"
              size="small"
              items={[
                {
                  title: 'Предварительная регистрация',
                  description: 'Пользователи могут предварительно зарегистрироваться на мероприятие',
                  status: 'process'
                },
                {
                  title: 'Основная регистрация',
                  description: 'Пользователи подтверждают участие и указывают адрес для получения подарка',
                  status: 'process'
                },
                {
                  title: 'Завершение',
                  description: 'Регистрация закрыта, начинается процесс обмена подарками',
                  status: 'finish'
                }
              ]}
            />
          </Card>
        </div>
      )
    },
    {
      key: 'content',
      label: 'Контент и FAQ',
      children: (
        <div>
          <Card title={<><QuestionCircleOutlined /> FAQ и интересы</>} size="small">
            <Title level={4}>Управление FAQ:</Title>
            <Paragraph>
              Создавайте и редактируйте часто задаваемые вопросы для помощи пользователям.
              FAQ отображается в отдельном разделе для всех пользователей.
            </Paragraph>

            <Title level={4}>Управление интересами:</Title>
            <Paragraph>
              Создавайте категории интересов, которые пользователи могут выбирать при заполнении профиля.
              Это поможет лучше подбирать подарки между участниками.
            </Paragraph>

            <Alert
              message="Совет!"
              description="Добавьте популярные категории интересов: книги, фильмы, спорт, технологии, рукоделие и т.д."
              type="info"
              showIcon
            />
          </Card>
        </div>
      )
    },
    {
      key: 'technical',
      label: 'Техническая информация',
      children: (
        <div>
          <Card title={<><CodeOutlined /> Техническая информация</>} size="small">
            <Title level={4}>Системные требования:</Title>
            <List
              size="small"
              dataSource={[
                'Python 3.8+ для backend',
                'Node.js 16+ для frontend',
                'SQLite для базы данных',
                'Доступ к интернету для внешних API'
              ]}
              renderItem={item => <List.Item>{item}</List.Item>}
            />

            <Divider />

            <Title level={4}>Порты по умолчанию:</Title>
            <List
              size="small"
              dataSource={[
                'Backend: http://localhost:8004',
                'Frontend: http://localhost:3000',
                'API документация: http://localhost:8004/docs'
              ]}
              renderItem={item => <List.Item><Text code>{item}</Text></List.Item>}
            />

            <Divider />

            <Title level={4}>Полезные ссылки:</Title>
            <List
              size="small"
              dataSource={[
                'Dadata.ru API: https://dadata.ru/api/',
                'Telegram Bot API: https://core.telegram.org/bots/api',
                'FastAPI документация: https://fastapi.tiangolo.com/',
                'React документация: https://reactjs.org/docs/'
              ]}
              renderItem={item => <List.Item><a href={item.split(': ')[1]} target="_blank" rel="noopener noreferrer">{item}</a></List.Item>}
            />

            <Divider />

            <Title level={4}>Структура проекта:</Title>
            <List
              size="small"
              dataSource={[
                'backend/ - Python FastAPI сервер',
                'src/ - React frontend приложение',
                'public/ - Статические файлы',
                'package.json - Зависимости frontend',
                'requirements.txt - Зависимости backend'
              ]}
              renderItem={item => <List.Item><Text code>{item}</Text></List.Item>}
            />
          </Card>
        </div>
      )
    }
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Card>
        <Space direction="vertical" size="large" style={{ width: '100%' }}>
          <div>
            <Title level={2}>
              <BookOutlined /> Документация по настройке проекта
            </Title>
            <Paragraph type="secondary">
              Полное руководство по настройке и использованию системы "Анонимный Дед Мороз"
            </Paragraph>
          </div>

          <Alert
            message="Добро пожаловать в систему управления!"
            description="Эта документация поможет вам настроить и эффективно использовать все возможности системы."
            type="info"
            showIcon
            icon={<InfoCircleOutlined />}
          />

          <Tabs
            activeKey={activeTab}
            onChange={setActiveTab}
            items={tabItems}
            size="large"
          />

          {/* Поддержка */}
          <Card title={<><InfoCircleOutlined /> Поддержка</>} size="small">
            <Alert
              message="Нужна помощь?"
              description="Если у вас возникли вопросы по настройке или использованию системы, обратитесь к разработчику или изучите логи системы для диагностики проблем."
              type="info"
              showIcon
            />
          </Card>
        </Space>
      </Card>
    </div>
  );
};

export default AdminDocumentation;
