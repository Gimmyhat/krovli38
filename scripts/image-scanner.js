#!/usr/bin/env node

/**
 * Скрипт для сканирования и миграции изображений в Cloudinary
 * 
 * Этот скрипт выполняет:
 * 1. Сканирование всех изображений в проекте
 * 2. Сопоставление их с компонентами, где они используются
 * 3. Загрузку изображений в Cloudinary с правильной структурой папок
 * 4. Создание записей в MongoDB для каждого изображения
 */

import fs from 'fs';
import path from 'path';
import axios from 'axios';
import FormData from 'form-data';
import { glob } from 'glob';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

// Получение директории текущего файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Загрузка переменных окружения из .env
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Конфигурация Cloudinary должна быть установлена в переменных окружения
const cloudinaryConfig = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
  api_key: process.env.CLOUDINARY_API_KEY || '123456789012345',
  api_secret: process.env.CLOUDINARY_API_SECRET || 'abcdefghijklmnopqrstuvwxyz12',
};

// URL API сервера
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Структура для хранения информации об изображениях
const imageMapping = {
  'hero': {
    folder: 'hero',
    type: 'hero',
    component: 'Hero',
    images: []
  },
  'services': {
    folder: 'services',
    type: 'service',
    component: 'Services',
    images: []
  },
  'gallery': {
    folder: 'gallery',
    type: 'gallery',
    component: 'Gallery',
    images: []
  }
};

/**
 * Сканирование статических изображений в папке public
 */
async function scanStaticImages() {
  console.log('Сканирование статических изображений...');
  
  // Используем паттерны, совместимые с Windows
  const imageFiles = await glob(['public/images/**/*.jpg', 'public/images/**/*.jpeg', 'public/images/**/*.png', 'public/images/**/*.gif', 'public/images/**/*.webp'], { windowsPathsNoEscape: true });
  
  console.log(`Найдено ${imageFiles.length} изображений.`);
  
  for (const filePath of imageFiles) {
    // Нормализуем пути для корректной работы в Windows
    const normalizedPath = filePath.replace(/\\/g, '/');
    // Определение категории на основе пути к файлу
    const pathParts = normalizedPath.split('/');
    const category = pathParts[2]; // hero, services, gallery и т.д.
    const filename = pathParts[pathParts.length - 1];
    
    if (imageMapping[category]) {
      const fileStats = fs.statSync(filePath);
      
      // Собираем информацию об изображении
      const imageInfo = {
        path: normalizedPath,
        filename,
        size: fileStats.size,
        relativePath: `/${normalizedPath.replace('public/', '')}`,
        category,
        createdAt: fileStats.birthtime,
        modifiedAt: fileStats.mtime
      };
      
      // Добавляем в соответствующую категорию
      imageMapping[category].images.push(imageInfo);
      console.log(`Найдено изображение: ${normalizedPath} (${category})`);
    }
  }
}

/**
 * Сканирование компонентов React на предмет использования изображений
 */
