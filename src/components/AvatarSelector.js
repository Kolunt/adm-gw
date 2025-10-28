import React, { useState, useEffect } from 'react';
import { Modal, Button, Card, Row, Col, Typography, Spin, message } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';
import { generateAvatar } from '../utils/avatarUtils';

const { Text } = Typography;

// Предустановленные варианты аватарок
const avatarOptions = [
  'santa_1', 'santa_2', 'santa_3', 'santa_4',
  'elf_1', 'elf_2', 'elf_3', 'elf_4',
  'reindeer_1', 'reindeer_2', 'reindeer_3', 'reindeer_4',
  'snowman_1', 'snowman_2', 'snowman_3', 'snowman_4',
  'christmas_1', 'christmas_2', 'christmas_3', 'christmas_4',
  'winter_1', 'winter_2', 'winter_3', 'winter_4',
  'magic_1', 'magic_2', 'magic_3', 'magic_4',
  'festive_1', 'festive_2', 'festive_3', 'festive_4',
];

const AvatarSelector = ({ visible, onCancel, onSelect, currentAvatarSeed }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatarSeed);
  const [loading, setLoading] = useState(false);
  const [previews, setPreviews] = useState({});

  useEffect(() => {
    setSelectedAvatar(currentAvatarSeed);
  }, [currentAvatarSeed]);

  useEffect(() => {
    const loadPreviews = async () => {
      const newPreviews = {};
      for (const seed of avatarOptions) {
        newPreviews[seed] = generateAvatar(seed, 64);
      }
      setPreviews(newPreviews);
    };
    loadPreviews();
  }, []);

  const handleSelectClick = async () => {
    if (selectedAvatar && onSelect) {
      setLoading(true);
      try {
        await onSelect(selectedAvatar);
        message.success('Аватарка успешно обновлена!');
        onCancel();
      } catch (error) {
        message.error('Не удалось обновить аватарку.');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <Modal
      title="Выберите аватарку"
      open={visible}
      onCancel={onCancel}
      footer={[
        <Button key="back" onClick={onCancel}>
          Отмена
        </Button>,
        <Button 
          key="submit" 
          type="primary" 
          onClick={handleSelectClick} 
          loading={loading}
          disabled={!selectedAvatar || selectedAvatar === currentAvatarSeed}
        >
          Выбрать
        </Button>,
      ]}
      width={800}
      centered
    >
      <Spin spinning={loading} tip="Обновление аватарки...">
        <div style={{ maxHeight: '60vh', overflowY: 'auto', paddingRight: '10px' }}>
          <Row gutter={[16, 16]}>
            {avatarOptions.map((seed) => (
              <Col xs={12} sm={8} md={6} lg={4} key={seed}>
                <Card
                  hoverable
                  onClick={() => setSelectedAvatar(seed)}
                  style={{ 
                    border: selectedAvatar === seed ? '2px solid #2d5016' : '1px solid #f0f0f0',
                    position: 'relative',
                    textAlign: 'center',
                    padding: '10px'
                  }}
                  bodyStyle={{ padding: '0' }}
                >
                  <img 
                    src={previews[seed]} 
                    alt={seed} 
                    style={{ width: '64px', height: '64px', borderRadius: '50%', marginBottom: '8px' }} 
                  />
                  <Text ellipsis>{seed.replace(/_/g, ' ')}</Text>
                  {selectedAvatar === seed && (
                    <CheckCircleOutlined 
                      style={{ 
                        position: 'absolute', 
                        top: '8px', 
                        right: '8px', 
                        color: '#2d5016', 
                        fontSize: '20px' 
                      }} 
                    />
                  )}
                </Card>
              </Col>
            ))}
          </Row>
        </div>
      </Spin>
    </Modal>
  );
};

export default AvatarSelector;
