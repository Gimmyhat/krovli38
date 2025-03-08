import crypto from 'crypto';
import dotenv from 'dotenv';

dotenv.config();

class CloudinaryService {
  /**
   * Генерирует подпись для безопасной загрузки на Cloudinary
   * @param params Параметры для подписи
   * @returns Сгенерированная подпись
   */
  static generateSignature(params: Record<string, any>): string {
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
    
    // Создаем строку параметров в формате key=value&key2=value2...
    const paramString = Object.keys(params)
      .sort()
      .map(key => `${key}=${params[key]}`)
      .join('&');
    
    // Добавляем API Secret и вычисляем SHA-1 хеш
    return crypto
      .createHash('sha1')
      .update(paramString + apiSecret)
      .digest('hex');
  }

  /**
   * Валидирует уведомление от Cloudinary
   * @param signature Подпись от Cloudinary
   * @param publicId ID ресурса
   * @param version Версия ресурса
   * @returns true если подпись действительна
   */
  static validateNotification(signature: string, publicId: string, version: string): boolean {
    const apiSecret = process.env.CLOUDINARY_API_SECRET || '';
    const expectedSignature = crypto
      .createHash('sha1')
      .update(`public_id=${publicId}&version=${version}${apiSecret}`)
      .digest('hex');
    
    return expectedSignature === signature;
  }
}

export default CloudinaryService; 