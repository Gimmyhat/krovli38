import dotenv from 'dotenv';
import mongoose from 'mongoose';
import SiteSettings from '../models/SiteSettings';

// Загружаем переменные окружения
dotenv.config();

/**
 * Скрипт для добавления настройки размера логотипа в базу данных
 */
async function addLogoSizeSetting() {
  try {
    // Подключаемся к MongoDB
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:admin_password@localhost:27017/krovli38?authSource=admin';
    
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Проверяем, существует ли уже настройка
    const existingSetting = await SiteSettings.findOne({ key: 'logo_size' });
    
    if (existingSetting) {
      console.log('Настройка logo_size уже существует в базе данных');
      return;
    }

    // Создаем новую настройку для размера логотипа
    const logoSizeSetting = new SiteSettings({
      key: 'logo_size',
      name: 'Размер логотипа',
      type: 'number',
      group: 'general',
      value: 96,
      defaultValue: 96,
      options: { min: 32, max: 256 },
      description: 'Размер логотипа в пикселях (высота)',
      order: 2
    });

    // Сохраняем настройку в базе данных
    await logoSizeSetting.save();
    console.log('Настройка logo_size успешно добавлена в базу данных');

    // Обновляем порядковые номера других настроек в группе general
    await SiteSettings.updateMany(
      { group: 'general', key: { $ne: 'logo_size' }, order: { $gte: 2 } },
      { $inc: { order: 1 } }
    );
    
    console.log('Порядковые номера других настроек обновлены');

  } catch (error) {
    console.error('Ошибка при добавлении настройки:', error);
  } finally {
    // Закрываем соединение с MongoDB
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

// Запускаем функцию
addLogoSizeSetting()
  .then(() => console.log('Скрипт завершен'))
  .catch(err => console.error('Ошибка выполнения скрипта:', err)); 