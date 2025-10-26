import React, { useState, useEffect } from 'react';
import { Table, Button, Space, Tag, Modal, Form, Input, message, Card, Typography, Popconfirm, Switch } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined, HeartOutlined, CalendarOutlined } from '@ant-design/icons';
import axios from 'axios';

const { Title } = Typography;

function AdminInterestsManagement({ currentUser }) {
  const [interests, setInterests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingInterest, setEditingInterest] = useState(null);
  const [form] = Form.useForm();

  useEffect(() => {
    fetchInterests();
  }, []);

  const fetchInterests = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/interests', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setInterests(response.data);
    } catch (error) {
      message.error('Ошибка при загрузке интересов');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (interest) => {
    setEditingInterest(interest);
    form.setFieldsValue({
      name: interest.name,
      is_active: interest.is_active
    });
    setModalVisible(true);
  };

  const handleDelete = async (interestId) => {
    try {
      await axios.delete(`/admin/interests/${interestId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success('Интерес удален');
      fetchInterests();
    } catch (error) {
      message.error('Ошибка при удалении интереса');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      
      if (editingInterest) {
        // Обновление интереса
        await axios.put(`/admin/interests/${editingInterest.id}`, values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Интерес обновлен');
      } else {
        // Создание нового интереса
        await axios.post('/admin/interests', values, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        message.success('Интерес создан');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingInterest(null);
      fetchInterests();
    } catch (error) {
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Ошибка при сохранении интереса');
      }
    }
  };

  const handleModalCancel = () => {
    setModalVisible(false);
    form.resetFields();
    setEditingInterest(null);
  };

  const toggleStatus = async (interest) => {
    try {
      await axios.put(`/admin/interests/${interest.id}`, {
        is_active: !interest.is_active
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      message.success(`Интерес ${!interest.is_active ? 'активирован' : 'заблокирован'}`);
      fetchInterests();
    } catch (error) {
      message.error('Ошибка при изменении статуса интереса');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      key: 'id',
      width: 60,
    },
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Статус',
      dataIndex: 'is_active',
      key: 'is_active',
      render: (isActive) => (
        <Tag color={isActive ? 'green' : 'red'}>
          {isActive ? 'Активно' : 'Заблокировано'}
        </Tag>
      ),
    },
    {
      title: 'Дата добавления',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString(),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
            size="small"
          >
            Редактировать
          </Button>
          <Button
            onClick={() => toggleStatus(record)}
            size="small"
            type={record.is_active ? 'default' : 'primary'}
          >
            {record.is_active ? 'Заблокировать' : 'Активировать'}
          </Button>
          <Popconfirm
            title="Вы уверены, что хотите удалить этот интерес?"
            onConfirm={() => handleDelete(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Button
              icon={<DeleteOutlined />}
              danger
              size="small"
            >
              Удалить
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <Title level={3} style={{ margin: 0 }}>
            <HeartOutlined /> Управление интересами
          </Title>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setEditingInterest(null);
              form.resetFields();
              setModalVisible(true);
            }}
          >
            Добавить интерес
          </Button>
        </div>

        <Table
          columns={columns}
          dataSource={interests}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
          }}
        />
      </Card>

      <Modal
        title={editingInterest ? 'Редактировать интерес' : 'Добавить интерес'}
        open={modalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={500}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="name"
            label="Название интереса"
            rules={[{ required: true, message: 'Введите название интереса' }]}
          >
            <Input placeholder="Например: велоспорт, компьютерные игры, путешествия" />
          </Form.Item>

          {editingInterest && (
            <Form.Item
              name="is_active"
              label="Статус"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Активно" 
                unCheckedChildren="Заблокировано"
              />
            </Form.Item>
          )}
        </Form>
      </Modal>
    </div>
  );
}

export default AdminInterestsManagement;
