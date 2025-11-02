import React, { useState, useEffect } from 'react';
import { Typography, Space, Row, Col, Button, Divider, Modal, Form, Input, message } from 'antd';
import { ContactsOutlined, MailOutlined, PhoneOutlined, MessageOutlined, GithubOutlined, EditOutlined, SaveOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import { useTheme } from '../contexts/ThemeContext';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminContacts = () => {
  const { isDark } = useTheme();
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

  const inputStyle = {
    backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
    color: isDark ? '#ffffff' : '#000000',
    border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
  };

  const ContactField = ({ field, label, icon, color, value, multiline = false }) => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
          {React.cloneElement(icon, { style: { marginRight: '8px', color: isDark ? (color === '#333' ? '#ffffff' : color) : color } })}
          <Text strong style={{ color: isDark ? '#ffffff' : '#000000' }}>{label}</Text>
        </div>
        <Button 
          type="text" 
          icon={<EditOutlined />} 
          onClick={() => handleEdit(field, value)}
          size="small"
          style={{ color: isDark ? '#ffffff' : '#000000' }}
        />
      </div>
      <Text type="secondary" style={{ 
        display: 'block', 
        marginBottom: '8px',
        whiteSpace: multiline ? 'pre-line' : 'normal',
        color: isDark ? '#bfbfbf' : '#8c8c8c'
      }}>
        {value}
      </Text>
      <Button type="link" size="small" style={{ color: isDark ? '#52c41a' : '#1890ff' }}>
        {field === 'supportEmail' ? 'Написать письмо' :
         field === 'telegram' ? 'Перейти в Telegram' :
         field === 'github' ? 'Открыть репозиторий' :
         field === 'officialSite' ? 'Перейти на сайт' :
         field === 'forum' ? 'Открыть форум' : ''}
      </Button>
    </div>
  );

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
            Управление контактами
          </Space>
        </Title>
        <Text type="secondary" style={{ color: isDark ? '#bfbfbf' : '#8c8c8c' }}>
          Редактирование контактной информации системы
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
              <ContactField
                field="supportEmail"
                label="Email поддержки"
                icon={<MailOutlined />}
                color="#2d5016"
                value={contactsData.supportEmail}
              />
              
              <Divider style={{ borderColor: isDark ? '#404040' : '#f0f0f0' }} />
              
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
          <ProCard 
            title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Разработка и сообщество</span>} 
            style={{ 
              height: '100%',
              backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
              border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
            }}
          >
            <Space direction="vertical" size="large" style={{ width: '100%' }}>
              <ContactField
                field="github"
                label="GitHub репозиторий"
                icon={<GithubOutlined />}
                color="#333"
                value={contactsData.github}
              />
              
              <Divider style={{ borderColor: isDark ? '#404040' : '#f0f0f0' }} />
              
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

      <ProCard 
        title={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Часы работы поддержки</span>} 
        style={{ 
          marginTop: '24px',
          backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          border: isDark ? '1px solid #404040' : '1px solid #d9d9d9'
        }}
      >
        <ContactField
          field="supportSchedule"
          label="Расписание работы"
          icon={<PhoneOutlined />}
          color="#faad14"
          value={contactsData.supportSchedule}
          multiline={true}
        />
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
            <ContactField
              field="officialSite"
              label="Официальный сайт"
              icon={<ContactsOutlined />}
              color="#2d5016"
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
        title={
          <span style={{ color: isDark ? '#ffffff' : '#000000' }}>
            {`Редактировать ${editingField === 'supportEmail' ? 'Email поддержки' :
                editingField === 'telegram' ? 'Telegram' :
                editingField === 'github' ? 'GitHub репозиторий' :
                editingField === 'phone' ? 'Телефон' :
                editingField === 'supportSchedule' ? 'Расписание работы' :
                editingField === 'officialSite' ? 'Официальный сайт' :
                editingField === 'forum' ? 'Форум сообщества' : 'поле'}`}
          </span>
        }
        open={editingField !== null}
        onCancel={handleCancel}
        footer={null}
        width={600}
        styles={{
          content: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
          },
          header: {
            backgroundColor: isDark ? '#1f1f1f' : '#ffffff',
            borderBottom: isDark ? '1px solid #404040' : '1px solid #f0f0f0'
          }
        }}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
        >
          <Form.Item
            name="value"
            label={<span style={{ color: isDark ? '#ffffff' : '#000000' }}>Значение</span>}
            rules={[{ required: true, message: 'Пожалуйста, введите значение' }]}
          >
            {editingField === 'supportSchedule' ? (
              <TextArea 
                rows={4} 
                placeholder="Введите расписание работы"
                style={inputStyle}
              />
            ) : (
              <Input 
                placeholder="Введите значение" 
                style={inputStyle}
              />
            )}
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit" icon={<SaveOutlined />}>
                Сохранить
              </Button>
              <Button 
                onClick={handleCancel}
                style={{
                  backgroundColor: isDark ? '#2f2f2f' : '#ffffff',
                  borderColor: isDark ? '#404040' : '#d9d9d9',
                  color: isDark ? '#ffffff' : '#000000'
                }}
              >
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
