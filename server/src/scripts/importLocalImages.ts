import fs from 'fs';
import path from 'path';
import { promisify } from 'util';
import { logger } from '../utils/logger';
import cloudinaryConfig, { uploadImage } from '../config/cloudinary';
import Image from '../models/Image';
import dotenv from 'dotenv';

// Загрузка переменных окружения
dotenv.config();

// Промисифицируем функции fs
const readdir = promisify(fs.readdir);
const stat = promisify(fs.stat);
const readFile = promisify(fs.readFile);

// Массив расширений изображений
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];

/**
 * Проверяем, является ли файл изображением
 */
const isImageFile = (filePath: string): boolean => {
  const ext = path.extname(filePath).toLowerCase();
  return IMAGE_EXTENSIONS.includes(ext);
};

/**
 * Получение полного пути к директории с учетом контекста Docker
 */
const getFullDirectoryPath = (directory: string): string => {
  // Если путь абсолютный, используем его как есть
  if (path.isAbsolute(directory)) {
    return directory;
  }
  
  // Проверяем разные корневые директории
  const possibleRoots = [
    // Стандартный путь в контейнере
    process.cwd(),
    // Выходим на уровень выше для доступа к общей директории проекта
    path.resolve(process.cwd(), '..'),
    // Стандартные пути в Docker для nginx
    '/usr/share/nginx/html',
    '/var/www/html',
    // Пути для разработки
    '/app',
    '/app/public'
  ];
  
  for (const root of possibleRoots) {
    const fullPath = path.join(root, directory);
    if (fs.existsSync(fullPath)) {
      console.log(`Найдена директория: ${fullPath}`);
      return fullPath;
    }
  }
  
  // Если ни один из путей не существует, возвращаем путь относительно текущей директории
  const defaultPath = path.resolve(process.cwd(), directory);
  console.log(`Директория не найдена, используем по умолчанию: ${defaultPath}`);
  return defaultPath;
};

/**
 * Получение всех файлов изображений из директории и поддиректорий
 */
const getImageFiles = async (
  directory: string, 
  options: { 
    recursive?: boolean; 
    basePath?: string;
  } = {}
): Promise<Array<{ filePath: string; relativePath: string }>> => {
  const { recursive = true, basePath = directory } = options;
  let imageFiles: Array<{ filePath: string; relativePath: string }> = [];

  try {
    const files = await readdir(directory);

    for (const file of files) {
      const filePath = path.join(directory, file);
      const fileStat = await stat(filePath);

      if (fileStat.isDirectory() && recursive) {
        // Если директория и рекурсивный поиск включен, идем глубже
        const nestedFiles = await getImageFiles(filePath, { recursive, basePath });
        imageFiles = [...imageFiles, ...nestedFiles];
      } else if (fileStat.isFile() && isImageFile(filePath)) {
        // Если файл и это изображение, добавляем в результат
        const relativePath = path.relative(basePath, filePath).replace(/\\/g, '/');
        imageFiles.push({ filePath, relativePath });
      }
    }
  } catch (error) {
    logger.error(`Ошибка при сканировании директории ${directory}:`, { error });
    console.error(`Ошибка при сканировании директории ${directory}:`, error);
  }

  return imageFiles;
};

/**
 * Загрузка изображения в Cloudinary и создание записи в БД
 */
const importImageToCloudinary = async (
  filePath: string, 
  relativePath: string
): Promise<any> => {
  try {
    console.log(`Обработка файла: ${filePath} (${relativePath})`);
    
    // Читаем файл в буфер
    const imageBuffer = await readFile(filePath);
    console.log(`Файл прочитан, размер: ${imageBuffer.length} байт`);
    
    // Определяем метаданные на основе пути
    const pathParts = relativePath.split('/');
    const section = pathParts.length > 1 ? pathParts[0] : 'general';
    const filename = path.basename(filePath, path.extname(filePath));
    
    console.log(`Метаданные: раздел=${section}, имя=${filename}`);
    
    // Проверяем, существует ли уже запись для этого пути
    const existingImage = await Image.findOne({ title: filename, section });
    if (existingImage) {
      logger.info(`Изображение ${relativePath} уже существует в базе данных`);
      return { success: false, message: 'already_exists', image: existingImage };
    }
    
    // Загружаем в Cloudinary
    console.log(`Загрузка в Cloudinary: ${filename}`);
    const uploadResult = await uploadImage(imageBuffer, {
      folder: `krovli38/import/${section}`,
      public_id: filename,
      tags: ['imported', 'local', section]
    });
    
    console.log(`Загружено в Cloudinary: ${uploadResult.public_id}`);
    
    // Создаем запись в базе данных
    const newImage = new Image({
      public_id: uploadResult.public_id,
      url: uploadResult.url,
      secure_url: uploadResult.secure_url,
      type: 'content',
      alt: filename,
      title: filename,
      section,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format,
      size: uploadResult.bytes,
      tags: ['imported', 'local', section],
      isActive: true
    });
    
    await newImage.save();
    logger.info(`Успешно импортировано изображение ${relativePath}`);
    console.log(`Сохранено в БД: ${newImage._id}`);
    
    return { success: true, image: newImage };
  } catch (error) {
    logger.error(`Ошибка при импорте изображения ${filePath}:`, { error });
    console.error(`Ошибка при импорте изображения ${filePath}:`, error);
    return { success: false, message: 'error', error };
  }
};

