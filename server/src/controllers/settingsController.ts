import { Request, Response } from 'express';
import SiteSettings from '../models/SiteSettings';
// Импортируем из директории utils через индексный файл
import { getDefaultSettings } from '../utils';

// Временная реализация для отладки
// const getDefaultSettings = () => {
//   return [];
// };

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
        const defaultSettings = getDefaultSettings();
        console.log('Default settings loaded, count:', defaultSettings.length);
        
        if (defaultSettings && Array.isArray(defaultSettings) && defaultSettings.length > 0) {
          // Проверяем структуру каждого объекта настроек перед вставкой
          const validSettings = defaultSettings.filter(setting => 
            setting && 
            typeof setting === 'object' && 
            'key' in setting && 
            'type' in setting && 
            'group' in setting && 
            'value' in setting
          );
          
          if (validSettings.length > 0) {
            console.log('Valid settings to insert:', validSettings.length);
            await SiteSettings.insertMany(validSettings);
            return res.status(200).json(validSettings);
          } else {
            console.error('No valid settings found in default settings');
            return res.status(200).json([]);
          }
        } else {
          console.error('Default settings are empty or not an array');
          return res.status(200).json([]);
        }
      } catch (initError) {
        console.error('Error initializing default settings:', initError);
        return res.status(200).json([]);
      }
    }
    
    return res.status(200).json(settings);
  } catch (error: any) {
    console.error('Error fetching settings:', error);
    return res.status(500).json({ message: 'Ошибка при получении настроек', error: error.message });
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