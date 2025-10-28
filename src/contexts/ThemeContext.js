import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('dark'); // Всегда темная тема

  useEffect(() => {
    // Сохраняем тему в localStorage
    localStorage.setItem('theme', 'dark');
    
    // Применяем тему к body
    document.body.className = 'dark-theme';
    
    // Обновляем meta тег для браузера
    const metaThemeColor = document.querySelector('meta[name="theme-color"]');
    if (metaThemeColor) {
      metaThemeColor.content = '#001529';
    }
  }, []);

  const value = {
    theme: 'dark',
    toggleTheme: () => {}, // Пустая функция, переключение отключено
    isDark: true,
    isLight: false
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
