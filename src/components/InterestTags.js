import React, { useState, useEffect, useCallback } from 'react';
import { Select, Tag, Button, message, Space } from 'antd';
import { PlusOutlined, CloseOutlined } from '@ant-design/icons';
import axios from 'axios';
import debounce from 'lodash.debounce';

const { Option } = Select;

function InterestTags({ value = [], onChange, placeholder = "Добавьте ваши интересы..." }) {
  const [selectedInterests, setSelectedInterests] = useState(Array.isArray(value) ? value : []);
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [searchValue, setSearchValue] = useState('');
  const [popularInterests, setPopularInterests] = useState([]);

  // Загружаем популярные интересы при монтировании
  useEffect(() => {
    fetchPopularInterests();
  }, []);

  // Обновляем локальное состояние при изменении value
  useEffect(() => {
    setSelectedInterests(Array.isArray(value) ? value : []);
  }, [value]);

  const fetchPopularInterests = async () => {
    try {
      const response = await axios.get('/api/interests/popular');
      setPopularInterests(response.data);
    } catch (error) {
      console.error('Error fetching popular interests:', error);
    }
  };

  // Дебаунсированный поиск интересов
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length < 2) {
        setSearchResults([]);
        return;
      }

      setSearchLoading(true);
      try {
        const response = await axios.get(`/api/interests/search?query=${encodeURIComponent(query)}`);
        setSearchResults(response.data);
      } catch (error) {
        console.error('Error searching interests:', error);
        setSearchResults([]);
      } finally {
        setSearchLoading(false);
      }
    }, 300),
    []
  );

  const handleSearch = (value) => {
    setSearchValue(value);
    debouncedSearch(value);
  };

  const handleAddInterest = async (interestName) => {
    if (!interestName || interestName.trim() === '') return;

    const trimmedName = interestName.trim();
    
    // Проверяем, не добавлен ли уже этот интерес
    if (selectedInterests.some(interest => interest.name === trimmedName)) {
      message.warning('Этот интерес уже добавлен');
      return;
    }

    try {
      const response = await axios.post('/api/interests/create', {
        name: trimmedName
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      const newInterest = response.data;
      const updatedInterests = [...selectedInterests, newInterest];
      setSelectedInterests(updatedInterests);
      onChange?.(updatedInterests);
      
      message.success(`Интерес "${trimmedName}" добавлен`);
      setSearchValue('');
      setSearchResults([]);
    } catch (error) {
      console.error('Error creating interest:', error);
      message.error('Ошибка при добавлении интереса');
    }
  };

  const handleRemoveInterest = (interestToRemove) => {
    const updatedInterests = selectedInterests.filter(
      interest => interest.id !== interestToRemove.id
    );
    setSelectedInterests(updatedInterests);
    onChange?.(updatedInterests);
  };

  const handleSelectExisting = (interestId) => {
    const interest = searchResults.find(i => i.id === interestId);
    if (interest && !selectedInterests.some(i => i.id === interestId)) {
      const updatedInterests = [...selectedInterests, interest];
      setSelectedInterests(updatedInterests);
      onChange?.(updatedInterests);
      setSearchValue('');
      setSearchResults([]);
    }
  };

  const handleSelectPopular = (interestId) => {
    const interest = popularInterests.find(i => i.id === interestId);
    if (interest && !selectedInterests.some(i => i.id === interestId)) {
      const updatedInterests = [...selectedInterests, interest];
      setSelectedInterests(updatedInterests);
      onChange?.(updatedInterests);
    }
  };

  return (
    <div>
      {/* Отображение выбранных интересов */}
      <div style={{ marginBottom: '12px', minHeight: '32px' }}>
        {Array.isArray(selectedInterests) && selectedInterests.map((interest) => (
          <Tag
            key={interest.id}
            closable
            onClose={() => handleRemoveInterest(interest)}
            style={{ marginBottom: '4px' }}
            color="blue"
          >
            {interest.name}
          </Tag>
        ))}
      </div>

      {/* Поле поиска и добавления */}
      <Select
        mode="combobox"
        placeholder={placeholder}
        value={searchValue}
        onSearch={handleSearch}
        onSelect={handleSelectExisting}
        loading={searchLoading}
        notFoundContent={searchLoading ? "Поиск..." : "Введите название интереса"}
        style={{ width: '100%', marginBottom: '12px' }}
        dropdownStyle={{ maxHeight: '200px' }}
      >
        {searchResults.map((interest) => (
          <Option key={interest.id} value={interest.id}>
            {interest.name}
          </Option>
        ))}
      </Select>

      {/* Кнопка добавления нового интереса */}
      {searchValue && searchValue.trim() && (
        <Button
          type="dashed"
          icon={<PlusOutlined />}
          onClick={() => handleAddInterest(searchValue)}
          style={{ width: '100%', marginBottom: '12px' }}
        >
          Добавить "{searchValue.trim()}"
        </Button>
      )}

      {/* Популярные интересы */}
      {popularInterests.length > 0 && (
        <div>
          <div style={{ marginBottom: '8px', fontSize: '12px', color: '#666' }}>
            Популярные интересы:
          </div>
          <Space wrap>
            {popularInterests.slice(0, 10).map((interest) => (
              <Tag
                key={interest.id}
                onClick={() => handleSelectPopular(interest.id)}
                style={{ 
                  cursor: 'pointer',
                  opacity: selectedInterests.some(i => i.id === interest.id) ? 0.5 : 1
                }}
                color={selectedInterests.some(i => i.id === interest.id) ? 'default' : 'green'}
              >
                {interest.name}
              </Tag>
            ))}
          </Space>
        </div>
      )}
    </div>
  );
}

export default InterestTags;
