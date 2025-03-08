import { v2 as cloudinary, UploadApiOptions, UploadApiResponse } from 'cloudinary';

/**
 * Настройка подключения к Cloudinary
 * Параметры берутся из переменных окружения
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
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
export const uploadImage = (fileBuffer: Buffer, options: UploadOptions = {}): Promise<UploadApiResponse> => {
  return new Promise((resolve, reject) => {
    const uploadOptions: UploadApiOptions = {
      folder: options.folder || 'krovli38',
      resource_type: 'auto',
      ...options
    };

    // Используем API для загрузки из буфера
    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result as UploadApiResponse);
      }
    ).end(fileBuffer);
  });
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
    console.error('Error deleting image from Cloudinary:', error);
    throw error;
  }
};

export default cloudinary; 