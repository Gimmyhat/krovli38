import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import sharp from 'sharp';
import { mediaService, MediaOptions } from '../services/media/media-service';
import { logger } from '../utils/logger';

const router = express.Router();

// Создаем директории для загрузки, если они не существуют
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
const thumbnailsDir = path.join(process.cwd(), 'public', 'uploads', 'thumbnails');

if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

if (!fs.existsSync(thumbnailsDir)) {
  fs.mkdirSync(thumbnailsDir, { recursive: true });
}

// Настройка хранилища multer
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (_req, file, cb) => {
    const extension = path.extname(file.originalname);
    const filename = `${uuidv4()}${extension}`;
    cb(null, filename);
  }
});

// Фильтр для проверки типа файла
const fileFilter = (_req: express.Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`Неподдерживаемый тип файла. Разрешены только: ${allowedMimeTypes.join(', ')}`));
  }
};

// Настройка загрузки
const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  }
});

// Интерфейсы для типизации
interface ImageMetadata {
  id: string;
  fileName: string;
  thumbnailName: string;
  originalName: string;
  mimeType: string;
  size: number;
  width?: number;
  height?: number;
  alt?: string;
  title?: string;
  type?: string;
  section?: string;
  tags?: string[];
  uploadedAt: Date;
  updatedAt?: Date;
}

interface QueryOptions {
  page?: number;
  limit?: number;
  search?: string;
  type?: string;
  section?: string;
  tags?: string[];
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
}

// База данных в памяти для хранения метаданных изображений
let imagesMetadata: ImageMetadata[] = [];

/**
 * @route POST /api/media/upload
 * @desc Загрузка изображения
 * @access Private
 */
router.post('/upload', upload.single('image'), async (req, res): Promise<void> => {
  try {
    const file = req.file;
    
    if (!file) {
      res.status(400).json({ success: false, message: 'Файл не был загружен' });
      return;
    }
    
    // Получение метаданных из запроса
    const metadataJson = req.body.metadata || '{}';
    let metadata: any;
    
    try {
      metadata = JSON.parse(metadataJson);
    } catch (error) {
      res.status(400).json({ success: false, message: 'Неверный формат метаданных' });
      return;
    }
    
    // Создание миниатюры
    const thumbnailName = `thumb_${file.filename}`;
    const thumbnailPath = path.join(thumbnailsDir, thumbnailName);
    
    // Получение размеров изображения
    const imageInfo = await sharp(file.path).metadata();
    
    // Создание миниатюры (пропорционально уменьшенной до 300px)
    await sharp(file.path)
      .resize({
        width: 300,
        height: 300,
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(thumbnailPath);
    
    // Создание записи метаданных
    const imageId = uuidv4();
    
    const imageMetadata: ImageMetadata = {
      id: imageId,
      fileName: file.filename,
      thumbnailName,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      width: imageInfo.width,
      height: imageInfo.height,
      alt: metadata.alt || file.originalname,
      title: metadata.title || file.originalname,
      type: metadata.type || 'content',
      section: metadata.section || 'general',
      tags: metadata.tags || [],
      uploadedAt: new Date()
    };
    
    // Добавление в "базу данных"
    imagesMetadata.push(imageMetadata);
    
    // Отправка ответа
    res.status(201).json({
      success: true,
      message: 'Файл успешно загружен',
      data: {
        ...imageMetadata,
        urls: {
          original: `/uploads/${file.filename}`,
          thumbnail: `/uploads/thumbnails/${thumbnailName}`
        }
      }
    });
    
  } catch (error: any) {
    console.error('Ошибка при загрузке файла:', error);
    res.status(500).json({
      success: false,
      message: `Ошибка при загрузке файла: ${error.message}`
    });
  }
});

/**
 * @route GET /api/media/list
 * @desc Получение списка всех изображений
 * @access Private
 */
router.get('/list', async (req, res): Promise<void> => {
  try {
    const media = await mediaService.getImages();
    res.json({
      success: true,
      data: media
    });
  } catch (error: any) {
    console.error('Ошибка при получении списка изображений:', error);
    res.status(500).json({
      success: false,
      message: 'Не удалось получить список изображений',
      error: error.message
    });
  }
});

/**
 * @route GET /api/media/:id
 * @desc Получение изображения по ID
 * @access Private
 */
router.get('/:id', async (req, res): Promise<void> => {
  try {
    const image = await mediaService.getImageById(req.params.id);
    
    if (!image) {
      res.status(404).json({
        success: false,
        message: 'Изображение не найдено'
      });
      return;
    }
    
    // Добавляем URL-ы к изображению
    const urls = mediaService.getImageUrl(image);
    
    res.json({
      success: true,
      data: {
        ...image,
        urls
      }
    });
  } catch (error: any) {
    console.error(`Ошибка при получении изображения с ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Не удалось получить изображение',
      error: error.message
    });
  }
});

/**
 * @route PUT /api/media/:id
 * @desc Обновление метаданных изображения
 * @access Private
 */
router.put('/:id', async (req, res): Promise<void> => {
  try {
    // Проверяем наличие данных
    if (!req.body || Object.keys(req.body).length === 0) {
      res.status(400).json({ 
        success: false, 
        message: 'Не указаны данные для обновления' 
      });
      return;
    }
    
    // Обновляем метаданные
    const updatedImage = await mediaService.updateMetadata(req.params.id, req.body);
    
    if (!updatedImage) {
      res.status(404).json({ 
        success: false, 
        message: 'Изображение не найдено' 
      });
      return;
    }
    
    // Добавляем URL-ы к изображению
    const urls = mediaService.getImageUrl(updatedImage);
    
    res.json({
      success: true,
      data: {
        ...updatedImage,
        urls
      }
    });
  } catch (error: any) {
    console.error(`Ошибка при обновлении изображения с ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Не удалось обновить метаданные изображения',
      error: error.message
    });
  }
});

/**
 * @route DELETE /api/media/:id
 * @desc Удаление изображения
 * @access Private
 */
router.delete('/:id', async (req, res): Promise<void> => {
  try {
    const result = await mediaService.deleteImage(req.params.id);
    
    if (!result.success) {
      res.status(404).json({ 
        success: false, 
        message: 'Изображение не найдено' 
      });
      return;
    }
    
    res.json({
      success: true,
      message: 'Изображение успешно удалено',
      data: result.data
    });
  } catch (error: any) {
    console.error(`Ошибка при удалении изображения с ID ${req.params.id}:`, error);
    res.status(500).json({
      success: false,
      message: 'Не удалось удалить изображение',
      error: error.message
    });
  }
});

export default router; 