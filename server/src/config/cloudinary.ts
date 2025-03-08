import { v2 as cloudinary } from 'cloudinary';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Настройка подключения к Cloudinary
 * Параметры берутся из переменных окружения
 */
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'dr0hjlr79',
  api_key: process.env.CLOUDINARY_API_KEY || '586934817968136',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'YqBkV_O8W2RwDIpOTuEea3ghoFA',
  secure: true
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
 * @returns {Promise<any>} - Промис с результатом загрузки
 */
export const uploadImage = (fileBuffer: Buffer, options: UploadOptions = {}): Promise<any> => {
  return new Promise((resolve, reject) => {
    const uploadOptions = {
      folder: 'krovli38',
      ...options
    };

    // Используем API для загрузки из буфера
    cloudinary.uploader.upload_stream(
      uploadOptions,
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
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
  return cloudinary.uploader.destroy(publicId);
};

export default cloudinary; 