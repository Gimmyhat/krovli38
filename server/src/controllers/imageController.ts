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

    // Считаем общее количество изображений по фильтру
    const totalItems = await Image.countDocuments(query);
    const totalPages = Math.ceil(totalItems / Number(limit));
    const currentPage = Number(page);

    // Получаем изображения с пагинацией
    const images = await Image.find(query)
      .sort({ order: 1, createdAt: -1 })
      .skip((currentPage - 1) * Number(limit))
      .limit(Number(limit));

    // Отправляем результат в нужном формате
    res.json({
      images,
      pagination: {
        totalItems,
        currentPage,
        totalPages,
        limit: Number(limit)
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

    // Добавляем подробное логирование для отладки
    console.log('Получены данные изображения для создания:', { public_id, type, section });

    // Проверяем наличие public_id
    if (!public_id) {
      return res.status(400).json({ error: 'Не указан public_id изображения' });
    }

    // Проверяем настройки Cloudinary
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error('Не заданы переменные окружения Cloudinary');
      return res.status(500).json({ 
        error: 'Ошибка конфигурации Cloudinary',
        details: 'Не настроены ключи доступа к Cloudinary'
      });
    }

    // Пробуем получить изображение из нашей БД (на случай параллельных запросов)
    try {
      const existingImage = await Image.findOne({ public_id });
      if (existingImage) {
        return res.status(409).json({ 
          error: 'Изображение с таким public_id уже существует',
          image: existingImage 
        });
      }
    } catch (dbError: any) {
      console.error('Ошибка при проверке наличия изображения:', dbError);
      // Продолжаем выполнение - если была ошибка на этом этапе, 
      // возможно изображения нет в БД, поэтому пробуем его создать
    }

    // Получаем информацию о ресурсе из Cloudinary
    try {
      console.log(`Запрашиваем данные из Cloudinary для public_id: ${public_id}`);
      const result = await cloudinaryConfig.v2.api.resource(public_id);
      
      if (!result || !result.url) {
        console.error('Cloudinary вернул некорректные данные:', result);
        return res.status(500).json({
          error: 'Некорректные данные от Cloudinary API',
          details: 'Не удалось получить URL изображения'
        });
      }
      
      console.log('Получена информация из Cloudinary:', result.public_id);
      
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

      // Добавляем логирование перед сохранением
      console.log('Сохраняем изображение в БД:', { 
        public_id: newImage.public_id,
        type: newImage.type,
        section: newImage.section
      });

      try {
        // Сохраняем в БД
        await newImage.save();

        // Возвращаем результат
        res.status(201).json({
          message: 'Изображение успешно добавлено',
          image: newImage
        });
      } catch (saveError: any) {
        console.error('Ошибка при сохранении изображения в БД:', saveError);
        
        // Определяем тип ошибки
        if (saveError.name === 'ValidationError') {
          // Ошибка валидации mongoose
          const validationErrors = Object.keys(saveError.errors)
            .map(field => `${field}: ${saveError.errors[field].message}`)
            .join(', ');
          return res.status(400).json({
            error: 'Ошибка валидации данных изображения',
            details: validationErrors
          });
        } else if (saveError.code === 11000) {
          // Пытаемся получить существующее изображение чтобы вернуть его
          try {
            const existingImage = await Image.findOne({ public_id });
            if (existingImage) {
              return res.status(409).json({ 
                error: 'Изображение с таким public_id уже существует',
                image: existingImage 
              });
            }
          } catch (findError) {
            // Игнорируем ошибку поиска, возвращаем стандартный ответ
          }
          
          return res.status(409).json({
            error: 'Изображение с таким public_id уже существует',
            details: saveError.message
          });
        }
        
        // Общая ошибка сохранения
        return res.status(500).json({
          error: 'Ошибка при сохранении изображения в базу данных',
          details: saveError.message || 'Неизвестная ошибка сохранения'
        });
      }
    } catch (cloudinaryError: any) {
      console.error('Ошибка при получении данных из Cloudinary:', cloudinaryError);
      
      // Добавляем подробности Cloudinary ошибки
      let errorStatus = 500;
      let errorDetails = cloudinaryError.message || 'Неизвестная ошибка Cloudinary API';
      
      if (cloudinaryError.http_code) {
        errorStatus = cloudinaryError.http_code >= 400 && cloudinaryError.http_code < 600 
          ? cloudinaryError.http_code 
          : 500;
        errorDetails += ` (HTTP ${cloudinaryError.http_code})`;
      }
      
      if (cloudinaryError.error && typeof cloudinaryError.error === 'object') {
        errorDetails += ` - ${JSON.stringify(cloudinaryError.error)}`;
      }
      
      return res.status(errorStatus).json({
        error: 'Ошибка при получении данных из Cloudinary',
        details: errorDetails,
        resourceId: public_id
      });
    }
  } catch (error: any) {
    console.error('Ошибка при создании изображения из Cloudinary:', error);
    
    // Общая ошибка
    res.status(500).json({
      error: 'Ошибка при создании изображения',
      details: error.message || 'Неизвестная ошибка сервера'
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