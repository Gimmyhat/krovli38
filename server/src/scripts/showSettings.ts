import mongoose from 'mongoose';
import SiteSettings from '../models/SiteSettings';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

async function showSettings() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://mongodb:27017/krovli38');
    console.log('Connected to MongoDB');

    const settings = await SiteSettings.find().sort('order');
    console.log('\nТекущие настройки в базе данных:');
    settings.forEach((setting) => {
      console.log(`\nKey: ${setting.key}`);
      console.log(`Name: ${setting.name}`);
      console.log(`Value: ${setting.value}`);
      console.log(`Type: ${setting.type}`);
      console.log(`Order: ${setting.order}`);
      console.log(`Group: ${setting.group}`);
    });

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
    console.log('Скрипт завершен');
  }
}

showSettings(); 