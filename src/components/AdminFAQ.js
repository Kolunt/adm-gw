import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Collapse, Button, Modal, Form, Input, message } from 'antd';
import { QuestionCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';

const { Title, Text, Paragraph } = Typography;
const { TextArea } = Input;

const AdminFAQ = () => {
  const [faqData, setFaqData] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    setLoading(true);
    try {
      // Используем те же статические данные, что и в публичной странице
      const staticFAQ = [
        {
          id: 1,
          question: "Как работает система анонимного обмена подарками?",
          answer: "Система позволяет участникам регистрироваться на мероприятия, указывать свои желания и получать подарки от других участников. Все происходит анонимно - вы не знаете, кто вам дарит подарок."
        },
        {
          id: 2,
          question: "Как зарегистрироваться на мероприятие?",
          answer: "Перейдите в раздел 'Все мероприятия', выберите интересующее вас мероприятие и нажмите кнопку регистрации. Заполните форму с вашими пожеланиями."
        },
        {
          id: 3,
          question: "Могу ли я изменить свои пожелания после регистрации?",
          answer: "Да, вы можете редактировать свои пожелания в любое время до начала мероприятия. После начала мероприятия изменения будут недоступны."
        },
        {
          id: 4,
          question: "Как узнать, кому я дарю подарок?",
          answer: "После регистрации на мероприятие система автоматически назначит вам получателя подарка. Вы увидите его пожелания, но не узнаете личность до самого мероприятия."
        },
        {
          id: 5,
          question: "Что делать, если я не могу участвовать в мероприятии?",
          answer: "Если вы не можете участвовать, пожалуйста, отмените регистрацию как можно раньше. Это поможет системе перераспределить подарки между оставшимися участниками."
        }
      ];
      setFaqData(staticFAQ);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      message.error('Ошибка загрузки FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingItem(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      question: item.question,
      answer: item.answer
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Удалить вопрос?',
      content: 'Вы уверены, что хотите удалить этот вопрос?',
      onOk: () => {
        setFaqData(prev => prev.filter(item => item.id !== id));
        message.success('Вопрос удален');
      }
    });
  };

  const handleSubmit = (values) => {
    if (editingItem) {
      // Редактирование существующего вопроса
      setFaqData(prev => prev.map(item => 
        item.id === editingItem.id 
          ? { ...item, question: values.question, answer: values.answer }
          : item
      ));
      message.success('Вопрос обновлен');
    } else {
      // Добавление нового вопроса
      const newItem = {
        id: Math.max(...faqData.map(item => item.id)) + 1,
        question: values.question,
        answer: values.answer
      };
      setFaqData(prev => [...prev, newItem]);
      message.success('Вопрос добавлен');
    }
    setModalVisible(false);
    form.resetFields();
  };

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>
              <Space>
                <QuestionCircleOutlined />
                Управление FAQ
              </Space>
            </Title>
            <Text type="secondary">
              Редактирование часто задаваемых вопросов
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Добавить вопрос
          </Button>
        </div>
      </ProCard>

      <ProCard>
        <Collapse
          items={faqData.map((item) => ({
            key: item.id,
            label: (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ color: '#ffffff', fontSize: '16px', fontWeight: 'bold' }}>
                  {item.question}
                </span>
                <Space>
                  <Button 
                    type="text" 
                    icon={<EditOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEdit(item);
                    }}
                  />
                  <Button 
                    type="text" 
                    danger 
                    icon={<DeleteOutlined />} 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item.id);
                    }}
                  />
                </Space>
              </div>
            ),
            children: (
              <Paragraph style={{ 
                color: '#d9d9d9',
                fontSize: '15px',
                lineHeight: '1.6',
                marginBottom: 0
              }}>
                {item.answer}
              </Paragraph>
            ),
          }))}
        />
      </ProCard>

      <Modal
        title={editingItem ? 'Редактировать вопрос' : 'Добавить вопрос'}
        open={modalVisible}
        onCancel={() => {
          setModalVisible(false);
          form.resetFields();
        }}
        footer={null}
        width={600}
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="question"
            label="Вопрос"
            rules={[{ required: true, message: 'Пожалуйста, введите вопрос' }]}
          >
            <Input placeholder="Введите вопрос" />
          </Form.Item>
          
          <Form.Item
            name="answer"
            label="Ответ"
            rules={[{ required: true, message: 'Пожалуйста, введите ответ' }]}
          >
            <TextArea 
              rows={4} 
              placeholder="Введите ответ" 
            />
          </Form.Item>
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingItem ? 'Обновить' : 'Добавить'}
              </Button>
              <Button onClick={() => {
                setModalVisible(false);
                form.resetFields();
              }}>
                Отмена
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminFAQ;
