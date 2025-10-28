import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Row, Col, Button, Modal, Form, Input, message, Divider } from 'antd';
import { InfoCircleOutlined, EditOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminAbout = () => {
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
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>
              <Space>
                <InfoCircleOutlined />
                Управление информацией о системе
              </Space>
            </Title>
            <Text type="secondary">
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
      <ProCard title="Предварительный просмотр" style={{ marginBottom: '24px' }}>
        <div style={{ padding: '24px', background: '#f5f5f5', borderRadius: '8px' }}>
          <Title level={2}>{aboutData.title}</Title>
          <Text type="secondary">{aboutData.subtitle}</Text>
          
          <Divider />
          
          <Row gutter={[24, 24]}>
            <Col xs={24} md={12}>
              <ProCard title={aboutData.description} style={{ height: '100%' }}>
                <Paragraph>
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
              <ProCard title={aboutData.howItWorks} style={{ height: '100%' }}>
                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                  <div>
                    <Text strong>1. {aboutData.step1}</Text>
                    <br />
                    <Text type="secondary">{aboutData.step1Desc}</Text>
                  </div>
                  <div>
                    <Text strong>2. {aboutData.step2}</Text>
                    <br />
                    <Text type="secondary">{aboutData.step2Desc}</Text>
                  </div>
                  <div>
                    <Text strong>3. {aboutData.step3}</Text>
                    <br />
                    <Text type="secondary">{aboutData.step3Desc}</Text>
                  </div>
                  <div>
                    <Text strong>4. {aboutData.step4}</Text>
                    <br />
                    <Text type="secondary">{aboutData.step4Desc}</Text>
                  </div>
                </Space>
              </ProCard>
            </Col>
          </Row>

          <ProCard title={aboutData.techDetails} style={{ marginTop: '24px' }}>
            <Row gutter={[24, 24]}>
              <Col xs={24} md={8}>
                <div style={{ textAlign: 'center' }}>
                  <Title level={4}>{aboutData.backendTitle}</Title>
                  <Text type="secondary">
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
                  <Title level={4}>{aboutData.frontendTitle}</Title>
                  <Text type="secondary">
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
                  <Title level={4}>{aboutData.functionsTitle}</Title>
                  <Text type="secondary">
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

          <ProCard title={aboutData.versionTitle} style={{ marginTop: '24px' }}>
            <Row gutter={[16, 16]}>
              <Col xs={24} md={12}>
                <Text strong>Текущая версия:</Text>
                <br />
                <Text type="secondary">{aboutData.currentVersion} ({aboutData.versionDesc})</Text>
              </Col>
              <Col xs={24} md={12}>
                <Text strong>Дата обновления:</Text>
                <br />
                <Text type="secondary">{aboutData.updateDate}</Text>
              </Col>
            </Row>
          </ProCard>
        </div>
      </ProCard>

      {/* Модальное окно редактирования */}
      <Modal
        title="Редактировать информацию о системе"
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={800}
        style={{ top: 20 }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="title" label="Заголовок страницы" rules={[{ required: true, message: 'Введите заголовок' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="subtitle" label="Подзаголовок" rules={[{ required: true, message: 'Введите подзаголовок' }]}>
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Описание системы</Divider>
          
          <Row gutter={[16, 16]}>
            <Col span={24}>
              <Form.Item name="description" label="Заголовок описания" rules={[{ required: true, message: 'Введите заголовок описания' }]}>
                <Input />
              </Form.Item>
            </Col>
            <Col span={24}>
              <Form.Item name="descriptionText" label="Текст описания" rules={[{ required: true, message: 'Введите текст описания' }]}>
                <TextArea rows={6} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Как это работает</Divider>
          
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
