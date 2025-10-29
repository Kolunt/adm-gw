import React, { useState, useEffect } from 'react';
import { Typography, Space, Button, Modal, Form, Input, message, Table, Tag, Switch, Select, Tree, Card, Row, Col } from 'antd';
import { MenuOutlined, PlusOutlined, EditOutlined, DeleteOutlined, UpOutlined, DownOutlined, FolderOutlined, FileOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../utils/axiosConfig';

const { Title, Text } = Typography;
const { Option } = Select;

const AdminMenuManagement = () => {
  const [menuItems, setMenuItems] = useState([]);
  const [flatMenuItems, setFlatMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [form] = Form.useForm();
  const [expandedKeys, setExpandedKeys] = useState([]);

  // Список доступных иконок
  const availableIcons = [
    'HomeOutlined', 'UserOutlined', 'SettingOutlined', 'TeamOutlined', 'GiftOutlined',
    'QuestionCircleOutlined', 'CalendarOutlined', 'HeartOutlined', 'BookOutlined',
    'ExperimentOutlined', 'InfoCircleOutlined', 'ContactsOutlined', 'MenuOutlined',
    'FolderOutlined', 'FileOutlined', 'DashboardOutlined', 'LoginOutlined',
    'LogoutOutlined', 'PlusOutlined', 'EditOutlined', 'DeleteOutlined'
  ];

  useEffect(() => {
    fetchMenuItems();
  }, []);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const response = await axios.get('/admin/menu');
      setMenuItems(response.data);
      setFlatMenuItems(flattenMenuItems(response.data));
    } catch (error) {
      console.error('Error fetching menu items:', error);
      message.error('Ошибка загрузки элементов меню');
    } finally {
      setLoading(false);
    }
  };

  const flattenMenuItems = (items, parentPath = '') => {
    let flat = [];
    items.forEach(item => {
      const itemWithPath = {
        ...item,
        fullPath: parentPath ? `${parentPath} > ${item.title}` : item.title
      };
      flat.push(itemWithPath);
      if (item.children && item.children.length > 0) {
        flat = flat.concat(flattenMenuItems(item.children, itemWithPath.fullPath));
      }
    });
    return flat;
  };

  const handleAdd = (parentId = null) => {
    setEditingItem(null);
    form.resetFields();
    if (parentId) {
      form.setFieldsValue({ parent_id: parentId });
    }
    setModalVisible(true);
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    form.setFieldsValue({
      title: item.title,
      path: item.path,
      icon: item.icon,
      parent_id: item.parent_id,
      order: item.order,
      is_active: item.is_active,
      is_admin_only: item.is_admin_only
    });
    setModalVisible(true);
  };

  const handleDelete = (id) => {
    Modal.confirm({
      title: 'Удалить элемент меню?',
      content: 'Вы уверены, что хотите удалить этот элемент? Все дочерние элементы также будут удалены.',
      onOk: async () => {
        try {
          await axios.delete(`/admin/menu/${id}`);
          message.success('Элемент меню удален');
          fetchMenuItems();
        } catch (error) {
          console.error('Error deleting menu item:', error);
          message.error('Ошибка удаления элемента меню');
        }
      }
    });
  };

  const handleSubmit = async (values) => {
    try {
      if (editingItem) {
        await axios.put(`/admin/menu/${editingItem.id}`, values);
        message.success('Элемент меню обновлен');
      } else {
        await axios.post('/admin/menu', values);
        message.success('Элемент меню добавлен');
      }
      setModalVisible(false);
      form.resetFields();
      fetchMenuItems();
    } catch (error) {
      console.error('Error saving menu item:', error);
      message.error('Ошибка сохранения элемента меню');
    }
  };

  const moveItem = async (id, direction) => {
    const currentIndex = flatMenuItems.findIndex(item => item.id === id);
    if (currentIndex === -1) return;

    const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1;
    
    if (newIndex < 0 || newIndex >= flatMenuItems.length) return;

    const newData = [...flatMenuItems];
    const [movedItem] = newData.splice(currentIndex, 1);
    newData.splice(newIndex, 0, movedItem);

    // Обновляем порядок
    const updatedData = newData.map((item, index) => ({
      ...item,
      order: index + 1
    }));

    setFlatMenuItems(updatedData);

    try {
      for (let i = 0; i < updatedData.length; i++) {
        await axios.put(`/admin/menu/${updatedData[i].id}`, {
          order: i + 1
        });
      }
      message.success(`Элемент перемещен ${direction === 'up' ? 'вверх' : 'вниз'}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error updating order:', error);
      message.error('Ошибка обновления порядка');
      fetchMenuItems();
    }
  };

  const toggleActive = async (id, isActive) => {
    try {
      await axios.put(`/admin/menu/${id}`, {
        is_active: isActive
      });
      message.success(`Элемент ${isActive ? 'активирован' : 'деактивирован'}`);
      fetchMenuItems();
    } catch (error) {
      console.error('Error toggling menu item:', error);
      message.error('Ошибка изменения статуса элемента');
    }
  };

  const renderTreeData = (items) => {
    return items.map(item => ({
      key: item.id,
      title: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <Space>
              {item.icon && <span>{item.icon}</span>}
              <Text strong={item.is_active}>{item.title}</Text>
              {item.path && <Text type="secondary">({item.path})</Text>}
              {item.is_admin_only && <Tag color="red">Админ</Tag>}
              {!item.is_active && <Tag color="gray">Неактивен</Tag>}
            </Space>
          </div>
          <Space>
            <Button
              type="text"
              icon={<UpOutlined />}
              onClick={() => moveItem(item.id, 'up')}
              disabled={flatMenuItems.findIndex(i => i.id === item.id) === 0}
              size="small"
            />
            <Button
              type="text"
              icon={<DownOutlined />}
              onClick={() => moveItem(item.id, 'down')}
              disabled={flatMenuItems.findIndex(i => i.id === item.id) === flatMenuItems.length - 1}
              size="small"
            />
            <Button
              type="text"
              icon={<EditOutlined />}
              onClick={() => handleEdit(item)}
              size="small"
            />
            <Button
              type="text"
              icon={<PlusOutlined />}
              onClick={() => handleAdd(item.id)}
              size="small"
              title="Добавить подэлемент"
            />
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              onClick={() => handleDelete(item.id)}
              size="small"
            />
          </Space>
        </div>
      ),
      children: item.children && item.children.length > 0 ? renderTreeData(item.children) : undefined
    }));
  };

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <Title level={2}>
              <Space>
                <MenuOutlined />
                Управление меню
              </Space>
            </Title>
            <Text type="secondary">
              Настройка структуры левого меню с поддержкой многоуровневой вложенности
            </Text>
          </div>
          <Button 
            type="primary" 
            icon={<PlusOutlined />} 
            onClick={() => handleAdd()}
          >
            Добавить элемент
          </Button>
        </div>
      </ProCard>

      <ProCard>
        <Tree
          treeData={renderTreeData(menuItems)}
          expandedKeys={expandedKeys}
          onExpand={setExpandedKeys}
          showLine
          defaultExpandAll
          style={{ backgroundColor: 'transparent' }}
        />
      </ProCard>

      <Modal
        title={editingItem ? 'Редактировать элемент меню' : 'Добавить элемент меню'}
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
            name="title"
            label="Название"
            rules={[{ required: true, message: 'Пожалуйста, введите название' }]}
          >
            <Input placeholder="Введите название элемента меню" />
          </Form.Item>
          
          <Form.Item
            name="path"
            label="Путь"
          >
            <Input placeholder="Введите путь (например, /admin/users)" />
          </Form.Item>

          <Form.Item
            name="icon"
            label="Иконка"
          >
            <Select
              placeholder="Выберите иконку"
              allowClear
              showSearch
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              {availableIcons.map(icon => (
                <Option key={icon} value={icon}>
                  {icon}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="parent_id"
            label="Родительский элемент"
          >
            <Select
              placeholder="Выберите родительский элемент (необязательно)"
              allowClear
            >
              {flatMenuItems.map(item => (
                <Option key={item.id} value={item.id}>
                  {item.fullPath}
                </Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="order"
            label="Порядок отображения"
            rules={[{ required: true, message: 'Пожалуйста, введите порядок' }]}
          >
            <Input type="number" placeholder="Порядок отображения" />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Активен"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>

          <Form.Item
            name="is_admin_only"
            label="Только для администраторов"
            valuePropName="checked"
          >
            <Switch />
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

export default AdminMenuManagement;
