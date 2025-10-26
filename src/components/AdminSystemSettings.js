import React, { useState, useEffect, useCallback } from 'react';
import { Card, Form, Input, Button, Switch, Divider, Typography, message, Space, Tag } from 'antd';
import { SettingOutlined, SaveOutlined, ReloadOutlined } from '@ant-design/icons';

const { Title, Paragraph } = Typography;

function AdminSystemSettings() {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [settings, setSettings] = useState({
    site_name: 'Анонимный Дед Мороз',
    site_description: 'Система управления мероприятиями',
    registration_enabled: true,
    max_participants: 100,
    admin_email: 'admin@example.com',
  });

  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      // В реальном приложении здесь был бы API для получения настроек
      // Пока используем моковые данные
      form.setFieldsValue(settings);
    } catch (error) {
      message.error('Ошибка при загрузке настроек');
    } finally {
      setLoading(false);
    }
  }, [form, settings]);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSave = async (values) => {
    setLoading(true);
    try {
      // В реальном приложении здесь был бы API для сохранения настроек
      console.log('Сохранение настроек:', values);
      message.success('Настройки сохранены');
      setSettings(values);
    } catch (error) {
      message.error('Ошибка при сохранении настроек');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    form.setFieldsValue(settings);
    message.info('Настройки сброшены');
  };

  return (
    <div>
      <Card>
        <div style={{ marginBottom: '20px' }}>
          <Title level={3} style={{ margin: 0 }}>
            <SettingOutlined /> Настройки системы
          </Title>
          <Paragraph type="secondary">
            Управление основными параметрами системы
          </Paragraph>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSave}
          initialValues={settings}
        >
          <Card size="small" style={{ marginBottom: '16px' }}>
            <Title level={4}>Основные настройки</Title>
            
            <Form.Item
              name="site_name"
              label="Название сайта"
              rules={[{ required: true, message: 'Введите название сайта' }]}
            >
              <Input placeholder="Анонимный Дед Мороз" />
            </Form.Item>

            <Form.Item
              name="site_description"
              label="Описание сайта"
            >
              <Input.TextArea 
                rows={3} 
                placeholder="Описание системы управления мероприятиями"
              />
            </Form.Item>

            <Form.Item
              name="admin_email"
              label="Email администратора"
              rules={[
                { required: true, message: 'Введите email администратора' },
                { type: 'email', message: 'Введите корректный email' }
              ]}
            >
              <Input placeholder="admin@example.com" />
            </Form.Item>
          </Card>

          <Card size="small" style={{ marginBottom: '16px' }}>
            <Title level={4}>Функциональность</Title>
            
            <Form.Item
              name="registration_enabled"
              label="Разрешить регистрацию"
              valuePropName="checked"
            >
              <Switch 
                checkedChildren="Включено" 
                unCheckedChildren="Отключено"
              />
            </Form.Item>


            <Form.Item
              name="max_participants"
              label="Максимальное количество участников"
              rules={[
                { required: true, message: 'Введите максимальное количество участников' },
                { type: 'number', min: 1, message: 'Минимум 1 участник' }
              ]}
            >
              <Input type="number" min={1} />
            </Form.Item>
          </Card>

          <Card size="small">
            <Title level={4}>Статистика системы</Title>
            <Space direction="vertical" style={{ width: '100%' }}>
              <div>
                <Tag color="blue">Всего пользователей: 0</Tag>
                <Tag color="green">Активных пользователей: 0</Tag>
              </div>
            </Space>
          </Card>

          <Divider />

          <Space>
            <Button
              type="primary"
              htmlType="submit"
              icon={<SaveOutlined />}
              loading={loading}
            >
              Сохранить настройки
            </Button>
            <Button
              icon={<ReloadOutlined />}
              onClick={handleReset}
            >
              Сбросить
            </Button>
          </Space>
        </Form>
      </Card>
    </div>
  );
}

export default AdminSystemSettings;
