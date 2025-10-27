import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Button, Card, Spin, message } from 'antd';
import { CheckOutlined, UserOutlined } from '@ant-design/icons';
import { generateAvatar } from '../utils/avatarUtils';

/**
 * Компонент для выбора аватарки из предустановленных вариантов
 * @param {Object} props - Свойства компонента
 * @param {boolean} props.visible - Видимость модального окна
 * @param {Function} props.onCancel - Функция закрытия модального окна
 * @param {Function} props.onSelect - Функция выбора аватарки (принимает avatar_seed)
 * @param {string} props.currentAvatarSeed - Текущий seed аватарки пользователя
 * @returns {JSX.Element} - Компонент выбора аватарки
 */
const AvatarSelector = ({ visible, onCancel, onSelect, currentAvatarSeed }) => {
  const [selectedSeed, setSelectedSeed] = useState(currentAvatarSeed);
  const [loading, setLoading] = useState(false);

  // Предустановленные варианты аватарок
  const avatarSeeds = [
    'santa_1', 'santa_2', 'santa_3', 'santa_4',
    'elf_1', 'elf_2', 'elf_3', 'elf_4',
    'reindeer_1', 'reindeer_2', 'reindeer_3', 'reindeer_4',
    'snowman_1', 'snowman_2', 'snowman_3', 'snowman_4',
    'christmas_1', 'christmas_2', 'christmas_3', 'christmas_4',
    'winter_1', 'winter_2', 'winter_3', 'winter_4',
    'magic_1', 'magic_2', 'magic_3', 'magic_4',
    'festive_1', 'festive_2', 'festive_3', 'festive_4'
  ];

  useEffect(() => {
    if (visible) {
      setSelectedSeed(currentAvatarSeed);
    }
  }, [visible, currentAvatarSeed]);

  const handleSelect = async () => {
    if (!selectedSeed) {
      message.warning('Выберите аватарку');
      return;
    }

    setLoading(true);
    try {
      await onSelect(selectedSeed);
      message.success('Аватарка успешно изменена!');
      onCancel();
    } catch (error) {
      message.error('Ошибка при изменении аватарки');
      console.error('Error updating avatar:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderAvatarCard = (seed) => {
    const isSelected = selectedSeed === seed;
    const avatarUrl = generateAvatar(seed, 80);

    return (
      <Col xs={12} sm={8} md={6} lg={4} xl={3} key={seed}>
        <Card
          hoverable
          style={{
            textAlign: 'center',
            border: isSelected ? '2px solid #1890ff' : '1px solid #d9d9d9',
            backgroundColor: isSelected ? '#f0f8ff' : '#fff',
            cursor: 'pointer',
            position: 'relative'
          }}
          bodyStyle={{ padding: '12px' }}
          onClick={() => setSelectedSeed(seed)}
        >
          <div style={{ marginBottom: '8px' }}>
            <img
              src={avatarUrl}
              alt={`Avatar ${seed}`}
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                objectFit: 'cover'
              }}
            />
          </div>
          
          <div style={{ fontSize: '12px', color: '#666', marginBottom: '4px' }}>
            {seed.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
          </div>

          {isSelected && (
            <div
              style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                backgroundColor: '#1890ff',
                borderRadius: '50%',
                width: '20px',
                height: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <CheckOutlined style={{ color: 'white', fontSize: '12px' }} />
            </div>
          )}
        </Card>
      </Col>
    );
  };

  return (
    <Modal
      title={
        <div style={{ textAlign: 'center' }}>
          <UserOutlined style={{ marginRight: '8px', color: '#1890ff' }} />
          Выберите аватарку
        </div>
      }
      open={visible}
      onCancel={onCancel}
      width={800}
      footer={[
        <Button key="cancel" onClick={onCancel}>
          Отмена
        </Button>,
        <Button
          key="select"
          type="primary"
          onClick={handleSelect}
          loading={loading}
          disabled={!selectedSeed}
        >
          Выбрать
        </Button>
      ]}
    >
      <div style={{ maxHeight: '500px', overflowY: 'auto' }}>
        <Row gutter={[16, 16]} style={{ padding: '16px 0' }}>
          {avatarSeeds.map(renderAvatarCard)}
        </Row>
        
        <div style={{ textAlign: 'center', marginTop: '20px', padding: '16px', backgroundColor: '#f5f5f5', borderRadius: '6px' }}>
          <p style={{ margin: 0, color: '#666', fontSize: '14px' }}>
            💡 Выберите аватарку, которая лучше всего представляет вас в роли Анонимного Дед Мороза!
          </p>
        </div>
      </div>
    </Modal>
  );
};

export default AvatarSelector;
