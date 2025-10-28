import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Row, Col, Button, Divider, Modal, Form, Input, message } from 'antd';
import { ContactsOutlined, MailOutlined, PhoneOutlined, MessageOutlined, GithubOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminContacts = () => {
  const [contactsData, setContactsData] = useState({
    supportEmail: 'support@gwars.io',
    telegram: '@gwars_support',
    github: 'github.com/Kolunt/adm-gw',
    phone: '+7 (XXX) XXX-XX-XX',
    workHours: 'Рабочие дни: 9:00 - 18:00',
    officialSite: 'gwars.io',
    forum: 'forum.gwars.io',
    supportSchedule: 'Понедельник - Пятница: 9:00 - 18:00\nСуббота: 10:00 - 16:00\nВоскресенье: выходной'
  });
  
  const [editingField, setEditingField] = useState(null);
  const [form] = Form.useForm();

  const handleEdit = (field, currentValue) => {
    setEditingField(field);
    form.setFieldsValue({
      value: currentValue
    });
  };

  const handleSave = (values) => {
    setContactsData(prev => ({
      ...prev,
      [editingField]: values.value
    }));
    setEditingField(null);
    form.resetFields();
    message.success('Контактная информация обновлена');
  };

  const handleCancel = () => {
    setEditingField(null);
    form.resetFields();
  };

  const ContactField = ({ field, label, icon, color, value, multiline = false }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {React.cloneElement(icon, { style: { marginRight: '8px', color } })}
          <Text strong>{label}</Text>
        </div>
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(field, value)}
          size="small"
        />
      </div>
      <Text type="secondary" style={{ 
        display: 'block', 
        marginBottom: '8px',
        whiteSpace: multiline ? 'pre-line' : 'normal'
      }}>
        {value}
      </Text>
      <Button type="link" size="small">
        {field === 'supportEmail' ? 'Написать письмо' :
         field === 'telegram' ? 'Перейти в Telegram' :
         field === 'github' ? 'Открыть репозиторий' :
         field === 'officialSite' ? 'Перейти на сайт' :
         field === 'forum' ? 'Открыть форум' : ''}
      </Button>
    </div>
  );

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <ContactsOutlined />
            Управление контактами
          </Space>
        </Title>
        <Text type="secondary">
          Редактирование контактной информации системы
        </Text>
      </ProCard>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12}>
          <ProCard title="Техническая поддержка" style={{ height: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <ContactField
                field="supportEmail"
                label="Email поддержки"
                icon={<MailOutlined />}
                color="#1890ff"
                value={contactsData.supportEmail}
              />
              
              <Divider />
              
              <ContactField
                field="telegram"
                label="Telegram"
                icon={<MessageOutlined />}
                color="#52c41a"
                value={contactsData.telegram}
              />
            </Space>
          </ProCard>
        </Col>

        <Col xs={24} md={12}>
          <ProCard title="Разработка и сообщество" style={{ height: '100%' }}>
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <ContactField
                field="github"
                label="GitHub репозиторий"
                icon={<GithubOutlined />}
                color="#333"
                value={contactsData.github}
              />
              
              <Divider />
              
              <ContactField
                field="phone"
                label="Телефон"
                icon={<PhoneOutlined />}
                color="#faad14"
                value={contactsData.phone}
              />
            </Space>
          </ProCard>
        </Col>
      </Row>

      <ProCard title="Часы работы поддержки" style={{ marginTop: '24px' }}>
        <ContactField
          field="supportSchedule"
          label="Расписание работы"
          icon={<PhoneOutlined />}
          color="#faad14"
          value={contactsData.supportSchedule}
          multiline={true}
        />
      </ProCard>

      <ProCard title="Сообщество GWars.io" style={{ marginTop: '24px' }}>
        <Row gutter={[16, 16]}>
          <Col xs={24} md={12}>
            <ContactField
              field="officialSite"
              label="Официальный сайт"
              icon={<ContactsOutlined />}
              color="#1890ff"
              value={contactsData.officialSite}
            />
          </Col>
          <Col xs={24} md={12}>
            <ContactField
              field="forum"
              label="Форум сообщества"
              icon={<MessageOutlined />}
              color="#52c41a"
              value={contactsData.forum}
            />
          </Col>
        </Row>
      </ProCard>

      <Modal
        title={`Редактировать ${editingField === 'supportEmail' ? 'Email поддержки' :
                editingField === 'telegram' ? 'Telegram' :
                editingField === 'github' ? 'GitHub репозиторий' :
                editingField === 'phone' ? 'Телефон' :
                editingField === 'supportSchedule' ? 'Расписание работы' :
                editingField === 'officialSite' ? 'Официальный сайт' :
                editingField === 'forum' ? 'Форум сообщества' : 'поле'}`}
        open={editingField !== null}
        onCancel={handleCancel}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="value"
            label="Значение"
            rules={[{ required: true, message: 'Пожалуйста, введите значение' }]}
          >
            {editingField === 'supportSchedule' ? (
              <TextArea 
                rows={4} 
                placeholder="Введите расписание работы" 
              />
            ) : (
              <Input placeholder="Введите значение" />
            )}
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Сохранить
              </Button>
              <Button onClick={handleCancel}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminContacts;
