import React from 'react';
import { Result, Button } from 'antd';
import { useNavigate } from 'react-router-dom';
import { LockOutlined } from '@ant-design/icons';

function AdminRouteGuard({ children, user }) {
  const navigate = useNavigate();

  // Проверяем авторизацию
  if (!user) {
    return (
      <Result
        status="403"
        title="403"
        subTitle="Доступ запрещен"
        extra={
          <Button type="primary" onClick={() => navigate('/login')}>
            Войти в систему
          </Button>
        }
      />
    );
  }

  // Проверяем роль администратора
  if (user.role !== 'admin') {
    return (
      <Result
        status="403"
        title="403"
        subTitle="У вас нет прав доступа к админ-панели"
        icon={<LockOutlined />}
        extra={
          <Button type="primary" onClick={() => navigate('/')}>
            Вернуться на главную
          </Button>
        }
      />
    );
  }

  // Если все проверки пройдены, отображаем содержимое
  return children;
}

export default AdminRouteGuard;
