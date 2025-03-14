import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Настройка подключения к Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Выводим настройки
console.log('Cloudinary config:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Установлен' : 'Не установлен',
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
});

// Тестируем подключение
async function testCloudinary() {
  try {
    // Тест 1: Ping
    console.log('Тест 1: Ping');
    try {
      const pingResult = await cloudinary.api.ping();
      console.log('Ping успешен:', pingResult);
    } catch (error) {
      console.error('Ошибка при ping:', error);
    }

    // Тест 2: Получение списка пресетов
    console.log('\nТест 2: Получение списка пресетов');
    try {
      const { presets } = await cloudinary.api.upload_presets({ max_results: 10 });
      console.log(`Получено ${presets.length} пресетов`);
      presets.forEach((preset: any) => {
        console.log(`- ${preset.name} (${preset.unsigned ? 'unsigned' : 'signed'})`);
      });
    } catch (error) {
      console.error('Ошибка при получении пресетов:', error);
    }

    // Тест 3: Получение информации о ресурсе
    console.log('\nТест 3: Получение информации о ресурсе');
    try {
      // Используем известный public_id из вашей системы
      const publicId = 'krovli38/content/sample';
      const result = await cloudinary.api.resource(publicId);
      console.log('Информация о ресурсе:', {
        public_id: result.public_id,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height
      });
    } catch (error) {
      console.error('Ошибка при получении информации о ресурсе:', error);
    }
  } catch (error) {
    console.error('Общая ошибка:', error);
  }
}

// Запускаем тесты
testCloudinary().then(() => {
  console.log('Тесты завершены');
}).catch(error => {
  console.error('Ошибка при выполнении тестов:', error);
}); 