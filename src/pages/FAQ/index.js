import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Collapse, Spin, Tabs, Tag, Button, Modal, Form, Input, message, Select, Switch } from 'antd';
import { QuestionCircleOutlined, FolderOutlined, PlusOutlined, EditOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../../utils/axiosConfig';
import { useAuth } from '../../services/AuthService';

const { Title, Text, Paragraph } = Typography;

const FAQPage = () => {
  const { user } = useAuth();
  const [faqData, setFaqData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [isCategoryModalVisible, setIsCategoryModalVisible] = useState(false);
  const [isFaqModalVisible, setIsFaqModalVisible] = useState(false);
  const [categoryForm] = Form.useForm();
  const [faqForm] = Form.useForm();

  useEffect(() => {
    fetchFAQ();
    fetchCategories();
  }, []);

  const fetchFAQ = async () => {
    try {
      const response = await axios.get('/api/faq');
      setFaqData(response.data);
    } catch (error) {
      console.error('Error fetching FAQ:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/faq/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const handleCreateCategory = async (values) => {
    try {
      await axios.post('/admin/faq/categories', values);
      message.success('Категория успешно создана!');
      setIsCategoryModalVisible(false);
      categoryForm.resetFields();
      fetchCategories(); // Обновляем список категорий
    } catch (error) {
      console.error('Error creating category:', error);
      message.error('Ошибка при создании категории');
    }
  };

  const handleCreateFAQ = async (values) => {
    try {
      await axios.post('/admin/faq', values);
      message.success('Вопрос-ответ успешно создан!');
      setIsFaqModalVisible(false);
      faqForm.resetFields();
      fetchFAQ(); // Обновляем список FAQ
    } catch (error) {
      console.error('Error creating FAQ:', error);
      message.error('Ошибка при создании вопроса-ответа');
    }
  };

  const showCategoryModal = () => {
    setIsCategoryModalVisible(true);
  };

  const showFaqModal = () => {
    setIsFaqModalVisible(true);
  };

  const handleCategoryCancel = () => {
    setIsCategoryModalVisible(false);
    categoryForm.resetFields();
  };

  const handleFaqCancel = () => {
    setIsFaqModalVisible(false);
    faqForm.resetFields();
  };

  const getFilteredFAQ = () => {
    if (activeTab === 'all') {
      return faqData;
    }
    return faqData.filter(item => item.category_id === parseInt(activeTab));
  };

  const getTabItems = () => {
    const items = [
      {
        key: 'all',
        label: (
          <Space>
            <QuestionCircleOutlined />
            Все вопросы
          </Space>
        ),
        children: renderFAQItems(getFilteredFAQ())
      }
    ];

    categories.forEach(category => {
      const categoryFAQ = faqData.filter(item => item.category_id === category.id);
      if (categoryFAQ.length > 0) {
        items.push({
          key: category.id.toString(),
          label: (
            <Space>
              <FolderOutlined />
              {category.name}
              <Tag color="blue">{categoryFAQ.length}</Tag>
            </Space>
          ),
          children: renderFAQItems(categoryFAQ)
        });
      }
    });

    return items;
  };

  const renderFAQItems = (items) => (
    <Collapse
      size="large"
      items={items.map((item) => ({
        key: item.id,
        label: (
          <Text strong style={{ 
            fontSize: '16px',
            color: '#ffffff'
          }}>
            {item.question}
          </Text>
        ),
        children: (
          <Paragraph style={{ 
            fontSize: '15px', 
            marginBottom: 0,
            color: '#d9d9d9',
            lineHeight: '1.6'
          }}>
            {item.answer}
          </Paragraph>
        ),
      }))}
    />
  );

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px' }}>
      <ProCard style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <Title level={2}>
              <Space>
                <QuestionCircleOutlined />
                Часто задаваемые вопросы
              </Space>
            </Title>
            <Text type="secondary">
              Ответы на самые популярные вопросы о системе анонимного обмена подарками
            </Text>
          </div>
          {user?.role === 'admin' && (
            <Space style={{ marginTop: '8px' }}>
              <Button 
                icon={<FolderOutlined />} 
                onClick={showCategoryModal}
              >
                Добавить категорию
              </Button>
              <Button 
                type="primary" 
                icon={<PlusOutlined />} 
                onClick={showFaqModal}
              >
                Добавить вопрос
              </Button>
            </Space>
          )}
        </div>
      </ProCard>

      <ProCard>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={getTabItems()}
          size="large"
        />
      </ProCard>

      <Modal
        title="Создать новую категорию FAQ"
        open={isCategoryModalVisible}
        onCancel={handleCategoryCancel}
        footer={null}
        width={500}
      >
        <Form
          form={categoryForm}
          layout="vertical"
          onFinish={handleCreateCategory}
        >
          <Form.Item
            name="name"
            label="Название категории"
            rules={[
              { required: true, message: 'Пожалуйста, введите название категории' },
              { min: 2, message: 'Название должно содержать минимум 2 символа' }
            ]}
          >
            <Input placeholder="Например: Общие вопросы" />
          </Form.Item>

          <Form.Item
            name="description"
            label="Описание категории"
            rules={[
              { max: 200, message: 'Описание не должно превышать 200 символов' }
            ]}
          >
            <Input.TextArea 
              placeholder="Краткое описание категории (необязательно)"
              rows={3}
            />
          </Form.Item>

          <Form.Item
            name="order"
            label="Порядок отображения"
            rules={[
              { type: 'number', message: 'Порядок должен быть числом' }
            ]}
          >
            <Input 
              type="number" 
              placeholder="0" 
              min={0}
            />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleCategoryCancel}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Создать категорию
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Создать новый вопрос-ответ FAQ"
        open={isFaqModalVisible}
        onCancel={handleFaqCancel}
        footer={null}
        width={600}
      >
        <Form
          form={faqForm}
          layout="vertical"
          onFinish={handleCreateFAQ}
        >
          <Form.Item
            name="question"
            label="Вопрос"
            rules={[
              { required: true, message: 'Пожалуйста, введите вопрос' },
              { min: 5, message: 'Вопрос должен содержать минимум 5 символов' }
            ]}
          >
            <Input placeholder="Например: Как работает система обмена подарками?" />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Ответ"
            rules={[
              { required: true, message: 'Пожалуйста, введите ответ' },
              { min: 10, message: 'Ответ должен содержать минимум 10 символов' }
            ]}
          >
            <Input.TextArea 
              placeholder="Подробный ответ на вопрос..."
              rows={4}
            />
          </Form.Item>

          <Form.Item
            name="category_id"
            label="Категория"
          >
            <Select
              placeholder="Выберите категорию (необязательно)"
              allowClear
            >
              {categories.map(category => (
                <Select.Option key={category.id} value={category.id}>
                  {category.name}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            name="order"
            label="Порядок отображения"
            rules={[
              { type: 'number', message: 'Порядок должен быть числом' }
            ]}
          >
            <Input 
              type="number" 
              placeholder="0" 
              min={0}
            />
          </Form.Item>

          <Form.Item
            name="is_active"
            label="Активен"
            valuePropName="checked"
            initialValue={true}
          >
            <Switch />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={handleFaqCancel}>
                Отмена
              </Button>
              <Button type="primary" htmlType="submit">
                Создать вопрос-ответ
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default FAQPage;