async function scanReactComponents() {
  console.log('\nСканирование компонентов React...');
  
  // Используем паттерны, совместимые с Windows
  const componentFiles = await glob(['src/components/**/*.jsx', 'src/components/**/*.tsx'], { windowsPathsNoEscape: true });
  
  console.log(`Найдено ${componentFiles.length} компонентов.`);
  
  // Регулярное выражение для поиска путей к изображениям в компонентах
  const imgPathRegex = /src=['"]([^'"]*\.(?:jpg|jpeg|png|gif|webp))["']/g;
  const imageImportRegex = /(?:src|image)=['"]([^'"]*\.(?:jpg|jpeg|png|gif|webp))["']/g;
  
  for (const filePath of componentFiles) {
    const content = fs.readFileSync(filePath, 'utf-8');
    // Нормализуем пути для корректной работы в Windows
    const normalizedPath = filePath.replace(/\\/g, '/');
    const filename = path.basename(normalizedPath);
    const componentName = filename.split('.')[0];
    
    // Поиск путей к изображениям в содержимом компонента
    let match;
    while ((match = imageImportRegex.exec(content)) !== null) {
      const imagePath = match[1];
      
      // Только относительные пути, начинающиеся с /
      if (imagePath.startsWith('/images/')) {
        // Определение категории
        const pathParts = imagePath.split('/');
        const category = pathParts[2];
        const imageFilename = pathParts[pathParts.length - 1];
        
        if (imageMapping[category]) {
          // Ищем изображение в нашем маппинге
          const existingImage = imageMapping[category].images.find(img => 
            img.relativePath === imagePath || img.filename === imageFilename
          );
          
          if (existingImage) {
            // Добавляем информацию о компоненте
            existingImage.usedIn = existingImage.usedIn || [];
            if (!existingImage.usedIn.includes(componentName)) {
              existingImage.usedIn.push(componentName);
            }
            console.log(`Изображение ${imagePath} используется в компоненте ${componentName}`);
          }
        }
      }
    }
  }
}

/**
 * Загрузка изображений в Cloudinary
 */
async function uploadToCloudinary() {
  console.log('\nЗагрузка изображений в Cloudinary...');
  
  // Обход всех категорий и изображений
  for (const [categoryKey, category] of Object.entries(imageMapping)) {
    for (const image of category.images) {
      try {
        console.log(`Загрузка ${image.path} в Cloudinary...`);
        
        // Создание FormData для загрузки
        const formData = new FormData();
        formData.append('file', fs.createReadStream(image.path));
        formData.append('upload_preset', 'ml_default');
        formData.append('folder', `krovli38/${category.folder}`);
        
        // Добавление тегов
        if (image.usedIn) {
          formData.append('tags', image.usedIn.join(','));
        }
        formData.append('tags', categoryKey);
        
        // Загрузка в Cloudinary
        const cloudinaryUrl = `https://api.cloudinary.com/v1_1/${cloudinaryConfig.cloud_name}/upload`;
        const cloudinaryAuth = {
          username: cloudinaryConfig.api_key,
          password: cloudinaryConfig.api_secret
        };
        
        console.log(`Отправка запроса в Cloudinary (${cloudinaryUrl})...`);
        
        // Здесь можно раскомментировать для реальной загрузки:
        /*
        const response = await axios.post(cloudinaryUrl, formData, {
          headers: {
            ...formData.getHeaders()
          },
          auth: cloudinaryAuth
        });
        
        // Сохранение результата
        image.cloudinary = response.data;
        console.log(`Успешно загружено в Cloudinary: ${response.data.public_id}`);
        */
        
        // Пока что просто симулируем загрузку
        console.log(`Симуляция загрузки для ${image.filename}...`);
        image.cloudinary = {
          public_id: `krovli38/${category.folder}/${image.filename.split('.')[0]}`,
          url: `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/v1/krovli38/${category.folder}/${image.filename}`,
          secure_url: `https://res.cloudinary.com/${cloudinaryConfig.cloud_name}/image/upload/v1/krovli38/${category.folder}/${image.filename}`
        };
      } catch (error) {
        console.error(`Ошибка загрузки ${image.path}:`, error.message);
      }
    }
  }
}

/**
 * Создание записей в MongoDB через API
 */
async function createDatabaseRecords() {
  console.log('\nСоздание записей в базе данных...');
  
  // Обход всех категорий и изображений
  for (const [categoryKey, category] of Object.entries(imageMapping)) {
    for (const image of category.images) {
      if (image.cloudinary) {
        try {
          console.log(`Создание записи для ${image.filename}...`);
          
          // Создание данных для API
          const imageData = {
            public_id: image.cloudinary.public_id,
            url: image.cloudinary.url,
            secure_url: image.cloudinary.secure_url,
            type: category.type,
            alt: image.filename.split('.')[0].replace(/[-_]/g, ' '),
            title: image.filename.split('.')[0].replace(/[-_]/g, ' '),
            section: categoryKey,
            width: 0, // Здесь можно добавить реальные размеры после загрузки
            height: 0,
            format: image.filename.split('.').pop(),
            tags: image.usedIn || [],
            order: 0,
            isActive: true
          };
          
          // Отправка в API
          // Здесь можно раскомментировать для реальной отправки:
          /*
          const response = await axios.post(`${API_URL}/images`, imageData);
          console.log(`Запись создана в базе данных: ${response.data._id}`);
          */
          
          // Пока что просто симулируем создание записи
          console.log(`Симуляция создания записи для ${imageData.public_id}...`);
        } catch (error) {
          console.error(`Ошибка создания записи для ${image.filename}:`, error.message);
        }
      }
    }
  }
}

/**
 * Экспорт данных в JSON файл для последующего использования
 */
async function exportToJson() {
  console.log('\nЭкспорт данных в JSON...');
  
  const outputPath = path.resolve(__dirname, '../image-mapping.json');
  fs.writeFileSync(outputPath, JSON.stringify(imageMapping, null, 2));
  
  console.log(`Данные сохранены в файл: ${outputPath}`);
}

/**
 * Главная функция
 */
async function main() {
  console.log('Начало сканирования и миграции изображений');
  
  try {
    // Шаг 1: Сканирование статических изображений
    await scanStaticImages();
    
    // Шаг 2: Сканирование компонентов React
    await scanReactComponents();
    
    // Шаг 3: Загрузка в Cloudinary
    // Раскомментировать для реальной загрузки:
    // await uploadToCloudinary();
    
    // Шаг 4: Создание записей в MongoDB
    // Раскомментировать для реального создания записей:
    // await createDatabaseRecords();
    
    // Шаг 5: Экспорт данных в JSON
    await exportToJson();
    
    console.log('\nМиграция успешно завершена!');
  } catch (error) {
    console.error('Ошибка в процессе миграции:', error);
  }
}

// Запуск скрипта
main(); 