import { Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';
// Импортируем из директории utils через индексный файл
import { getDefaultSettings } from '../utils';
import { logger } from '../utils/logger';

// Временная реализация для отладки
// const getDefaultSettings = () => {
//   return [];
// };

/**
 * Инициализация настроек из значений по умолчанию
 */
const initializeDefaultSettings = async () => {
  try {
    const defaultSettings = getDefaultSettings();
    logger.info('Loading default settings, count:', defaultSettings.length);
    
    if (!defaultSettings || !Array.isArray(defaultSettings) || defaultSettings.length === 0) {
      throw new Error('Default settings are empty or not an array');
    }
    
    // Проверяем структуру каждого объекта настроек перед вставкой
    const validSettings = defaultSettings.filter(setting => 
      setting && 
      typeof setting === 'object' && 
      'key' in setting && 
      'type' in setting && 
      'group' in setting && 
      'value' in setting
    );
    
    if (validSettings.length === 0) {
      throw new Error('No valid settings found in default settings');
    }
    
    logger.info('Valid settings to insert:', validSettings.length);
    
    // Удаляем все существующие настройки
    await SiteSettings.deleteMany({});
    
    // Вставляем новые настройки
    const insertedSettings = await SiteSettings.insertMany(validSettings);
    logger.info('Settings initialized successfully:', insertedSettings.length);
    
    return insertedSettings;
  } catch (error) {
    logger.error('Error initializing default settings:', error);
    throw error;
  }
};

/**
 * Получить все настройки сайта
 */
export const getAllSettings = async (req: Request, res: Response) => {
  try {
    // Проверим наличие параметра group
    const { group } = req.query;
    let query = {};
    
    if (group) {
      query = { group };
    }
    
    const settings = await SiteSettings.find(query).sort({ group: 1, order: 1 });
    
    // Если настроек нет, инициализируем их значениями по умолчанию
    if (settings.length === 0) {
      try {
        const initializedSettings = await initializeDefaultSettings();
        return res.status(200).json(initializedSettings);
      } catch (initError) {
        logger.error('Error initializing settings:', initError);
        return res.status(500).json({ 
          message: 'Ошибка при инициализации настроек', 
          error: initError instanceof Error ? initError.message : 'Unknown error' 
        });
      }
    }
    
    return res.status(200).json(settings);
  } catch (error: any) {
    logger.error('Error fetching settings:', error);
    return res.status(500).json({ 
      message: 'Ошибка при получении настроек', 
      error: error.message 
    });
  }
};

/**
 * Получить настройку по ключу
 */
export const getSettingByKey = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    
    const setting = await SiteSettings.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ message: 'Настройка не найдена' });
    }
    
    return res.status(200).json(setting);
  } catch (error) {
    console.error('Error fetching setting:', error);
    return res.status(500).json({ message: 'Ошибка при получении настройки' });
  }
};

/**
 * Обновить настройку
 */
export const updateSetting = async (req: Request, res: Response) => {
  try {
    const { key } = req.params;
    const { value } = req.body;
    
    if (value === undefined) {
      return res.status(400).json({ message: 'Значение настройки не указано' });
    }
    
    const setting = await SiteSettings.findOne({ key });
    
    if (!setting) {
      return res.status(404).json({ message: 'Настройка не найдена' });
    }
    
    setting.value = value;
    await setting.save();
    
    return res.status(200).json(setting);
  } catch (error) {
    console.error('Error updating setting:', error);
    return res.status(500).json({ message: 'Ошибка при обновлении настройки' });
  }
};

/**
 * Обновить группу настроек
 */
export const updateSettingsGroup = async (req: Request, res: Response) => {
  try {
    const { group } = req.params;
    const updates = req.body;
    
    if (!updates || typeof updates !== 'object') {
      return res.status(400).json({ message: 'Неверный формат данных' });
    }
    
    const updatedSettings = [];
    
    for (const [key, value] of Object.entries(updates)) {
      const setting = await SiteSettings.findOne({ key, group });
      
      if (setting) {
        setting.value = value;
        await setting.save();
        updatedSettings.push(setting);
      }
    }
    
    return res.status(200).json(updatedSettings);
  } catch (error) {
    console.error('Error updating settings group:', error);
    return res.status(500).json({ message: 'Ошибка при обновлении группы настроек' });
  }
};

/**
 * Сбросить настройки к значениям по умолчанию
 */
export const resetSettings = async (req: Request, res: Response) => {
  try {
    const { group } = req.query;
    let query = {};
    
    if (group) {
      query = { group };
    }
    
    const settings = await SiteSettings.find(query);
    
    for (const setting of settings) {
      setting.value = setting.defaultValue;
      await setting.save();
    }
    
    return res.status(200).json({ message: 'Настройки сброшены к значениям по умолчанию' });
  } catch (error) {
    console.error('Error resetting settings:', error);
    return res.status(500).json({ message: 'Ошибка при сбросе настроек' });
  }
};

/**
 * Очистить кэш настроек
 * Этот метод нужен для сигнализации клиентам о необходимости обновить настройки
 */
export const clearSettingsCache = async (req: Request, res: Response) => {
  try {
    // Поскольку мы не храним кэш на сервере, то просто возвращаем успешный результат
    // Клиенты при получении ответа на этот запрос будут обновлять свои данные
    
    // Для отладки запишем событие очистки кэша
    console.log('Запрос на очистку кэша настроек', new Date().toISOString());
    
    return res.status(200).json({ 
      message: 'Кэш настроек очищен', 
      timestamp: Date.now()
    });
  } catch (error) {
    console.error('Error clearing settings cache:', error);
    return res.status(500).json({ message: 'Ошибка при очистке кэша настроек' });
  }
};

/**
 * Полный сброс и реинициализация настроек
 */
export const reinitializeSettings = async (req: Request, res: Response) => {
  try {
    const initializedSettings = await initializeDefaultSettings();
    
    return res.status(200).json({ 
      message: 'Настройки успешно реинициализированы',
      settings: initializedSettings
    });
  } catch (error) {
    logger.error('Error reinitializing settings:', error);
    return res.status(500).json({ 
      message: 'Ошибка при реинициализации настроек',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}; 