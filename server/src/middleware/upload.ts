import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import { Request, Response, NextFunction } from 'express';

// Настройка хранилища для multer (временное хранение в памяти)
const storage = multer.memoryStorage();

// Проверка типа файла
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Разрешенные типы файлов
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  
  if (allowedTypes.includes(file.mimetype)) {
    // Принимаем файл
    cb(null, true);
  } else {
    // Отклоняем файл
    cb(new Error('Неподдерживаемый формат файла. Поддерживаются только JPEG, PNG, GIF и WebP.'));
  }
};

// Настройки multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB максимальный размер
  },
  fileFilter: fileFilter
});

/**
 * Middleware для загрузки одного изображения
 * Использовать как:
 * router.post('/upload', uploadSingleImage, controller.uploadImage);
 */
export const uploadSingleImage = upload.single('image');

/**
 * Middleware для загрузки нескольких изображений
 * Использовать как:
 * router.post('/upload-multiple', uploadMultipleImages, controller.uploadImages);
 * Максимум 5 изображений за раз
 */
export const uploadMultipleImages = upload.array('images', 5);

/**
 * Обработка ошибок multer
 */
export const handleMulterError = (err: Error, req: Request, res: Response, next: NextFunction) => {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ 
        error: 'Размер файла превышает ограничение в 5MB' 
      });
    }
    
    if (err.code === 'LIMIT_FILE_COUNT') {
      return res.status(400).json({ 
        error: 'Превышено максимальное количество файлов (5)' 
      });
    }
    
    return res.status(400).json({ 
      error: `Ошибка загрузки файла: ${err.message}` 
    });
  }
  
  if (err) {
    return res.status(400).json({ 
      error: err.message || 'Произошла ошибка при загрузке файла' 
    });
  }
  
  next();
};

export default { uploadSingleImage, uploadMultipleImages, handleMulterError }; 