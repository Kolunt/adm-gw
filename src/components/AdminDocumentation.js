import React from 'react';
import { Card, Typography, Divider, Space, Alert, Steps, Tag, List } from 'antd';
import { 
  BookOutlined, 
  SettingOutlined, 
  DatabaseOutlined, 
  RobotOutlined, 
  GlobalOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  InfoCircleOutlined,
  WarningOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const AdminDocumentation = () => {
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

          {/* Обзор системы */}
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
          </Card>

          {/* Настройка системы */}
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
                  title: 'Настройка Telegram бота',
                  description: (
                    <div>
                      <Paragraph>
                        Для отправки уведомлений пользователям:
                      </Paragraph>
                      <List
                        size="small"
                        dataSource={[
                          'Создайте бота через @BotFather в Telegram',
                          'Получите токен бота',
                          'Введите токен в настройках Telegram',
                          'Активируйте бота для отправки уведомлений'
                        ]}
                        renderItem={item => <List.Item>{item}</List.Item>}
                      />
                    </div>
                  ),
                  icon: <RobotOutlined />
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

          {/* Управление пользователями */}
          <Card title={<><SettingOutlined /> Управление пользователями</>} size="small">
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

          {/* Управление мероприятиями */}
          <Card title={<><SettingOutlined /> Управление мероприятиями</>} size="small">
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

          {/* FAQ и интересы */}
          <Card title={<><SettingOutlined /> FAQ и интересы</>} size="small">
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
          </Card>

          {/* Техническая информация */}
          <Card title={<><SettingOutlined /> Техническая информация</>} size="small">
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
                'Backend: http://localhost:8006',
                'Frontend: http://localhost:3000',
                'API документация: http://localhost:8006/docs'
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
          </Card>

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
