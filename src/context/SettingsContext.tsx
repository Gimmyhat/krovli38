import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { API_URL } from '../config';

// Интерфейсы для типизации
interface SettingsContextType {
  settings: Record<string, any>;
  isLoading: boolean;
  error: string | null;
}

// Контекст настроек по умолчанию
const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  isLoading: true,
  error: null
});

// Хук для использования контекста настроек
export const useSettings = () => useContext(SettingsContext);

// Провайдер контекста настроек
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch(`${API_URL}/settings`);
        
        if (!response.ok) {
          throw new Error(`Ошибка: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Преобразуем массив настроек в объект для удобства доступа по ключу
        const settingsObj: Record<string, any> = {};
        data.forEach((item: any) => {
          settingsObj[item.key] = item.value;
        });
        
        setSettings(settingsObj);
        setError(null);
      } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
        setError('Не удалось загрузить настройки сайта');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  // Объект значения контекста
  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext; 