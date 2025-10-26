import React, { useState, useEffect } from 'react';
import {
  Card,
  Upload,
  Button,
  message,
  Space,
  Typography,
  Alert,
  Image,
  Modal,
  Table,
  Tag,
  Popconfirm
} from 'antd';
import {
  UploadOutlined,
  DeleteOutlined,
  EyeOutlined,
  PictureOutlined,
  InfoCircleOutlined
} from '@ant-design/icons';
import axios from 'axios';

const { Title, Text } = Typography;
const { Dragger } = Upload;

const SiteIconManagement = ({ currentUser }) => {
  const [currentIcon, setCurrentIcon] = useState(null);
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  // Загрузка текущей иконки
  const fetchCurrentIcon = async () => {
    try {
      const response = await axios.get('/admin/site-icon');
      setCurrentIcon(response.data);
    } catch (error) {
      console.error('Ошибка загрузки иконки:', error);
    }
  };

  useEffect(() => {
    fetchCurrentIcon();
  }, []);

  // Загрузка файла
  const handleUpload = async (file) => {
    setLoading(true);
    
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('/admin/site-icon/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      
      setCurrentIcon(response.data);
      message.success('Иконка сайта успешно загружена!');
      
      // Обновляем favicon в браузере
      updateFavicon();
      
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      message.error(error.response?.data?.detail || 'Ошибка загрузки иконки');
    } finally {
      setLoading(false);
    }
    
    return false; // Предотвращаем автоматическую загрузку
  };

  // Удаление иконки
  const handleDelete = async (iconId) => {
    setLoading(true);
    try {
      await axios.delete(`/admin/site-icon/${iconId}`);
      setCurrentIcon(null);
      message.success('Иконка удалена');
      
      // Удаляем favicon
      removeFavicon();
      
    } catch (error) {
      console.error('Ошибка удаления:', error);
      message.error('Ошибка удаления иконки');
    } finally {
      setLoading(false);
    }
  };

  // Просмотр изображения
  const handlePreview = (imageUrl) => {
    setPreviewImage(imageUrl);
    setPreviewVisible(true);
  };

  // Обновление favicon в браузере
  const updateFavicon = () => {
    if (currentIcon) {
      const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
      favicon.rel = 'icon';
      favicon.href = `/uploads/icons/${currentIcon.filename}`;
      favicon.type = currentIcon.mime_type;
      
      if (!document.querySelector('link[rel="icon"]')) {
        document.head.appendChild(favicon);
      }
    }
  };

  // Удаление favicon
  const removeFavicon = () => {
    const favicon = document.querySelector('link[rel="icon"]');
    if (favicon) {
      favicon.remove();
    }
  };

  // Настройки загрузки
  const uploadProps = {
    name: 'file',
    multiple: false,
    beforeUpload: handleUpload,
    accept: '.png,.jpg,.jpeg,.gif,.svg,.ico',
    showUploadList: false,
  };

  // Форматирование размера файла
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Форматирование даты
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('ru-RU', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2}>
        <PictureOutlined /> Управление иконкой сайта
      </Title>

      {/* Информация о поддерживаемых форматах */}
      <Alert
        message="Поддерживаемые форматы"
        description={
          <div>
            <p>Вы можете загрузить иконку сайта в следующих форматах:</p>
            <ul style={{ marginBottom: 0 }}>
              <li><strong>PNG</strong> - рекомендуется для веб-сайтов</li>
              <li><strong>JPG/JPEG</strong> - для фотографических изображений</li>
              <li><strong>GIF</strong> - для анимированных иконок</li>
              <li><strong>SVG</strong> - векторные иконки</li>
              <li><strong>ICO</strong> - классический формат иконок</li>
            </ul>
            <p><strong>Максимальный размер:</strong> 5MB</p>
          </div>
        }
        type="info"
        showIcon
        style={{ marginBottom: '24px' }}
      />

      {/* Текущая иконка */}
      {currentIcon ? (
        <Card title="Текущая иконка сайта" style={{ marginBottom: '24px' }}>
          <Space direction="vertical" style={{ width: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <Image
                src={`/uploads/icons/${currentIcon.filename}`}
                alt="Иконка сайта"
                style={{ 
                  maxWidth: '128px', 
                  maxHeight: '128px',
                  border: '1px solid #d9d9d9',
                  borderRadius: '8px'
                }}
                preview={false}
              />
            </div>
            
            <div style={{ textAlign: 'center' }}>
              <Space>
                <Button
                  icon={<EyeOutlined />}
                  onClick={() => handlePreview(`/uploads/icons/${currentIcon.filename}`)}
                >
                  Просмотр
                </Button>
                <Popconfirm
                  title="Удалить иконку?"
                  description="Это действие нельзя отменить"
                  onConfirm={() => handleDelete(currentIcon.id)}
                  okText="Да"
                  cancelText="Отмена"
                >
                  <Button
                    danger
                    icon={<DeleteOutlined />}
                    loading={loading}
                  >
                    Удалить
                  </Button>
                </Popconfirm>
              </Space>
            </div>

            <div style={{ fontSize: '14px', color: '#666' }}>
              <p><strong>Файл:</strong> {currentIcon.original_filename}</p>
              <p><strong>Размер:</strong> {formatFileSize(currentIcon.file_size)}</p>
              <p><strong>Тип:</strong> {currentIcon.mime_type}</p>
              <p><strong>Загружено:</strong> {formatDate(currentIcon.created_at)}</p>
            </div>
          </Space>
        </Card>
      ) : (
        <Card title="Иконка не установлена" style={{ marginBottom: '24px' }}>
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <PictureOutlined style={{ fontSize: '64px', color: '#d9d9d9', marginBottom: '16px' }} />
            <p style={{ color: '#666', marginBottom: '24px' }}>
              Иконка сайта не установлена. Загрузите иконку, чтобы настроить favicon.
            </p>
          </div>
        </Card>
      )}

      {/* Загрузка новой иконки */}
      <Card title="Загрузить новую иконку">
        <Dragger {...uploadProps} disabled={loading}>
          <p className="ant-upload-drag-icon">
            <UploadOutlined />
          </p>
          <p className="ant-upload-text">
            Нажмите или перетащите файл сюда для загрузки
          </p>
          <p className="ant-upload-hint">
            Поддерживаются форматы: PNG, JPG, JPEG, GIF, SVG, ICO
            <br />
            Максимальный размер: 5MB
          </p>
        </Dragger>
        
        {loading && (
          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            <Text type="secondary">Загрузка иконки...</Text>
          </div>
        )}
      </Card>

      {/* Модальное окно для просмотра */}
      <Modal
        title="Просмотр иконки"
        open={previewVisible}
        onCancel={() => setPreviewVisible(false)}
        footer={null}
        width={600}
      >
        <div style={{ textAlign: 'center' }}>
          <Image
            src={previewImage}
            alt="Предварительный просмотр"
            style={{ maxWidth: '100%', maxHeight: '400px' }}
          />
        </div>
      </Modal>

      {/* Инструкции по использованию */}
      <Card title={<><InfoCircleOutlined /> Инструкции</>} style={{ marginTop: '24px' }}>
        <div style={{ fontSize: '14px' }}>
          <h4>Как работает иконка сайта:</h4>
          <ol>
            <li><strong>Загрузка:</strong> Выберите файл иконки и загрузите его</li>
            <li><strong>Активация:</strong> Новая иконка автоматически становится активной</li>
            <li><strong>Favicon:</strong> Иконка отображается во вкладке браузера</li>
            <li><strong>Кэширование:</strong> Браузер может кэшировать иконку - обновите страницу</li>
          </ol>
          
          <h4>Рекомендации:</h4>
          <ul>
            <li>Используйте квадратные изображения (например, 32x32, 64x64 пикселей)</li>
            <li>PNG формат обеспечивает лучшее качество для иконок</li>
            <li>Избегайте слишком детализированных изображений</li>
            <li>Убедитесь, что иконка хорошо выглядит в маленьком размере</li>
          </ul>
        </div>
      </Card>
    </div>
  );
};

export default SiteIconManagement;
