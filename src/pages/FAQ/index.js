import React, { useState, useEffect } from 'react';
import { Card, Typography, Space, Collapse, Spin, Tabs, Tag } from 'antd';
import { QuestionCircleOutlined, FolderOutlined } from '@ant-design/icons';
import ProCard from '@ant-design/pro-card';
import axios from '../../utils/axiosConfig';

const { Title, Text, Paragraph } = Typography;

const FAQPage = () => {
  const [faqData, setFaqData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

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
        <Title level={2}>
          <Space>
            <QuestionCircleOutlined />
            Часто задаваемые вопросы
          </Space>
        </Title>
        <Text type="secondary">
          Ответы на самые популярные вопросы о системе анонимного обмена подарками
        </Text>
      </ProCard>

      <ProCard>
        <Tabs
          activeKey={activeTab}
          onChange={setActiveTab}
          items={getTabItems()}
          size="large"
        />
      </ProCard>
    </div>
  );
};

export default FAQPage;
