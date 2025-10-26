import React, { useState, useCallback } from 'react';
import { AutoComplete, Input, message } from 'antd';
import { EnvironmentOutlined } from '@ant-design/icons';
import axios from 'axios';

const AddressAutocomplete = ({ value, onChange, placeholder = "Введите адрес", ...props }) => {
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [autocompleteEnabled, setAutocompleteEnabled] = useState(true);

  const handleSearch = useCallback(async (searchText) => {
    if (!searchText || searchText.length < 3) {
      setOptions([]);
      return;
    }

    // Если автодополнение отключено, не делаем запросы
    if (!autocompleteEnabled) {
      setOptions([]);
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post('/api/suggest-address', {
        query: searchText
      });

      const suggestions = response.data.suggestions || [];
      const formattedOptions = suggestions.map((suggestion, index) => ({
        value: suggestion.value,
        label: (
          <div>
            <div style={{ fontWeight: 'bold' }}>{suggestion.value}</div>
            {suggestion.unrestricted_value && suggestion.unrestricted_value !== suggestion.value && (
              <div style={{ fontSize: '12px', color: '#666' }}>
                {suggestion.unrestricted_value}
              </div>
            )}
          </div>
        ),
        key: index
      }));

      setOptions(formattedOptions);
    } catch (error) {
      console.error('Error fetching address suggestions:', error);
      if (error.response?.status === 400) {
        // Автодополнение отключено или токен не настроен
        setAutocompleteEnabled(false);
        setOptions([]);
        // Не показываем ошибку пользователю, просто отключаем автодополнение
      } else {
        message.error('Ошибка при получении подсказок адреса');
        setOptions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [autocompleteEnabled]);

  const handleSelect = (value, option) => {
    onChange?.(value);
  };

  const handleChange = (value) => {
    onChange?.(value);
  };

  return (
    <AutoComplete
      value={value}
      options={options}
      onSearch={handleSearch}
      onSelect={handleSelect}
      onChange={handleChange}
      loading={loading}
      placeholder={placeholder}
      notFoundContent={
        loading 
          ? "Поиск..." 
          : autocompleteEnabled 
            ? "Начните вводить адрес" 
            : "Автодополнение отключено"
      }
      {...props}
    >
      <Input
        prefix={<EnvironmentOutlined />}
        placeholder={placeholder}
        allowClear
      />
    </AutoComplete>
  );
};

export default AddressAutocomplete;
