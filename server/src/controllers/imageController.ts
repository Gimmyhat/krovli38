import { Request, Response } from 'express';
import Image from '../models/Image';
import { uploadImage, deleteImage } from '../config/cloudinary';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { glob } from 'glob';
import { fileURLToPath } from 'url';

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

/**
 * Сканирует файловую систему для поиска изображений и создает записи в базе данных
 * @route GET /api/images/scan
 * @access Private (Admin only)
 */
export const scanAndMigrateImages = async (req: Request, res: Response) => {
  try {
    // Структура для хранения информации об изображениях
    const imageMapping: Record<string, { folder: string, type: string, images: any[] }> = {
      'hero': {
        folder: 'hero',
        type: 'hero',
        images: []
      },
      'services': {
        folder: 'services',
        type: 'service',
        images: []
      },
      'gallery': {
        folder: 'gallery',
        type: 'gallery',
        images: []
      }
    };

    console.log('Сканирование изображений в Docker-контейнере...');
    
    // Пути к директориям в контейнере
    const publicPath = path.resolve('/app/public');
    const componentsPath = path.resolve('/app/src/components');
    
    console.log(`Путь к public: ${publicPath}`);
    console.log(`Путь к компонентам: ${componentsPath}`);
    
    // Сканирование статических изображений
    const imageFiles = await glob([
      `${publicPath}/images/**/*.jpg`, 
      `${publicPath}/images/**/*.jpeg`, 
      `${publicPath}/images/**/*.png`, 
      `${publicPath}/images/**/*.gif`, 
      `${publicPath}/images/**/*.webp`
    ], { windowsPathsNoEscape: true });
    
    console.log(`Найдено ${imageFiles.length} изображений`);
    
    // Обработка найденных изображений
    for (const filePath of imageFiles) {
      const normalizedPath = filePath.replace(/\\/g, '/');
      const relativePath = normalizedPath.replace(`${publicPath}/`, '');
      const pathParts = relativePath.split('/');
      
      if (pathParts.length >= 2 && pathParts[0] === 'images') {
        const category = pathParts[1]; // hero, services, gallery и т.д.
        const filename = path.basename(normalizedPath);
        
        if (imageMapping[category]) {
          try {
            const fileStats = fs.statSync(filePath);
            
            // Информация об изображении
            const imageInfo = {
              path: normalizedPath,
              filename,
              size: fileStats.size,
              relativePath: `/images/${category}/${filename}`,
              category,
              uploaded: false
            };
            
            imageMapping[category].images.push(imageInfo);
            console.log(`Найдено изображение: ${category}/${filename}`);
          } catch (err) {
            console.error(`Ошибка при обработке файла ${filePath}:`, err);
          }
        }
      }
    }
    
    // Поиск изображений, которые уже есть в базе данных
    const existingImages = await Image.find();
    // Создаем Set с путями существующих изображений
    const existingImagePaths = new Set(existingImages.map(img => {
      // Безопасная проверка наличия поля url
      return (img as any).url || '';
    }));
    
    // Записи для миграции с правильной типизацией
    interface MigrateDetail {
      path: string;
      status: 'created' | 'existing' | 'error';
      message: string;
      id?: string;
    }
    
    const migrateResults = {
      total: 0,
      created: 0,
      existing: 0,
      errors: 0,
      details: [] as MigrateDetail[]
    };
    
    // Создание записей в базе данных
    for (const [categoryKey, category] of Object.entries(imageMapping)) {
      for (const image of category.images) {
        migrateResults.total++;
        
        try {
          // Проверка, существует ли уже запись для этого изображения
          if (existingImagePaths.has(image.relativePath)) {
            migrateResults.existing++;
            migrateResults.details.push({
              path: image.relativePath,
              status: 'existing',
              message: 'Запись уже существует в базе данных'
            });
            continue;
          }
          
          // Данные для создания записи
          const imageData = {
            url: image.relativePath, // Локальный путь
            secure_url: image.relativePath, // Локальный путь
            type: category.type,
            alt: image.filename.split('.')[0].replace(/[-_]/g, ' '),
            title: image.filename.split('.')[0].replace(/[-_]/g, ' '),
            section: categoryKey,
            width: 0, // Можно будет обновить позже
            height: 0, // Можно будет обновить позже
            format: path.extname(image.filename).slice(1),
            tags: [],
            order: 0,
            isActive: true
          };
          
          // Создание записи в базе данных
          const newImage = new Image(imageData);
          await newImage.save();
          
          migrateResults.created++;
          migrateResults.details.push({
            path: image.relativePath,
            status: 'created',
            message: 'Запись создана успешно',
            id: newImage._id.toString()
          });
          
        } catch (error: unknown) {
          console.error(`Ошибка при создании записи для ${image.relativePath}:`, error);
          migrateResults.errors++;
          
          let errorMessage = 'Неизвестная ошибка';
          if (error instanceof Error) {
            errorMessage = error.message;
          }
          
          migrateResults.details.push({
            path: image.relativePath,
            status: 'error',
            message: errorMessage
          });
        }
      }
    }
    
    return res.status(200).json({
      success: true,
      message: `Сканирование завершено. Обработано ${migrateResults.total} изображений, создано ${migrateResults.created} записей, пропущено ${migrateResults.existing} существующих записей, ошибок: ${migrateResults.errors}`,
      data: migrateResults
    });
    
  } catch (error: unknown) {
    console.error('Ошибка при сканировании и миграции изображений:', error);
    
    let errorMessage = 'Ошибка при сканировании и миграции изображений';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    
    return res.status(500).json({
      success: false,
      message: 'Ошибка при сканировании и миграции изображений',
      error: errorMessage
    });
  }
};

export default {
  uploadSingleImage,
  uploadMultipleImages,
  getImages,
  getImageById,
  updateImage,
  deleteImageById,
  scanAndMigrateImages
}; 