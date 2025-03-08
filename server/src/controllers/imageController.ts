import { Request, Response } from 'express';
import Image from '../models/Image';
import { uploadImage, deleteImage } from '../config/cloudinary';
import sharp from 'sharp';

// Расширение типа Express.Request для работы с multer
declare global {
  namespace Express {
    interface Request {
      file?: Express.Multer.File;
      files?: Express.Multer.File[] | { [fieldname: string]: Express.Multer.File[] };
    }
  }
}

// Интерфейс для результатов загрузки
interface UploadResult {
  error?: boolean;
  originalname?: string;
  message?: string;
  [key: string]: any;
}

/**
 * Загрузка одного изображения
 * @route POST /api/images/upload
 */
export const uploadSingleImage = async (req: Request, res: Response) => {
  try {
    // Проверяем наличие файла
    if (!req.file) {
      return res.status(400).json({ error: 'Файл не был загружен' });
    }

    // Получаем метаданные из формы
    const { type, alt, title, section, tags } = req.body;
    
    // Оптимизируем изображение с sharp перед загрузкой
    const processedBuffer = await sharp(req.file.buffer)
      .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
      .toBuffer();

    // Загружаем изображение в Cloudinary
    const result = await uploadImage(processedBuffer, {
      folder: `krovli38/${type || 'misc'}`,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
    });

    // Создаем запись в MongoDB
    const newImage = new Image({
      public_id: result.public_id,
      url: result.url,
      secure_url: result.secure_url,
      type: type || 'content',
      alt: alt || '',
      title: title || '',
      section: section || 'general',
      width: result.width,
      height: result.height,
      format: result.format,
      size: result.bytes,
      tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
    });

    // Сохраняем в БД
    await newImage.save();

    // Возвращаем результат
    res.status(201).json({
      message: 'Изображение успешно загружено',
      image: newImage
    });
  } catch (error: any) {
    console.error('Ошибка при загрузке изображения:', error);
    res.status(500).json({
      error: 'Ошибка при загрузке изображения',
      details: error.message
    });
  }
};

/**
 * Загрузка нескольких изображений
 * @route POST /api/images/upload/multiple
 */
export const uploadMultipleImages = async (req: Request, res: Response) => {
  try {
    // Проверяем наличие файлов
    if (!req.files || !Array.isArray(req.files) || req.files.length === 0) {
      return res.status(400).json({ error: 'Файлы не были загружены' });
    }
    
    // Получаем метаданные из формы
    const { type, section, tags } = req.body;

    // Результаты загрузки
    const uploadResults: UploadResult[] = [];

    // Обрабатываем каждый файл
    for (const file of req.files) {
      try {
        // Оптимизируем изображение
        const processedBuffer = await sharp(file.buffer)
          .resize({ width: 1920, height: 1080, fit: 'inside', withoutEnlargement: true })
          .toBuffer();

        // Загружаем в Cloudinary
        const result = await uploadImage(processedBuffer, {
          folder: `krovli38/${type || 'misc'}`,
          tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        });

        // Создаем запись в MongoDB
        const newImage = new Image({
          public_id: result.public_id,
          url: result.url,
          secure_url: result.secure_url,
          type: type || 'content',
          alt: '',
          title: '',
          section: section || 'general',
          width: result.width,
          height: result.height,
          format: result.format,
          size: result.bytes,
          tags: tags ? tags.split(',').map((tag: string) => tag.trim()) : [],
        });

        // Сохраняем в БД
        await newImage.save();

        // Добавляем в результаты
        uploadResults.push(newImage);
      } catch (fileError: any) {
        console.error(`Ошибка при обработке файла ${file.originalname}:`, fileError);
        uploadResults.push({
          error: true,
          originalname: file.originalname,
          message: fileError.message
        });
      }
    }

    // Возвращаем результаты
    res.status(201).json({
      message: 'Изображения обработаны',
      uploaded: uploadResults.filter(result => !result.error).length,
      failed: uploadResults.filter(result => result.error).length,
      images: uploadResults
    });
  } catch (error: any) {
    console.error('Ошибка при загрузке изображений:', error);
    res.status(500).json({
      error: 'Ошибка при загрузке изображений',
      details: error.message
    });
  }
};

/**
 * Получение списка изображений с пагинацией и фильтрами
 * @route GET /api/images
 */
export const getImages = async (req: Request, res: Response) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      type, 
      section, 
      tags, 
      isActive 
    } = req.query;

    const query: any = {};

    // Применяем фильтры, если они указаны
    if (type) query.type = type;
    if (section) query.section = section;
    if (typeof tags === 'string') {
      query.tags = { $in: tags.split(',').map((tag: string) => tag.trim()) };
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';

    // Считаем общее количество изображений по фильтру
    const total = await Image.countDocuments(query);

    // Получаем изображения с пагинацией
    const images = await Image.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit));

    // Отправляем результат
    res.json({
      images,
      totalPages: Math.ceil(total / Number(limit)),
      currentPage: Number(page),
      totalImages: total
    });
  } catch (error: any) {
    console.error('Ошибка при получении изображений:', error);
    res.status(500).json({
      error: 'Ошибка при получении изображений',
      details: error.message
    });
  }
};

/**
 * Получение одного изображения по ID
 * @route GET /api/images/:id
 */
export const getImageById = async (req: Request, res: Response) => {
  try {
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Изображение не найдено' });
    }

    res.json(image);
  } catch (error: any) {
    console.error('Ошибка при получении изображения:', error);
    res.status(500).json({
      error: 'Ошибка при получении изображения',
      details: error.message
    });
  }
};

/**
 * Обновление метаданных изображения
 * @route PUT /api/images/:id
 */
export const updateImage = async (req: Request, res: Response) => {
  try {
    const {
      alt,
      title,
      description,
      type,
      section,
      tags,
      order,
      isActive
    } = req.body;

    // Находим изображение
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Изображение не найдено' });
    }

    // Обновляем поля
    if (alt !== undefined) image.alt = alt;
    if (title !== undefined) image.title = title;
    if (description !== undefined) image.description = description;
    if (type) image.type = type;
    if (section) image.section = section;
    if (tags) {
      image.tags = Array.isArray(tags) 
        ? tags 
        : tags.split(',').map((tag: string) => tag.trim());
    }
    if (order !== undefined) image.order = order;
    if (isActive !== undefined) image.isActive = isActive;

    // Сохраняем изменения
    await image.save();

    res.json({
      message: 'Изображение успешно обновлено',
      image
    });
  } catch (error: any) {
    console.error('Ошибка при обновлении изображения:', error);
    res.status(500).json({
      error: 'Ошибка при обновлении изображения',
      details: error.message
    });
  }
};

/**
 * Удаление изображения
 * @route DELETE /api/images/:id
 */
export const deleteImageById = async (req: Request, res: Response) => {
  try {
    // Находим изображение
    const image = await Image.findById(req.params.id);

    if (!image) {
      return res.status(404).json({ error: 'Изображение не найдено' });
    }

    // Удаляем из Cloudinary
    await deleteImage(image.public_id);

    // Удаляем из БД
    await Image.deleteOne({ _id: req.params.id });

    res.json({
      message: 'Изображение успешно удалено',
      id: req.params.id
    });
  } catch (error: any) {
    console.error('Ошибка при удалении изображения:', error);
    res.status(500).json({
      error: 'Ошибка при удалении изображения',
      details: error.message
    });
  }
};

export default {
  uploadSingleImage,
  uploadMultipleImages,
  getImages,
  getImageById,
  updateImage,
  deleteImageById
}; 