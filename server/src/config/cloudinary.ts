import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

/**
 * Настройка подключения к Cloudinary
 * Параметры берутся из переменных окружения
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
});

// Логируем настройки Cloudinary для отладки
console.log('Cloudinary config loaded:', {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET ? 'Установлен' : 'Не установлен',
  upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
});

interface UploadOptions {
  folder?: string;
  tags?: string[];
  [key: string]: any;
}

/**
 * Загрузка изображения в Cloudinary
 * @param {Buffer} fileBuffer - Буфер файла изображения
 * @param {UploadOptions} options - Настройки загрузки
 * @returns {Promise<UploadApiResponse>} - Промис с результатом загрузки
 */
export const uploadImage = async (
  buffer: Buffer, 
  options: {
    folder?: string;
    tags?: string[];
    [key: string]: any;
  } = {}
): Promise<UploadApiResponse> => {
  try {
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || 'krovli38',
      resource_type: 'auto' as 'auto',
      ...options
    };

    // Загружаем буфер как стрим
    return new Promise<UploadApiResponse>((resolve, reject) => {
      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) {
          return reject(error);
        }
        if (!result) {
          return reject(new Error('Пустой результат от Cloudinary'));
        }
        resolve(result as UploadApiResponse);
      }).end(buffer);
    });
  } catch (error) {
    console.error('Ошибка при загрузке изображения в Cloudinary:', error);
    throw error;
  }
};

/**
 * Удаление изображения из Cloudinary
 * @param {String} publicId - Публичный ID изображения
 * @returns {Promise} - Промис с результатом удаления
 */
export const deleteImage = async (publicId: string): Promise<any> => {
  try {
    return await cloudinary.uploader.destroy(publicId);
  } catch (error) {
    console.error(`Ошибка при удалении изображения ${publicId} из Cloudinary:`, error);
    throw error;
  }
};

// Создание Upload Preset если его нет
export const ensureUploadPreset = async (presetName = 'krovli38_preset') => {
  try {
    console.log('Проверка наличия Upload Preset:', presetName);
    
    // Проверяем настройки Cloudinary перед запросом
    console.log('Проверка настроек Cloudinary перед запросом Upload Preset:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Установлен' : 'Не установлен'
    });
    
    // Проверяем, существует ли уже пресет
    try {
      const { presets } = await cloudinary.api.upload_presets({ max_results: 500 });
      console.log(`Получено ${presets.length} пресетов из Cloudinary`);
      
      const existingPreset = presets.find((preset: any) => preset.name === presetName);
      
      if (existingPreset) {
        console.log(`Upload preset '${presetName}' уже существует:`, {
          name: existingPreset.name,
          folder: existingPreset.folder,
          unsigned: existingPreset.unsigned
        });
        return existingPreset;
      }
      
      console.log(`Upload preset '${presetName}' не найден, создаем новый`);
      
      // Создаем новый пресет
      const result = await cloudinary.api.create_upload_preset({
        name: presetName,
        unsigned: true,
        folder: 'krovli38',
        allowed_formats: 'jpg,jpeg,png,gif,webp',
        auto_tagging: true
      });
      
      console.log(`Создан новый upload preset '${presetName}':`, {
        name: result.name,
        folder: result.folder,
        unsigned: result.unsigned
      });
      
      return result;
    } catch (apiError: any) {
      console.error('Ошибка при запросе к Cloudinary API:', apiError);
      console.error('Детали ошибки API:', {
        message: apiError.message,
        code: apiError.code,
        http_code: apiError.http_code,
        name: apiError.name
      });
      
      // Если ошибка связана с аутентификацией, попробуем переинициализировать конфигурацию
      if (apiError.http_code === 401 || apiError.message?.includes('authentication')) {
        console.log('Переинициализация конфигурации Cloudinary...');
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true
        });
        
        // Создаем пресет напрямую без проверки существования
        try {
          const result = await cloudinary.api.create_upload_preset({
            name: presetName,
            unsigned: true,
            folder: 'krovli38',
            allowed_formats: 'jpg,jpeg,png,gif,webp',
            auto_tagging: true
          });
          
          console.log(`Создан новый upload preset '${presetName}' после переинициализации:`, {
            name: result.name,
            folder: result.folder,
            unsigned: result.unsigned
          });
          
          return result;
        } catch (retryError: any) {
          console.error('Ошибка при повторной попытке создания upload preset:', retryError);
          throw retryError;
        }
      }
      
      throw apiError;
    }
  } catch (error: any) {
    console.error('Ошибка при создании upload preset:', error);
    console.error('Детали ошибки:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    throw error;
  }
};

// Экспортируем объект cloudinary для доступа к v2 API
const cloudinaryConfig = {
  uploadImage,
  deleteImage,
  ensureUploadPreset,
  v2: cloudinary
};

export default cloudinaryConfig; 