import mongoose from 'mongoose';
import SiteSettings from '../models/SiteSettings';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

/**
 * Добавляет настройку отступов логотипа
 */
async function addLogoMarginSetting() {
  try {
    // Подключаемся к MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/krovli38');
    console.log('Connected to MongoDB');

    // Проверяем, существует ли настройка
    const existingSetting = await SiteSettings.findOne({ key: 'logo_margin' });

    if (existingSetting) {
      console.log('Настройка logo_margin уже существует');
    } else {
      // Создаем новую настройку
      const newSetting = new SiteSettings({
        key: 'logo_margin',
        name: 'Отступы логотипа',
        type: 'number',
        group: 'general',
        value: -4,
        defaultValue: -4,
        options: { min: -16, max: 16 },
        description: 'Отступы логотипа от краев (отрицательные значения уменьшают отступы)',
        order: 4
      });

      await newSetting.save();
      console.log('Настройка logo_margin успешно добавлена');
    }

    // Отключаемся от MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  } catch (error) {
    console.error('Ошибка при добавлении настройки logo_margin:', error);
    process.exit(1);
  }
}

// Запускаем функцию
addLogoMarginSetting(); 