/**
 * Находит директории, содержащие изображения, начиная с указанной корневой директории
 */
const findAllImageDirectories = async (
  rootDirectory: string,
  maxDepth: number = 4 // ограничиваем глубину поиска для предотвращения бесконечного рекурсивного сканирования
): Promise<string[]> => {
  const imageDirectories: string[] = [];
  
  const scanDirectory = async (dir: string, currentDepth: number = 0) => {
    if (currentDepth > maxDepth) return;
    
    try {
      // Проверяем существование директории
      if (!fs.existsSync(dir)) {
        return;
      }
      
      // Получаем список файлов в директории
      const files = await readdir(dir);
      let hasImages = false;
      
      // Сначала проверяем, содержит ли директория изображения
      for (const file of files) {
        const filePath = path.join(dir, file);
        const fileStat = await stat(filePath).catch(() => null);
        if (fileStat && fileStat.isFile() && isImageFile(filePath)) {
          hasImages = true;
          break;
        }
      }
      
      // Если директория содержит изображения, добавляем её в список
      if (hasImages) {
        // Сохраняем относительный путь, если директория внутри корневой
        const relativePath = path.relative(process.cwd(), dir);
        imageDirectories.push(dir); // Абсолютный путь
        imageDirectories.push(relativePath); // Относительный путь
        
        // Добавляем также возможные альтернативные пути для Docker
        if (dir.startsWith('/var/www/html')) {
          imageDirectories.push(dir.replace('/var/www/html', ''));
        }
        if (dir.startsWith('/usr/share/nginx/html')) {
          imageDirectories.push(dir.replace('/usr/share/nginx/html', ''));
        }
        if (dir.startsWith('/app')) {
          imageDirectories.push(dir.replace('/app', ''));
        }
      }
      
      // Затем рекурсивно сканируем поддиректории
      for (const file of files) {
        const filePath = path.join(dir, file);
        const fileStat = await stat(filePath).catch(() => null);
        
        if (fileStat && fileStat.isDirectory()) {
          await scanDirectory(filePath, currentDepth + 1);
        }
      }
    } catch (error) {
      console.error(`Ошибка при сканировании директории ${dir}:`, error);
    }
  };
  
  await scanDirectory(rootDirectory);
  
  // Удаляем дубликаты
  return [...new Set(imageDirectories)];
};

/**
 * Импорт всех локальных изображений в указанных директориях
 */
export const importLocalImages = async (directories: string[] = ['public/images', 'src/assets', 'images', '/images']) => {
  try {
    logger.info('Начало импорта локальных изображений...');
    console.log('Начало импорта локальных изображений...');
    
    // Результаты импорта
    const results = {
      success: 0,
      skipped: 0,
      error: 0,
      total: 0
    };
    
    // Обрабатываем каждую директорию
    for (const directory of directories) {
      // Определяем полный путь к директории
      const dirPath = getFullDirectoryPath(directory);
      
      if (!fs.existsSync(dirPath)) {
        logger.warn(`Директория ${dirPath} не существует, пропускаем`);
        console.warn(`Директория ${dirPath} не существует, пропускаем`);
        continue;
      }
      
      console.log(`Сканирование директории: ${dirPath}`);
      const imageFiles = await getImageFiles(dirPath);
      console.log(`Найдено ${imageFiles.length} изображений в ${dirPath}`);
      
      // Загружаем изображения в Cloudinary
      for (const { filePath, relativePath } of imageFiles) {
        results.total++;
        
        console.log(`Импорт [${results.total}/${imageFiles.length}]: ${relativePath}`);
        const importResult = await importImageToCloudinary(filePath, relativePath);
        
        if (importResult.success) {
          results.success++;
        } else if (importResult.message === 'already_exists') {
          results.skipped++;
        } else {
          results.error++;
        }
      }
    }
    
    logger.info('Импорт локальных изображений завершен', results);
    console.log('Импорт локальных изображений завершен:', results);
    
    return results;
  } catch (error) {
    logger.error('Ошибка при импорте локальных изображений:', { error });
    console.error('Ошибка при импорте локальных изображений:', error);
    throw error;
  }
};

// Если скрипт запущен напрямую
if (require.main === module) {
  // Подключаемся к базе данных и запускаем импорт
  const mongoose = require('mongoose');
  
  mongoose.connect(process.env.MONGODB_URI as string)
    .then(() => {
      console.log('Подключено к базе данных');
      return importLocalImages();
    })
    .then(() => {
      console.log('Импорт завершен');
      process.exit(0);
    })
    .catch((err: Error) => {
      console.error('Ошибка:', err);
      process.exit(1);
    });
}

export default {
  importLocalImages,
  getImageFiles,
  getFullDirectoryPath,
  isImageFile,
  findAllImageDirectories
}; 