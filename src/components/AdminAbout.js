import React, { useState, useEffect } from 'react';
import { Typography, Space, Row, Col, Button, Modal, Form, Input, message, Divider } from 'antd';
import { InfoCircleOutlined, EditOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminAbout = () => {
  const { isDark } = useTheme();
  
  // Общие стили для полей ввода
  const inputStyle = {
    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
  };
  
  const [aboutData, setAboutData] = useState({
    title: 'О системе "Анонимный Дед Мороз"',
    subtitle: 'Информация о системе анонимного обмена подарками',
    description: 'Что это такое?',
    descriptionText: '"Анонимный Дед Мороз" — это веб-система для организации анонимного обмена подарками между участниками сообщества GWars.io. Система позволяет создавать мероприятия, регистрировать участников и автоматически назначать получателей подарков.\n\nГлавная особенность — полная анонимность процесса. Вы не знаете, кто вам дарит подарок, а получатель не знает, кто его подарил.',
    howItWorks: 'Как это работает?',
    step1: 'Регистрация на мероприятие',
    step1Desc: 'Выбираете мероприятие и регистрируетесь',
    step2: 'Указание пожеланий',
    step2Desc: 'Заполняете список желаемых подарков',
    step3: 'Автоматическое назначение',
    step3Desc: 'Система случайно назначает получателя',
    step4: 'Обмен подарками',
    step4Desc: 'Дарите и получаете подарки анонимно',
    techDetails: 'Технические детали',
    backendTitle: 'Backend',
    backendDesc: 'FastAPI (Python)\nSQLite база данных\nJWT аутентификация',
    frontendTitle: 'Frontend',
    frontendDesc: 'React + Ant Design Pro\nАдаптивный дизайн\nСовременный UI/UX',
    functionsTitle: 'Функции',
    functionsDesc: 'Управление мероприятиями\nАдмин-панель\nСистема настроек',
    versionTitle: 'Версия системы',
    currentVersion: '0.1.26',
    versionDesc: 'Ant Design Pro Edition',
    updateDate: 'Декабрь 2024'
  });
  
  const [modalVisible, setModalVisible] = useState(false);
  const [form] = Form.useForm();

  useEffect(() => {
    // В реальном приложении здесь будет загрузка данных с бэкенда
    // Убираем вызов form.setFieldsValue, так как форма не подключена до открытия модального окна
  }, [aboutData, form]);

  const handleEdit = () => {
    setModalVisible(true);
    // Заполняем форму данными при открытии модального окна
    setTimeout(() => {
      form.setFieldsValue(aboutData);
    }, 0);
  };

  const handleSubmit = (values) => {
    setAboutData(values);
    message.success('Информация о системе обновлена');
    setModalVisible(false);
  };

  const handleReset = () => {
    const defaultData = {
      title: 'О системе "Анонимный Дед Мороз"',
      subtitle: 'Информация о системе анонимного обмена подарками',
      description: 'Что это такое?',
      descriptionText: '"Анонимный Дед Мороз" — это веб-система для организации анонимного обмена подарками между участниками сообщества GWars.io. Система позволяет создавать мероприятия, регистрировать участников и автоматически назначать получателей подарков.\n\nГлавная особенность — полная анонимность процесса. Вы не знаете, кто вам дарит подарок, а получатель не знает, кто его подарил.',
      howItWorks: 'Как это работает?',
      step1: 'Регистрация на мероприятие',
      step1Desc: 'Выбираете мероприятие и регистрируетесь',
      step2: 'Указание пожеланий',
      step2Desc: 'Заполняете список желаемых подарков',
      step3: 'Автоматическое назначение',
      step3Desc: 'Система случайно назначает получателя',
      step4: 'Обмен подарками',
      step4Desc: 'Дарите и получаете подарки анонимно',
      techDetails: 'Технические детали',
      backendTitle: 'Backend',
      backendDesc: 'FastAPI (Python)\nSQLite база данных\nJWT аутентификация',
      frontendTitle: 'Frontend',
      frontendDesc: 'React + Ant Design Pro\nАдаптивный дизайн\nСовременный UI/UX',
      functionsTitle: 'Функции',
      functionsDesc: 'Управление мероприятиями\nАдмин-панель\nСистема настроек',
      versionTitle: 'Версия системы',
      currentVersion: '0.1.26',
      versionDesc: 'Ant Design Pro Edition',
      updateDate: 'Декабрь 2024'
    };
    setAboutData(defaultData);
    form.setFieldsValue(defaultData);
    message.success('Информация сброшена к значениям по умолчанию');
  };

  return (
    <div style={{ 
      padding: '24px',
      backgroundColor: isDark ? '#141414' : '#ffffff',
      minHeight: '100vh'
    }}>
      <ProCard 
        style={{ 
          marginBottom: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #303030' : '1px solid #d9d9d9'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title 
              level={2}
              style={{ color: isDark ? '#ffffff' : '#000000' }}
            >
              <Space>
                <InfoCircleOutlined />
                Управление информацией о системе
              </Space>
            </Title>
            <Text 
              type="secondary"
              style={{ color: isDark ? '#a6a6a6' : '#666666' }}
            >
              Редактирование контента страницы "О системе"
            </Text>
          </div>
          <Space>
            <Button
              type="default"
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              Сбросить
            </Button>
            <Button
              type="primary"
              icon={<EditOutlined />}
              onClick={handleEdit}
            >
              Редактировать
            </Button>
          </Space>
        </div>
      </ProCard>

      {/* Предварительный просмотр */}
      <ProCard 
        title={
          <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
            Предварительный просмотр
          </span>
        }
        style={{ 
          marginBottom: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #303030' : '1px solid #d9d9d9'
        }}
      >
        <div style={{ 
          padding: '24px', 
          background: isDark ? '#2f2f2f' : '#f5f5f5', 
          borderRadius: '8px' 
        }}>
          <Title 
            level={2}
            style={{ color: isDark ? '#ffffff' : '#000000' }}
          >
            {aboutData.title}
          </Title>
          <Text 
            type="secondary"
            style={{ color: isDark ? '#a6a6a6' : '#666666' }}
          >
            {aboutData.subtitle}
          </Text>
          
          <Divider />
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <ProCard 
                title={
                  <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                    {aboutData.description}
                  </span>
                }
                style={{ 
                  height: '100%',
                  backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                  border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                }}
              >
                <Paragraph style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  {aboutData.descriptionText.split('\n').map((line, index) => (
                    <span key={index}>
                      {line}
                      {index < aboutData.descriptionText.split('\n').length - 1 && <br />}
                    </span>
                  ))}
                </Paragraph>
              </ProCard>
            </Col>

            <Col xs={24} md={12}>
              <ProCard 
                title={
                  <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                    {aboutData.howItWorks}
                  </span>
                }
                style={{ 
                  height: '100%',
                  backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
                  border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
                }}
              >
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                      1. {aboutData.step1}
                    </Text>
                    <br />
                    <Text 
                      type="secondary"
                      style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                    >
                      {aboutData.step1Desc}
                    </Text>
                  </div>
                  <div>
                    <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                      2. {aboutData.step2}
                    </Text>
                    <br />
                    <Text 
                      type="secondary"
                      style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                    >
                      {aboutData.step2Desc}
                    </Text>
                  </div>
                  <div>
                    <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                      3. {aboutData.step3}
                    </Text>
                    <br />
                    <Text 
                      type="secondary"
                      style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                    >
                      {aboutData.step3Desc}
                    </Text>
                  </div>
                  <div>
                    <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                      4. {aboutData.step4}
                    </Text>
                    <br />
                    <Text 
                      type="secondary"
                      style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                    >
                      {aboutData.step4Desc}
                    </Text>
                  </div>
                </Space>
              </ProCard>
            </Col>
          </Row>

          <ProCard 
            title={
              <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                {aboutData.techDetails}
              </span>
            }
            style={{ 
              marginTop: '24px',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title 
                    level={4}
                    style={{ color: isDark ? '#ffffff' : '#000000' }}
                  >
                    {aboutData.backendTitle}
                  </Title>
                  <Text 
                    type="secondary"
                    style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                  >
                    {aboutData.backendDesc.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < aboutData.backendDesc.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title 
                    level={4}
                    style={{ color: isDark ? '#ffffff' : '#000000' }}
                  >
                    {aboutData.frontendTitle}
                  </Title>
                  <Text 
                    type="secondary"
                    style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                  >
                    {aboutData.frontendDesc.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < aboutData.frontendDesc.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </Text>
                </div>
              </Col>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title 
                    level={4}
                    style={{ color: isDark ? '#ffffff' : '#000000' }}
                  >
                    {aboutData.functionsTitle}
                  </Title>
                  <Text 
                    type="secondary"
                    style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                  >
                    {aboutData.functionsDesc.split('\n').map((line, index) => (
                      <span key={index}>
                        {line}
                        {index < aboutData.functionsDesc.split('\n').length - 1 && <br />}
                      </span>
                    ))}
                  </Text>
                </div>
              </Col>
            </Row>
          </ProCard>

          <ProCard 
            title={
              <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
                {aboutData.versionTitle}
              </span>
            }
            style={{ 
              marginTop: '24px',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  Текущая версия:
                </Text>
                <br />
                <Text 
                  type="secondary"
                  style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                >
                  {aboutData.currentVersion} ({aboutData.versionDesc})
                </Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>
                  Дата обновления:
                </Text>
                <br />
                <Text 
                  type="secondary"
                  style={{ color: isDark ? '#a6a6a6' : '#666666' }}
                >
                  {aboutData.updateDate}
                </Text>
              </Col>
            </Row>
          </ProCard>
        </div>
      </ProCard>

      {/* Модальное окно редактирования */}
      <Modal
        title={
          <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
            Редактировать информацию о системе
          </span>
        }
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
        styles={{
          body: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            color: isDark ? '#ffffff' : '#000000'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item 
                name="title" 
                label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Заголовок страницы</span>} 
                rules={[{ required: true, message: 'Введите заголовок' }]}
              >
                <Input style={inputStyle} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item 
                name="subtitle" 
                label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Подзаголовок</span>} 
                rules={[{ required: true, message: 'Введите подзаголовок' }]}
              >
                <Input style={inputStyle} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ color: isDark ? '#ffffff' : '#000000' }}>
            Описание системы
          </Divider>
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item 
                name="description" 
                label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Заголовок описания</span>} 
                rules={[{ required: true, message: 'Введите заголовок описания' }]}
              >
                <Input style={inputStyle} />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item 
                name="descriptionText" 
                label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Текст описания</span>} 
                rules={[{ required: true, message: 'Введите текст описания' }]}
              >
                <TextArea rows={6} style={inputStyle} />
              </Form.Item>
            </Col>
          </Row>

          <Divider style={{ color: isDark ? '#ffffff' : '#000000' }}>
            Как это работает
          </Divider>
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="howItWorks" label="Заголовок раздела" rules={[{ required: true, message: 'Введите заголовок' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="step1" label="Шаг 1" rules={[{ required: true, message: 'Введите шаг 1' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="step1Desc" label="Описание шага 1" rules={[{ required: true, message: 'Введите описание' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="step2" label="Шаг 2" rules={[{ required: true, message: 'Введите шаг 2' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="step2Desc" label="Описание шага 2" rules={[{ required: true, message: 'Введите описание' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="step3" label="Шаг 3" rules={[{ required: true, message: 'Введите шаг 3' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="step3Desc" label="Описание шага 3" rules={[{ required: true, message: 'Введите описание' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="step4" label="Шаг 4" rules={[{ required: true, message: 'Введите шаг 4' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item name="step4Desc" label="Описание шага 4" rules={[{ required: true, message: 'Введите описание' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Технические детали</Divider>
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="techDetails" label="Заголовок технических деталей" rules={[{ required: true, message: 'Введите заголовок' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="backendTitle" label="Backend заголовок" rules={[{ required: true, message: 'Введите заголовок' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="backendDesc" label="Backend описание" rules={[{ required: true, message: 'Введите описание' }]}>
                <TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="frontendTitle" label="Frontend заголовок" rules={[{ required: true, message: 'Введите заголовок' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="frontendDesc" label="Frontend описание" rules={[{ required: true, message: 'Введите описание' }]}>
                <TextArea rows={3} />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="functionsTitle" label="Функции заголовок" rules={[{ required: true, message: 'Введите заголовок' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={16}>
              <Form.Item name="functionsDesc" label="Функции описание" rules={[{ required: true, message: 'Введите описание' }]}>
                <TextArea rows={3} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Версия системы</Divider>
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="versionTitle" label="Заголовок версии" rules={[{ required: true, message: 'Введите заголовок' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="currentVersion" label="Текущая версия" rules={[{ required: true, message: 'Введите версию' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="versionDesc" label="Описание версии" rules={[{ required: true, message: 'Введите описание' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={8}>
              <Form.Item name="updateDate" label="Дата обновления" rules={[{ required: true, message: 'Введите дату' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginTop: '24px' }}>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Сохранить
              </Button>
              <Button onClick={() => setModalVisible(false)}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminAbout;
