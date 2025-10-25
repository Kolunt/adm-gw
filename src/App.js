import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Layout, Typography, Button, Space } from 'antd';
import { UserAddOutlined, GiftOutlined, HomeOutlined } from '@ant-design/icons';
import axios from 'axios';
import './App.css';

import RegistrationForm from './components/RegistrationForm';
import UserList from './components/UserList';
import GiftExchange from './components/GiftExchange';
import GiftList from './components/GiftList';

const { Header, Content, Footer } = Layout;
const { Title } = Typography;

// Configure axios base URL
axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : 'http://localhost:8000';

function App() {
  const [users, setUsers] = useState([]);
  const [gifts, setGifts] = useState([]);
  const [currentView, setCurrentView] = useState('home');

  useEffect(() => {
    fetchUsers();
    fetchGifts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('/users/');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchGifts = async () => {
    try {
      const response = await axios.get('/gifts/');
      setGifts(response.data);
    } catch (error) {
      console.error('Error fetching gifts:', error);
    }
  };

  const handleUserRegistered = () => {
    fetchUsers();
  };

  const handleGiftCreated = () => {
    fetchGifts();
  };

  const renderContent = () => {
    switch (currentView) {
      case 'register':
        return <RegistrationForm onUserRegistered={handleUserRegistered} />;
      case 'users':
        return <UserList users={users} />;
      case 'gifts':
        return <GiftList gifts={gifts} users={users} />;
      case 'exchange':
        return <GiftExchange users={users} onGiftCreated={handleGiftCreated} />;
      default:
        return (
          <div style={{ textAlign: 'center', padding: '50px' }}>
            <Title level={2} style={{ color: '#d63031', marginBottom: '30px' }}>
              🎅 Добро пожаловать в Анонимный Дед Мороз! 🎁
            </Title>
            <Title level={4} style={{ color: '#636e72', marginBottom: '40px' }}>
              Зарегистрируйтесь, чтобы участвовать в обмене подарками
            </Title>
            <Space size="large">
              <Button 
                type="primary" 
                size="large" 
                icon={<UserAddOutlined />}
                onClick={() => setCurrentView('register')}
              >
                Зарегистрироваться
              </Button>
              <Button 
                size="large" 
                icon={<GiftOutlined />}
                onClick={() => setCurrentView('exchange')}
              >
                Обмен подарками
              </Button>
            </Space>
          </div>
        );
    }
  };

  return (
    <Router>
      <div className="santa-container">
        <Layout className="santa-card" style={{ minHeight: '100vh' }}>
          <Header style={{ background: 'transparent', padding: '0 50px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Title 
                level={2} 
                style={{ color: '#d63031', margin: 0, cursor: 'pointer' }}
                onClick={() => setCurrentView('home')}
              >
                🎅 Анонимный Дед Мороз
              </Title>
              <Space>
                <Button 
                  icon={<HomeOutlined />}
                  onClick={() => setCurrentView('home')}
                >
                  Главная
                </Button>
                <Button 
                  icon={<UserAddOutlined />}
                  onClick={() => setCurrentView('register')}
                >
                  Регистрация
                </Button>
                <Button 
                  icon={<GiftOutlined />}
                  onClick={() => setCurrentView('exchange')}
                >
                  Подарки
                </Button>
              </Space>
            </div>
          </Header>
          
          <Content style={{ padding: '50px' }}>
            {renderContent()}
          </Content>
          
          <Footer style={{ textAlign: 'center', background: 'transparent' }}>
            <Title level={5} style={{ color: '#636e72' }}>
              Анонимный Дед Мороз ©2024 - Обмен подарками с любовью ❤️
            </Title>
          </Footer>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
