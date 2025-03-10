// Экспортируем функции из utils для улучшения импорта
export * from './logger';

// Импортируем настройки по умолчанию напрямую
import { getDefaultSettings as importedGetDefaultSettings } from './defaultSettings';

// Реэкспортируем функцию получения настроек
export const getDefaultSettings = () => {
  try {
    return importedGetDefaultSettings();
  } catch (error) {
    console.error('Error in getDefaultSettings:', error);
    return [];
  }
}; 