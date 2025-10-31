import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Modal, Form, Input, message, Table, Tag, Switch } from 'antd';
import { QuestionCircleOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';

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
      const response = await axios.get('/admin/faq');
      setFaqData(response.data);
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
      answer: item.answer,
      order: item.order,
      is_active: item.is_active
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    Modal.confirm({
      title: 'Удалить вопрос?',
      content: 'Вы уверены, что хотите удалить этот вопрос?',
      onOk: async () => {
        try {
          await axios.delete(`/admin/faq/${id}`);
          message.success('Вопрос удален');
          fetchFAQ();
        } catch (error) {
          console.error('Error deleting FAQ:', error);
          message.error('Ошибка удаления вопроса');
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        // Редактирование существующего вопроса
        await axios.put(`/admin/faq/${editingItem.id}`, values);
        message.success('Вопрос обновлен');
      } else {
        // Добавление нового вопроса
        await axios.post('/admin/faq', values);
        message.success('Вопрос добавлен');
      }
      setModalVisible(false);
      form.resetFields();
      fetchFAQ();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      message.error('Ошибка сохранения вопроса');
    }
  };

  const moveItem = async (id, direction) => {
    const currentIndex = faqData.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Проверяем границы
    if (newIndex < 0 || newIndex >= faqData.length) return;

    const newData = [...faqData];
    const [movedItem] = newData.splice(currentIndex, 1);
    newData.splice(newIndex, 0, movedItem);

    // Обновляем порядок
    const updatedData = newData.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setFaqData(updatedData);

    // Сохраняем новый порядок на сервере
    try {
      for (let i = 0; i < updatedData.length; i++) {
        await axios.put(`/admin/faq/${updatedData[i].id}`, {
          order: i + 1
        });
      }
      message.success(`Вопрос перемещен ${direction === 'up' ? 'вверх' : 'вниз'}`);
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Ошибка обновления порядка');
      fetchFAQ(); // Восстанавливаем исходный порядок
    }
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
          loading={loading}
          pagination={false}
          columns={[
            {
              title: 'Порядок',
              dataIndex: 'order',
              key: 'order',
              width: 80,
              align: 'center',
              render: (order) => (
                <Tag color="green">{order}</Tag>
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
              title: 'Статус',
              dataIndex: 'is_active',
              key: 'is_active',
              width: 80,
              align: 'center',
              render: (isActive) => (
                <Tag color={isActive ? 'green' : 'red'}>
                  {isActive ? 'Активен' : 'Неактивен'}
                </Tag>
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

          <Form.Item
            name="order"
            label="Порядок отображения"
            initialValue={100}
            rules={[{ required: true, message: 'Пожалуйста, введите порядок' }]}
          >
            <Input type="number" placeholder="Порядок отображения" defaultValue={100} />
          </Form.Item>

          {editingItem && (
            <Form.Item
              name="is_active"
              label="Активен"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}
          
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
