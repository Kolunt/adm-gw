import React, { useState, useEffect, useCallback } from 'react';
import { Select, Tag, message, Space, AutoComplete } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
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

  const handleSelectExisting = (value, option) => {
    const interest = searchResults.find(i => i.id === parseInt(value));
    if (interest && !selectedInterests.some(i => i.id === interest.id)) {
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

  const handlePressEnter = () => {
    if (searchValue && searchValue.trim()) {
      handleAddInterest(searchValue);
    }
  };

  // Подготавливаем опции для автокомплита
  const autocompleteOptions = searchResults.map(interest => ({
    value: interest.id.toString(),
    label: interest.name
  }));

  // Добавляем опцию для создания нового интереса, если его нет в результатах
  if (searchValue && searchValue.trim() && 
      !searchResults.some(interest => interest.name.toLowerCase() === searchValue.toLowerCase())) {
    autocompleteOptions.push({
      value: `create:${searchValue}`,
      label: `Создать "${searchValue}"`
    });
  }

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

      {/* Поле автокомплита */}
      <AutoComplete
        value={searchValue}
        options={autocompleteOptions}
        onSearch={handleSearch}
        onSelect={(value, option) => {
          if (value.startsWith('create:')) {
            const interestName = value.replace('create:', '');
            handleAddInterest(interestName);
          } else {
            handleSelectExisting(value, option);
          }
        }}
        onPressEnter={handlePressEnter}
        placeholder={placeholder}
        style={{ width: '100%', marginBottom: '12px' }}
        filterOption={false}
        notFoundContent={searchLoading ? "Поиск..." : "Введите название интереса"}
      />

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
