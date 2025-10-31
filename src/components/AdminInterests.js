import React, { useState, useEffect } from 'react';
import { 
  Typography, 
  Space, 
  Button, 
  Table, 
  Modal, 
  Form, 
  Input, 
  message, 
  Popconfirm,
  Tag,
  Switch,
  Tooltip
} from 'antd';
import { 
  HeartOutlined, 
  PlusOutlined, 
  EditOutlined, 
  DeleteOutlined,
  ReloadOutlined,
  StopOutlined,
  CheckCircleOutlined
} from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';

const { Title, Text } = Typography;

const AdminInterests = () => {
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
      const response = await axios.get('/admin/interests');
      setInterests(response.data);
    } catch (error) {
      console.error('Error fetching interests:', error);
      message.error('Ошибка загрузки интересов');
    } finally {
      setLoading(false);
    }
  };

  const handleAddInterest = () => {
    setEditingInterest(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEditInterest = (interest) => {
    setEditingInterest(interest);
    form.setFieldsValue(interest);
    setModalVisible(true);
  };

  const handleDeleteInterest = async (id) => {
    try {
      await axios.delete(`/admin/interests/${id}`);
      setInterests(interests.filter(interest => interest.id !== id));
      message.success('Интерес удален');
    } catch (error) {
      console.error('Error deleting interest:', error);
      message.error('Ошибка удаления интереса');
    }
  };

  const handleSaveInterest = async (values) => {
    try {
      if (editingInterest) {
        // Редактирование существующего интереса
        const response = await axios.put(`/admin/interests/${editingInterest.id}`, values);
        setInterests(interests.map(interest => 
          interest.id === editingInterest.id ? response.data : interest
        ));
        message.success('Интерес обновлен');
      } else {
        // Добавление нового интереса
        const response = await axios.post('/admin/interests', values);
        setInterests([response.data, ...interests]);
        message.success('Интерес добавлен');
      }
      setModalVisible(false);
      form.resetFields();
    } catch (error) {
      console.error('Error saving interest:', error);
      if (error.response?.data?.detail) {
        message.error(error.response.data.detail);
      } else {
        message.error('Ошибка сохранения интереса');
      }
    }
  };

  const handleToggleBlocked = async (interest) => {
    try {
      const response = await axios.put(`/admin/interests/${interest.id}`, {
        is_blocked: !interest.is_blocked
      });
      setInterests(interests.map(i => 
        i.id === interest.id ? response.data : i
      ));
      message.success(
        response.data.is_blocked 
          ? 'Интерес заблокирован' 
          : 'Интерес разблокирован'
      );
    } catch (error) {
      console.error('Error toggling blocked status:', error);
      message.error('Ошибка изменения статуса блокировки');
    }
  };

  const columns = [
    {
      title: 'Название',
      dataIndex: 'name',
      key: 'name',
      render: (text, record) => (
        <Space>
          <Tag 
            color={record.is_blocked ? 'red' : 'green'}
            icon={record.is_blocked ? <StopOutlined /> : <CheckCircleOutlined />}
          >
            {text}
          </Tag>
        </Space>
      ),
    },
    {
      title: 'Статус',
      key: 'status',
      render: (_, record) => (
        <Space>
          {record.is_blocked ? (
            <Tag color="red" icon={<StopOutlined />}>
              Заблокирован
            </Tag>
          ) : (
            <Tag color="green" icon={<CheckCircleOutlined />}>
              Активен
            </Tag>
          )}
        </Space>
      ),
    },
    {
      title: 'Дата добавления',
      dataIndex: 'created_at',
      key: 'created_at',
      render: (date) => new Date(date).toLocaleDateString('ru-RU', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }),
      sorter: (a, b) => new Date(a.created_at) - new Date(b.created_at),
    },
    {
      title: 'Действия',
      key: 'actions',
      render: (_, record) => (
        <Space>
          <Tooltip title="Редактировать">
            <Button 
              type="text" 
              icon={<EditOutlined />} 
              onClick={() => handleEditInterest(record)}
            />
          </Tooltip>
          <Tooltip title={record.is_blocked ? 'Разблокировать' : 'Заблокировать'}>
            <Button 
              type="text" 
              icon={<StopOutlined />}
              danger={!record.is_blocked}
              onClick={() => handleToggleBlocked(record)}
            />
          </Tooltip>
          <Popconfirm
            title="Удалить интерес?"
            description="Это действие нельзя отменить"
            onConfirm={() => handleDeleteInterest(record.id)}
            okText="Да"
            cancelText="Нет"
          >
            <Tooltip title="Удалить">
              <Button type="text" danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <Title level={2}>
          <Space>
            <HeartOutlined />
            Интересы
          </Space>
        </Title>
        <Text type="secondary">
          Управление категориями интересов пользователей
        </Text>
      </ProCard>

      <ProCard>
        <div style={{ marginBottom: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>Список интересов</Title>
          <Space>
            <Tooltip title="Обновить">
              <Button 
                icon={<ReloadOutlined />} 
                onClick={fetchInterests}
                loading={loading}
              />
            </Tooltip>
            <Tooltip title="Добавить интерес">
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={handleAddInterest}
              />
            </Tooltip>
          </Space>
        </div>

        <Table
          columns={columns}
          dataSource={interests}
          loading={loading}
          rowKey="id"
          pagination={{
            pageSize: 10,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              `${range[0]}-${range[1]} из ${total} интересов`,
          }}
        />
      </ProCard>

      <Modal
        title={editingInterest ? 'Редактировать интерес' : 'Добавить интерес'}
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
          onFinish={handleSaveInterest}
        >
          <Form.Item
            name="name"
            label="Название интереса"
            rules={[
              { required: true, message: 'Введите название интереса' },
              { min: 2, message: 'Название должно содержать минимум 2 символа' },
              { max: 50, message: 'Название не должно превышать 50 символов' }
            ]}
          >
            <Input placeholder="Например: спорт" />
          </Form.Item>

          {editingInterest && (
            <Form.Item
              name="is_blocked"
              label="Заблокирован"
              valuePropName="checked"
            >
              <Switch />
            </Form.Item>
          )}

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setModalVisible(false)}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                {editingInterest ? 'Обновить' : 'Добавить'}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdminInterests;
