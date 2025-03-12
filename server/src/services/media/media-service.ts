import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { logger } from '../../utils/logger';

// Типы для TypeScript
export interface MediaMetadata {
  id: string;
  originalName: string;
  fileName: string;
  thumbnailName: string;
  mimeType: string;
  size: number;
  width: number | null;
  height: number | null;
  alt?: string;
  title?: string;
  type?: string;
  tags?: string[];
  section?: string;
  uploadedAt: string;
  updatedAt?: string;
}

export interface MediaFile {
  buffer: Buffer;
  originalname: string;
  mimetype: string;
  size: number;
}

export interface MediaOptions {
  alt?: string;
  title?: string;
  type?: string;
  tags?: string[];
  section?: string;
}

export interface MediaResult {
  success: boolean;
  data?: any;
  error?: string;
}

class MediaService {
  private uploadDir: string;
  private metadataDir: string;

  constructor() {
    // Пути к директориям
    this.uploadDir = path.join(process.cwd(), 'public', 'uploads');
    this.metadataDir = path.join(this.uploadDir, 'metadata');
    
    // Создаем директории, если их нет
    this.ensureDirectories();
  }

  /**
   * Создание необходимых директорий
   */
  private async ensureDirectories(): Promise<void> {
    try {
      await fs.promises.mkdir(this.uploadDir, { recursive: true });
      await fs.promises.mkdir(this.metadataDir, { recursive: true });
      logger.info('Media directories created successfully');
    } catch (error: any) {
      logger.error('Error creating media directories', error);
      throw new Error('Failed to create media directories');
    }
  }

  /**
   * Сохранение изображения с генерацией миниатюры
   */
  async saveImage(file: MediaFile, options: MediaOptions = {}): Promise<MediaMetadata> {
    try {
      const id = uuidv4();
      const fileExt = path.extname(file.originalname).toLowerCase();
      const fileName = `${id}${fileExt}`;
      const filePath = path.join(this.uploadDir, fileName);
      
      // Создаем экземпляр Sharp для обработки изображения
      const image = sharp(file.buffer);
      
      // Получаем метаданные изображения
      const imageInfo = await image.metadata();
      
      // Создаем и сохраняем миниатюру
      const thumbnailName = `thumbnail_${fileName}`;
      const thumbnailPath = path.join(this.uploadDir, thumbnailName);
      
      await image.clone()
        .resize({
          width: 200,
          height: 200,
          fit: 'inside',
          withoutEnlargement: true
        })
        .toFile(thumbnailPath);
      
      // Сохраняем оригинальное изображение
      await fs.promises.writeFile(filePath, file.buffer);
      
      // Создаем метаданные
      const metadata: MediaMetadata = {
        id,
        originalName: file.originalname,
        fileName,
        thumbnailName,
        mimeType: file.mimetype,
        size: file.size,
        width: imageInfo.width || null,
        height: imageInfo.height || null,
        alt: options.alt || file.originalname.replace(/\.[^/.]+$/, ""),
        title: options.title || file.originalname.replace(/\.[^/.]+$/, ""),
        type: options.type || 'content',
        tags: options.tags || [],
        section: options.section || 'general',
        uploadedAt: new Date().toISOString()
      };
      
      // Сохраняем метаданные
      await this.saveMetadata(id, metadata);
      
      logger.info(`Image saved successfully: ${id}`);
      return metadata;
    } catch (error: any) {
      logger.error('Error saving image', error);
      throw new Error(`Failed to save image: ${error.message}`);
    }
  }

  /**
   * Сохранение метаданных в JSON-файл
   */
  async saveMetadata(id: string, metadata: MediaMetadata): Promise<MediaMetadata> {
    try {
      const metadataPath = path.join(this.metadataDir, `${id}.json`);
      await fs.promises.writeFile(
        metadataPath,
        JSON.stringify(metadata, null, 2)
      );
      
      return metadata;
    } catch (error: any) {
      logger.error(`Error saving metadata for image ${id}`, error);
      throw new Error(`Failed to save metadata: ${error.message}`);
    }
  }

  /**
   * Обновление метаданных
   */
  async updateMetadata(id: string, updates: Partial<MediaMetadata>): Promise<MediaMetadata> {
    try {
      // Получаем текущие метаданные
      const currentMetadata = await this.getImageById(id);
      if (!currentMetadata) {
        throw new Error(`Image with ID ${id} not found`);
      }
      
      // Обновляем метаданные
      const updatedMetadata: MediaMetadata = {
        ...currentMetadata,
        ...updates,
        updatedAt: new Date().toISOString()
      };
      
      // Сохраняем обновленные метаданные
      await this.saveMetadata(id, updatedMetadata);
      
      return updatedMetadata;
    } catch (error: any) {
      logger.error(`Error updating metadata for image ${id}`, error);
      throw new Error(`Failed to update metadata: ${error.message}`);
    }
  }

  /**
   * Получение списка всех изображений
   */
  async getImages(): Promise<MediaMetadata[]> {
    try {
      const files = await fs.promises.readdir(this.metadataDir);
      
      const images: MediaMetadata[] = [];
      for (const file of files) {
        if (file.endsWith('.json')) {
          const data = await fs.promises.readFile(
            path.join(this.metadataDir, file),
            'utf8'
          );
          images.push(JSON.parse(data));
        }
      }
      
      // Сортируем по дате загрузки (новые в начале)
      return images.sort((a, b) => {
        return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      });
    } catch (error: any) {
      logger.error('Error getting images', error);
      throw new Error(`Failed to get images: ${error.message}`);
    }
  }

  /**
   * Получение изображения по ID
   */
  async getImageById(id: string): Promise<MediaMetadata | null> {
    try {
      const metadataPath = path.join(this.metadataDir, `${id}.json`);
      
      // Проверяем существование файла
      try {
        await fs.promises.access(metadataPath);
      } catch {
        return null;
      }
      
      // Читаем и возвращаем метаданные
      const data = await fs.promises.readFile(metadataPath, 'utf8');
      return JSON.parse(data);
    } catch (error: any) {
      logger.error(`Error getting image with ID ${id}`, error);
      throw new Error(`Failed to get image: ${error.message}`);
    }
  }

  /**
   * Удаление изображения по ID
   */
  async deleteImage(id: string): Promise<MediaResult> {
    try {
      const metadata = await this.getImageById(id);
      if (!metadata) {
        return { success: false, error: `Image with ID ${id} not found` };
      }
      
      // Удаляем файлы
      const filePath = path.join(this.uploadDir, metadata.fileName);
      const thumbnailPath = path.join(this.uploadDir, metadata.thumbnailName);
      const metadataPath = path.join(this.metadataDir, `${id}.json`);
      
      try {
        await fs.promises.unlink(filePath);
        await fs.promises.unlink(thumbnailPath);
        await fs.promises.unlink(metadataPath);
      } catch (err) {
        logger.error(`Error deleting files for image ${id}`, err);
        // Продолжаем, даже если какой-то файл не удалось удалить
      }
      
      logger.info(`Image ${id} deleted successfully`);
      return { success: true, data: { id } };
    } catch (error: any) {
      logger.error(`Error deleting image ${id}`, error);
      return { success: false, error: `Failed to delete image: ${error.message}` };
    }
  }

  /**
   * Получение URL изображения
   */
  getImageUrl(metadata: MediaMetadata): { original: string; thumbnail: string } {
    return {
      original: `/uploads/${metadata.fileName}`,
      thumbnail: `/uploads/${metadata.thumbnailName}`
    };
  }
}

// Создаем и экспортируем экземпляр сервиса
export const mediaService = new MediaService(); 