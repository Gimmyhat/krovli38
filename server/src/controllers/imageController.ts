import { Request, Response } from 'express';
import Image from '../models/Image';
import cloudinaryConfig, { uploadImage, deleteImage } from '../config/cloudinary';
import sharp from 'sharp';
import fs from 'fs';

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
    console.log('Получен запрос на получение изображений с параметрами:', req.query);
    
    const { 
      page = 1, 
      limit = 12, 
      type, 
      section, 
      tags, 
      isActive,
      search 
    } = req.query;

    const query: any = {};

    // Применяем фильтры, если они указаны
    if (type) query.type = type;
    if (section) query.section = section;
    if (typeof tags === 'string') {
      query.tags = { $in: tags.split(',').map((tag: string) => tag.trim()) };
    }
    if (isActive !== undefined) query.isActive = isActive === 'true';
    
    // Добавляем поиск по названию и alt тексту
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { alt: { $regex: search, $options: 'i' } }
      ];
    }

    console.log('Применяемые фильтры для запроса:', JSON.stringify(query));

    // Используем более простой подход без сложных запросов
    // Получаем только необходимые поля для уменьшения объема данных
    console.log('Выполняем запрос изображений с пагинацией');
    const images = await Image.find(query, {
        _id: 1,
        public_id: 1,
        url: 1,
        secure_url: 1,
        type: 1,
        alt: 1,
        title: 1,
        section: 1,
        width: 1,
        height: 1,
        format: 1,
        tags: 1,
        isActive: 1
      })
      .sort({ order: 1, createdAt: -1 })
      .skip((Number(page) - 1) * Number(limit))
      .limit(Number(limit))
      .lean() // Используем lean() для более быстрого получения данных
      .maxTimeMS(30000) // Увеличиваем таймаут до 30 секунд
      .exec();
    
    console.log(`Найдено ${images.length} изображений`);

    // Отправляем результат в нужном формате
    console.log('Отправляем ответ клиенту');
    res.json({
      images,
      pagination: {
        currentPage: Number(page),
        limit: Number(limit),
        hasMore: images.length === Number(limit)
      }
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
 * Создание записи изображения на основе публичного ID из Cloudinary
 * @route POST /api/images/cloudinary
 */
export const createFromCloudinary = async (req: Request, res: Response) => {
  try {
    const { public_id, type, alt, title, section, tags } = req.body;

    console.log('Получен запрос на создание изображения из Cloudinary:', {
      public_id,
      type,
      section,
      hasAlt: !!alt,
      hasTitle: !!title,
      tagsCount: tags ? tags.length : 0
    });

    // Проверяем наличие public_id
    if (!public_id) {
      console.log('Ошибка: не указан public_id изображения');
      return res.status(400).json({ error: 'Не указан public_id изображения' });
    }

    // Проверяем настройки Cloudinary
    console.log('Cloudinary config:', {
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET ? 'Установлен' : 'Не установлен',
      upload_preset: process.env.CLOUDINARY_UPLOAD_PRESET
    });

    // Проверяем, существует ли уже изображение с таким public_id
    const existingImage = await Image.findOne({ public_id });
    if (existingImage) {
      console.log('Изображение с таким public_id уже существует:', existingImage._id);
      return res.status(409).json({ 
        error: 'Изображение с таким public_id уже существует',
        image: existingImage 
      });
    }

    // Получаем информацию о ресурсе из Cloudinary
    try {
      console.log('Запрос информации о ресурсе из Cloudinary:', public_id);
      const result = await cloudinaryConfig.v2.api.resource(public_id);
      console.log('Получена информация о ресурсе из Cloudinary:', {
        public_id: result.public_id,
        url: result.url,
        format: result.format,
        width: result.width,
        height: result.height
      });
      
      // Создаем запись в MongoDB
      const newImage = new Image({
        public_id,
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
        tags: tags || [],
      });

      // Сохраняем в БД
      console.log('Сохраняем изображение в БД');
      await newImage.save();
      console.log('Изображение успешно сохранено в БД:', newImage._id);

      // Возвращаем результат
      res.status(201).json({
        message: 'Изображение успешно добавлено',
        image: newImage
      });
    } catch (cloudinaryError: any) {
      console.error('Ошибка при получении данных из Cloudinary:', cloudinaryError);
      console.error('Детали ошибки:', {
        message: cloudinaryError.message,
        code: cloudinaryError.code,
        http_code: cloudinaryError.http_code,
        name: cloudinaryError.name,
        stack: cloudinaryError.stack
      });
      return res.status(500).json({
        error: 'Ошибка при получении данных из Cloudinary',
        details: cloudinaryError.message
      });
    }
  } catch (error: any) {
    console.error('Ошибка при создании изображения из Cloudinary:', error);
    console.error('Детали ошибки:', {
      message: error.message,
      code: error.code,
      name: error.name,
      stack: error.stack
    });
    res.status(500).json({
      error: 'Ошибка при создании изображения',
      details: error.message
    });
  }
};

/**
 * Импорт локальных изображений в Cloudinary
 * @route POST /api/images/import-local
 */
export const importLocalImagesHandler = async (req: Request, res: Response) => {
  try {
    const { directories } = req.body;
    
    // Импортируем утилиту для импорта изображений
    const { importLocalImages } = require('../scripts/importLocalImages');
    
    // Запускаем импорт
    const results = await importLocalImages(directories || undefined);
    
    res.json({
      message: 'Импорт локальных изображений выполнен',
      results
    });
  } catch (error: any) {
    console.error('Ошибка при импорте локальных изображений:', error);
    res.status(500).json({
      error: 'Ошибка при импорте локальных изображений',
      details: error.message
    });
  }
};

/**
 * Проверка наличия изображений в указанных директориях
 * @route POST /api/images/check-paths
 */
export const checkImagePaths = async (req: Request, res: Response) => {
  try {
    const { directories, deep = false } = req.body;
    
    // Импортируем утилиту для проверки изображений
    const { default: importScript } = require('../scripts/importLocalImages');
    const { getImageFiles, getFullDirectoryPath, findAllImageDirectories } = importScript;
    
    const foundPaths: string[] = [];
    let checkedDirectories: string[] = [];
    
    // Если включен режим глубокого сканирования, ищем директории с изображениями
    if (deep) {
      console.log('Выполняется глубокое сканирование файловой системы...');
      // Находим все директории с изображениями в корневых каталогах
      const rootDirs = ['/var/www/html', '/usr/share/nginx/html', '/app', '/'];
      for (const rootDir of rootDirs) {
        if (fs.existsSync(rootDir)) {
          console.log(`Сканирование корневой директории: ${rootDir}`);
          try {
            const foundDirs = await findAllImageDirectories(rootDir);
            checkedDirectories = [...checkedDirectories, ...foundDirs];
            console.log(`Найдено ${foundDirs.length} директорий с изображениями в ${rootDir}`);
          } catch (err) {
            console.error(`Ошибка при сканировании ${rootDir}:`, err);
          }
        }
      }
    }
    
    // Объединяем найденные директории с указанными пользователем
    const allDirectories = [...new Set([...directories, ...checkedDirectories])];
    const validDirectories: string[] = [];
    
    // Проверяем каждую директорию
    for (const directory of allDirectories) {
      try {
        // Определяем полный путь к директории
        const dirPath = getFullDirectoryPath(directory);
        
        if (fs.existsSync(dirPath)) {
          validDirectories.push(directory);
          console.log(`Проверка директории: ${dirPath}`);
          const imageFiles = await getImageFiles(dirPath);
          
          // Добавляем найденные пути в результат
          imageFiles.forEach((file: { filePath: string; relativePath: string }) => {
            foundPaths.push(`${directory}/${file.relativePath}`);
          });
          
          console.log(`Найдено ${imageFiles.length} изображений в ${dirPath}`);
        } else {
          console.warn(`Директория ${dirPath} не существует, пропускаем`);
        }
      } catch (err) {
        console.error(`Ошибка при проверке директории ${directory}:`, err);
      }
    }
    
    res.json({
      message: 'Проверка путей завершена',
      checkedDirectories: allDirectories.length,
      validDirectories: validDirectories,
      foundDirectories: allDirectories.filter((dir: string) => {
        const fullPath = getFullDirectoryPath(dir);
        return fs.existsSync(fullPath);
      }),
      imagePaths: foundPaths,
      count: foundPaths.length
    });
  } catch (error: any) {
    console.error('Ошибка при проверке путей изображений:', error);
    res.status(500).json({
      error: 'Ошибка при проверке путей изображений',
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
  deleteImageById,
  createFromCloudinary,
  importLocalImagesHandler,
  checkImagePaths
}; 