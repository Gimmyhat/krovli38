/**
 * Скрипт для тестирования подключения к Cloudinary API
 * 
 * Запуск: ts-node src/scripts/testCloudinary.ts
 */
import dotenv from 'dotenv';
import { v2 as cloudinary } from 'cloudinary';

// Загружаем переменные окружения
dotenv.config();

// Проверка наличия переменных окружения
console.log('Проверка переменных окружения:');
console.log(`CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME ? 'Установлено' : 'Не установлено'}`);
console.log(`CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY ? 'Установлено' : 'Не установлено'}`);
console.log(`CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'Установлено' : 'Не установлено'}`);

// Настройка подключения к Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || '',
  api_key: process.env.CLOUDINARY_API_KEY || '',
  api_secret: process.env.CLOUDINARY_API_SECRET || '',
  secure: true
});

async function testCloudinaryConnection() {
  console.log('\nПроверка подключения к Cloudinary...');
  
  try {
    // Проверка ping
    console.log('1. Тест ping API...');
    const pingResult = await cloudinary.api.ping();
    console.log('   Результат ping:', pingResult);
    
    // Проверка ресурсов
    console.log('\n2. Тест получения списка ресурсов...');
    const resourcesResult = await cloudinary.api.resources({
      max_results: 5,
      type: 'upload'
    });
    console.log('   Количество ресурсов:', resourcesResult.resources ? resourcesResult.resources.length : 0);
    
    // Проверка получения настроек
    console.log('\n3. Тест получения настроек Upload Preset...');
    const uploadPresets = await cloudinary.api.upload_presets();
    console.log('   Настройки загрузки:', uploadPresets.map((preset: any) => preset.name));
    
    console.log('\nВсе тесты выполнены успешно!');
    return true;
  } catch (error) {
    console.error('\nОшибка при тестировании подключения к Cloudinary:');
    console.error(error);
    
    // Разбор ошибки
    if ((error as any).error && (error as any).error.message) {
      console.error('Сообщение ошибки:', (error as any).error.message);
    }
    
    if ((error as any).http_code) {
      console.error('HTTP code:', (error as any).http_code);
    }
    
    return false;
  }
}

// Запускаем тестирование
testCloudinaryConnection()
  .then(success => {
    console.log(`\nИтог: ${success ? 'Подключение успешно' : 'Ошибка подключения'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(error => {
    console.error('Непредвиденная ошибка:', error);
    process.exit(1);
  }); 