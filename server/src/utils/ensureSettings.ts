import mongoose from 'mongoose';
import SiteSettings from '../models/SiteSettings';
import { logger } from './logger';
import { getDefaultSettings } from './defaultSettings';

/**
 * Проверяет наличие всех настроек в базе данных и добавляет отсутствующие
 */
export const ensureAllSettings = async (): Promise<void> => {
  try {
    // Получаем все настройки по умолчанию
    const defaultSettings = getDefaultSettings();
    const defaultKeys = defaultSettings.map(setting => setting.key);
    
    // Получаем все существующие настройки из базы данных
    const existingSettings = await SiteSettings.find({});
    const existingKeys = existingSettings.map(setting => setting.key);
    
    // Находим настройки, которых нет в базе данных
    const missingKeys = defaultKeys.filter(key => !existingKeys.includes(key));
    
    if (missingKeys.length === 0) {
      logger.info('Все настройки уже присутствуют в базе данных');
      return;
    }
    
    // Добавляем отсутствующие настройки
    for (const key of missingKeys) {
      const defaultSetting = defaultSettings.find(setting => setting.key === key);
      if (defaultSetting) {
        const newSetting = new SiteSettings(defaultSetting);
        await newSetting.save();
        logger.info(`Добавлена отсутствующая настройка: ${key}`);
      }
    }
    
    logger.info(`Добавлено ${missingKeys.length} отсутствующих настроек`);
  } catch (error) {
    logger.error('Ошибка при проверке настроек:', { error });
  }
};

/**
 * Проверяет наличие конкретной настройки и добавляет её, если отсутствует
 */
export const ensureSetting = async (key: string): Promise<void> => {
  try {
    // Проверяем, существует ли уже настройка
    const existingSetting = await SiteSettings.findOne({ key });
    
    if (existingSetting) {
      logger.info(`Настройка ${key} уже существует в базе данных`);
      return;
    }
    
    // Получаем настройку по умолчанию
    const defaultSettings = getDefaultSettings();
    const defaultSetting = defaultSettings.find(setting => setting.key === key);
    
    if (!defaultSetting) {
      logger.warn(`Настройка ${key} не найдена в списке настроек по умолчанию`);
      return;
    }
    
    // Создаем новую настройку
    const newSetting = new SiteSettings(defaultSetting);
    await newSetting.save();
    
    // Если это настройка с порядковым номером, обновляем порядковые номера других настроек
    if (defaultSetting.order && defaultSetting.group) {
      await SiteSettings.updateMany(
        { group: defaultSetting.group, key: { $ne: key }, order: { $gte: defaultSetting.order } },
        { $inc: { order: 1 } }
      );
    }
    
    logger.info(`Настройка ${key} успешно добавлена в базу данных`);
  } catch (error) {
    logger.error(`Ошибка при добавлении настройки ${key}:`, { error });
  }
}; 