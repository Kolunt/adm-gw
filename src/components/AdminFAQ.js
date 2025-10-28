import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Modal, Form, Input, message, Table, Tag } from 'antd';
import { QuestionCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
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
          answer: "Система позволяет участникам регистрироваться на мероприятия, указывать свои желания и получать подарки от других участников. Все происходит анонимно - вы не знаете, кто вам дарит подарок.",
          priority: 1
        },
        {
          id: 2,
          question: "Как зарегистрироваться на мероприятие?",
          answer: "Перейдите в раздел 'Все мероприятия', выберите интересующее вас мероприятие и нажмите кнопку регистрации. Заполните форму с вашими пожеланиями.",
          priority: 2
        },
        {
          id: 3,
          question: "Могу ли я изменить свои пожелания после регистрации?",
          answer: "Да, вы можете редактировать свои пожелания в любое время до начала мероприятия. После начала мероприятия изменения будут недоступны.",
          priority: 3
        },
        {
          id: 4,
          question: "Как узнать, кому я дарю подарок?",
          answer: "После регистрации на мероприятие система автоматически назначит вам получателя подарка. Вы увидите его пожелания, но не узнаете личность до самого мероприятия.",
          priority: 4
        },
        {
          id: 5,
          question: "Что делать, если я не могу участвовать в мероприятии?",
          answer: "Если вы не можете участвовать, пожалуйста, отмените регистрацию как можно раньше. Это поможет системе перераспределить подарки между оставшимися участниками.",
          priority: 5
        }
      ];
      // Сортируем по приоритету (чем меньше число, тем выше приоритет)
      const sortedFAQ = staticFAQ.sort((a, b) => (a.priority || 100) - (b.priority || 100));
      setFaqData(sortedFAQ);
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
        answer: values.answer,
        priority: faqData.length + 1
      };
      setFaqData(prev => [...prev, newItem]);
      message.success('Вопрос добавлен');
    }
    setModalVisible(false);
    form.resetFields();
  };

  const moveItem = (id, direction) => {
    const currentIndex = faqData.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Проверяем границы
    if (newIndex < 0 || newIndex >= faqData.length) return;

    const newData = [...faqData];
    const [movedItem] = newData.splice(currentIndex, 1);
    newData.splice(newIndex, 0, movedItem);

    // Обновляем приоритеты
    const updatedData = newData.map((item, index) => ({
      ...item,
      priority: index + 1
    }));

    setFaqData(updatedData);
    message.success(`Вопрос перемещен ${direction === 'up' ? 'вверх' : 'вниз'}`);
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
        <Table
          dataSource={faqData}
          rowKey="id"
          pagination={false}
          columns={[
            {
              title: 'Порядок',
              dataIndex: 'priority',
              key: 'priority',
              width: 80,
              align: 'center',
              render: (priority) => (
                <Tag color="green">{priority}</Tag>
              ),
            },
            {
              title: 'Вопрос',
              dataIndex: 'question',
              key: 'question',
              render: (text) => (
                <Text strong style={{ color: '#ffffff' }}>
                  {text}
                </Text>
              ),
            },
            {
              title: 'Ответ',
              dataIndex: 'answer',
              key: 'answer',
              render: (text) => (
                <Text style={{ color: '#d9d9d9' }}>
                  {text.length > 100 ? `${text.substring(0, 100)}...` : text}
                </Text>
              ),
            },
            {
              title: 'Действия',
              key: 'actions',
              width: 200,
              render: (_, record, index) => (
                <Space>
                  <Button
                    type="text"
                    icon={<UpOutlined />}
                    onClick={() => moveItem(record.id, 'up')}
                    disabled={index === 0}
                    title="Переместить вверх"
                  />
                  <Button
                    type="text"
                    icon={<DownOutlined />}
                    onClick={() => moveItem(record.id, 'down')}
                    disabled={index === faqData.length - 1}
                    title="Переместить вниз"
                  />
                  <Button
                    type="text"
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(record)}
                    title="Редактировать"
                  />
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    onClick={() => handleDelete(record.id)}
                    title="Удалить"
                  />
                </Space>
              ),
            },
          ]}
          expandable={{
            expandedRowRender: (record) => (
              <div style={{ padding: '16px', backgroundColor: '#1f1f1f', borderRadius: '6px' }}>
                <Text style={{ color: '#d9d9d9', fontSize: '15px', lineHeight: '1.6' }}>
                  {record.answer}
                </Text>
              </div>
            ),
            rowExpandable: (record) => true,
          }}
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
