import React, { useState, useEffect } from 'react';
import { 
  Table, 
  Button, 
  Modal, 
  Form, 
  Input, 
  Switch, 
  InputNumber, 
  message, 
  Popconfirm, 
  Tag, 
  Space,
  Typography,
  Card,
  Divider
} from 'antd';
import { 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined, 
  QuestionCircleOutlined,
  EyeOutlined,
  EyeInvisibleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { TextArea } = Input;

function AdminFAQManagement() {
  const [faqItems, setFaqItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingFAQ, setEditingFAQ] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchFAQ();
  }, []);

  const fetchFAQ = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/admin/faq', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setFaqItems(response.data);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
      message.error('Ошибка при загрузке FAQ');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setEditingFAQ(null);
    setModalVisible(true);
    // Сброс формы после открытия модального окна
    setTimeout(() => {
      form.resetFields();
    }, 100);
  };

  const handleEdit = (record) => {
    setEditingFAQ(record);
    form.setFieldsValue({
      question: record.question,
      answer: record.answer,
      order: record.order,
      is_active: record.is_active
    });
    setModalVisible(true);
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/admin/faq/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('FAQ удален');
      fetchFAQ();
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      message.error('Ошибка при удалении FAQ');
    }
  };

  const handleSubmit = async (values) => {
    try {
      if (editingFAQ) {
        // Обновление
        await axios.put(`/admin/faq/${editingFAQ.id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('FAQ обновлен');
      } else {
        // Создание
        await axios.post('/admin/faq', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('FAQ создан');
      }
      setModalVisible(false);
      fetchFAQ();
    } catch (error) {
      console.error('Error saving FAQ:', error);
      message.error('Ошибка при сохранении FAQ');
    }
  };

  const toggleActive = async (record) => {
    try {
      await axios.put(`/admin/faq/${record.id}`, {
        is_active: !record.is_active
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success(`FAQ ${!record.is_active ? 'активирован' : 'деактивирован'}`);
      fetchFAQ();
    } catch (error) {
      console.error('Error toggling FAQ:', error);
      message.error('Ошибка при изменении статуса FAQ');
    }
  };

  const columns = [
    {
      title: 'Порядок',
      dataIndex: 'order',
      key: 'order',
      width: 80,
      sorter: (a, b) => a.order - b.order,
    },
    {
      title: 'Вопрос',
      dataIndex: 'question',
      key: 'question',
      ellipsis: true,
      render: (text) => (
        <Text strong style={{ fontSize: '14px' }}>
          {text}
        </Text>
      ),
    },
    {
      title: 'Ответ',
      dataIndex: 'answer',
      key: 'answer',
      ellipsis: true,
      render: (text) => (
        <Text style={{ fontSize: '13px' }}>
          {text.length > 100 ? `${text.substring(0, 100)}...` : text}
        </Text>
      ),
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      width: 100,
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активен' : 'Неактивен'}
        </Tag>
      ),
    },
    {
      title: 'Автор',
      dataIndex: 'created_by_user_id',
      key: 'created_by_user_id',
      width: 120,
      render: (userId) => (
        <Tag color="blue">
          {userId ? `Пользователь #${userId}` : 'Система'}
        </Tag>
      ),
    },
    {
      title: 'Дата создания',
      dataIndex: 'created_at',
      key: 'created_at',
      width: 120,
      render: (date) => new Date(date).toLocaleDateString('ru-RU'),
    },
    {
      title: 'Действия',
      key: 'actions',
      width: 200,
      render: (_, record) => (
        <Space>
          <Button
            type="primary"
            size="small"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Редактировать
          </Button>
          <Button
            size="small"
            icon={record.is_active ? <EyeInvisibleOutlined /> : <EyeOutlined />}
            onClick={() => toggleActive(record)}
            style={{ 
              color: record.is_active ? '#ff4d4f' : '#52c41a',
              borderColor: record.is_active ? '#ff4d4f' : '#52c41a'
            }}
          >
            {record.is_active ? 'Скрыть' : 'Показать'}
          </Button>
          <Popconfirm
            title="Удалить FAQ?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              danger
              size="small"
              icon={<DeleteOutlined />}
            >
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '20px' }}>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <Title level={2} style={{ color: '#d63031', marginBottom: '8px' }}>
            <QuestionCircleOutlined style={{ marginRight: '8px' }} />
            Управление FAQ
          </Title>
          <Text type="secondary">
            Создавайте, редактируйте и управляйте часто задаваемыми вопросами
          </Text>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={handleCreate}
            size="large"
          >
            Создать новый FAQ
          </Button>
        </div>

        <Divider />

        <Table
          columns={columns}
          dataSource={faqItems}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} из ${total} FAQ`,
          }}
          scroll={{ x: 1000 }}
        />
      </Card>

      <Modal
        title={editingFAQ ? 'Редактировать FAQ' : 'Создать новый FAQ'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        footer={null}
        width={600}
        destroyOnHidden
      >
        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Form.Item
            name="question"
            label="Вопрос"
            rules={[
              { required: true, message: 'Пожалуйста, введите вопрос!' },
              { max: 500, message: 'Вопрос не должен превышать 500 символов' }
            ]}
          >
            <Input.TextArea
              rows={3}
              placeholder="Введите вопрос..."
              maxLength={500}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Ответ"
            rules={[
              { required: true, message: 'Пожалуйста, введите ответ!' },
              { max: 2000, message: 'Ответ не должен превышать 2000 символов' }
            ]}
          >
            <TextArea
              rows={6}
              placeholder="Введите подробный ответ..."
              maxLength={2000}
              showCount
            />
          </Form.Item>

          <Form.Item
            name="order"
            label="Порядок отображения"
            rules={[
              { required: true, message: 'Пожалуйста, укажите порядок!' },
              { type: 'number', min: 0, message: 'Порядок должен быть не менее 0' }
            ]}
          >
            <InputNumber
              min={0}
              max={999}
              style={{ width: '100%' }}
              placeholder="0"
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Статус"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch
              checkedChildren="Активен"
              unCheckedChildren="Неактивен"
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                {editingFAQ ? 'Обновить' : 'Создать'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}

export default AdminFAQManagement;
