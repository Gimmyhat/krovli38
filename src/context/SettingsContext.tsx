import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { API_URL } from '../config';

// Интерфейсы для типизации
interface SettingsContextType {
  settings: Record<string, any>;
  isLoading: boolean;
  error: string | null;
  refreshSettings: () => Promise<void>;
}

// Контекст настроек по умолчанию
const SettingsContext = createContext<SettingsContextType>({
  settings: {},
  isLoading: true,
  error: null,
  refreshSettings: async () => {}
});

// Хук для использования контекста настроек
export const useSettings = () => useContext(SettingsContext);

// Провайдер контекста настроек
export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<number>(Date.now());

  // Функция загрузки настроек, вынесенная для возможности повторного вызова
  const fetchSettings = useCallback(async () => {
    setIsLoading(true);
    try {
      // Добавляем случайный параметр для предотвращения кэширования
      const timestamp = Date.now();
      const response = await fetch(`${API_URL}/settings?t=${timestamp}`);
      
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
      setLastUpdated(timestamp);
      console.log('Настройки обновлены:', timestamp);
    } catch (error) {
      console.error('Ошибка при загрузке настроек:', error);
      setError('Не удалось загрузить настройки сайта');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Функция для принудительного обновления настроек
  const refreshSettings = useCallback(async () => {
    await fetchSettings();
  }, [fetchSettings]);

  // Загрузка настроек при монтировании компонента
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  // Периодическое обновление настроек (каждые 5 минут)
  useEffect(() => {
    const intervalId = setInterval(() => {
      fetchSettings();
    }, 5 * 60 * 1000); // 5 минут
    
    return () => clearInterval(intervalId);
  }, [fetchSettings]);

  // Объект значения контекста
  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error,
    refreshSettings
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
};

export default SettingsContext; 