import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Modal, Form, Input, message, Table, Tag, Switch, Select } from 'antd';
import { FolderOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UpOutlined, DownOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';

const { Title, Text } = Typography;
const { TextArea } = Input;

const AdminFAQCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/faq/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
      message.error('Ошибка загрузки категорий');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    form.setFieldsValue({
      name: category.name,
      description: category.description,
      order: category.order,
      is_active: category.is_active
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Удалить категорию?',
      content: 'Вы уверены, что хотите удалить эту категорию? Все FAQ в этой категории останутся без категории.',
      onOk: async () => {
        try {
          await axios.delete(`/admin/faq/categories/${id}`);
          message.success('Категория удалена');
          fetchCategories();
        } catch (error) {
          console.error('Error deleting category:', error);
          message.error('Ошибка удаления категории');
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingCategory) {
        // Редактирование существующей категории
        await axios.put(`/admin/faq/categories/${editingCategory.id}`, values);
        message.success('Категория обновлена');
      } else {
        // Добавление новой категории
        await axios.post('/admin/faq/categories', values);
        message.success('Категория добавлена');
      }
      setModalVisible(false);
      form.resetFields();
      fetchCategories();
    } catch (error) {
      console.error('Error saving category:', error);
      message.error('Ошибка сохранения категории');
    }
  };

  const moveCategory = async (id, direction) => {
    const currentIndex = categories.findIndex(cat => cat.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    // Проверяем границы
    if (newIndex < 0 || newIndex >= categories.length) return;

    const newData = [...categories];
    const [movedItem] = newData.splice(currentIndex, 1);
    newData.splice(newIndex, 0, movedItem);

    // Обновляем порядок
    const updatedData = newData.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setCategories(updatedData);

    // Сохраняем новый порядок на сервере
    try {
      for (let i = 0; i < updatedData.length; i++) {
        await axios.put(`/admin/faq/categories/${updatedData[i].id}`, {
          order: i + 1
        });
      }
      message.success(`Категория перемещена ${direction === 'up' ? 'вверх' : 'вниз'}`);
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Ошибка обновления порядка');
      fetchCategories(); // Восстанавливаем исходный порядок
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await axios.put(`/admin/faq/categories/${id}`, {
        is_active: isActive
      });
      message.success(`Категория ${isActive ? 'активирована' : 'деактивирована'}`);
      fetchCategories();
    } catch (error) {
      console.error('Error toggling category:', error);
      message.error('Ошибка изменения статуса категории');
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>
              <Space>
                <FolderOutlined />
                Управление категориями FAQ
              </Space>
            </Title>
            <Text type="secondary">
              Создание и редактирование категорий для FAQ
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={handleAdd}
          >
            Добавить категорию
          </Button>
        </div>
      </ProCard>

      <ProCard>
        <Table
          dataSource={categories}
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
                <Tag color="blue">{order}</Tag>
              ),
            },
            {
              title: 'Название',
              dataIndex: 'name',
              key: 'name',
              render: (text) => (
                <Text strong style={{ color: '#ffffff' }}>
                  {text}
                </Text>
              ),
            },
            {
              title: 'Описание',
              dataIndex: 'description',
              key: 'description',
              render: (text) => (
                <Text style={{ color: '#d9d9d9' }}>
                  {text || 'Нет описания'}
                </Text>
              ),
            },
            {
              title: 'Статус',
              dataIndex: 'is_active',
              key: 'is_active',
              width: 100,
              align: 'center',
              render: (isActive, record) => (
                <Switch
                  checked={isActive}
                  onChange={(checked) => toggleActive(record.id, checked)}
                />
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
                    onClick={() => moveCategory(record.id, 'up')}
                    disabled={index === 0}
                    title="Переместить вверх"
                  />
                  <Button
                    type="text"
                    icon={<DownOutlined />}
                    onClick={() => moveCategory(record.id, 'down')}
                    disabled={index === categories.length - 1}
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
        />
      </ProCard>

      <Modal
        title={editingCategory ? 'Редактировать категорию' : 'Добавить категорию'}
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
            name="name"
            label="Название категории"
            rules={[{ required: true, message: 'Пожалуйста, введите название категории' }]}
          >
            <Input placeholder="Введите название категории" />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Описание"
          >
            <TextArea 
              rows={3} 
              placeholder="Введите описание категории (необязательно)" 
            />
          </Form.Item>

          <Form.Item
            name="order"
            label="Порядок отображения"
            rules={[{ required: true, message: 'Пожалуйста, введите порядок' }]}
          >
            <Input type="number" placeholder="Порядок отображения" />
          </Form.Item>

          {editingCategory && (
            <Form.Item
              name="is_active"
              label="Активна"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}
          
          <Form.Item>
            <Space>
              <Button type="primary" htmlType="submit">
                {editingCategory ? 'Обновить' : 'Добавить'}
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

export default AdminFAQCategories;
