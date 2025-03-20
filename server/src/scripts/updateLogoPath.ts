import mongoose from 'mongoose';
import SiteSettings from '../models/SiteSettings';
import dotenv from 'dotenv';
import { IMAGE_PATHS } from '../constants';

// Загружаем переменные окружения
dotenv.config();

async function updateLogoPath() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://admin:admin_password@mongodb:27017/krovli38?authSource=admin');
    console.log('Connected to MongoDB');

    // Создаем настройку для пути к логотипу, если она не существует
    const logoPathSetting = await SiteSettings.findOne({ key: 'logo_path' });
    
    if (!logoPathSetting) {
      const newLogoPathSetting = new SiteSettings({
        key: 'logo_path',
        name: 'Путь к логотипу',
        type: 'image',
        group: 'general',
        value: IMAGE_PATHS.LOGO,
        defaultValue: IMAGE_PATHS.LOGO,
        description: 'Путь к файлу логотипа сайта',
        order: 2,
        options: {
          type: 'logo',
          section: 'general'
        }
      });
      
      await newLogoPathSetting.save();
      console.log('Создана новая настройка для пути к логотипу');
    } else {
      logoPathSetting.type = 'image';
      logoPathSetting.value = IMAGE_PATHS.LOGO;
      logoPathSetting.options = {
        type: 'logo',
        section: 'general'
      };
      await logoPathSetting.save();
      console.log('Обновлен путь к логотипу');
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Скрипт завершен');
  }
}

updateLogoPath(); 