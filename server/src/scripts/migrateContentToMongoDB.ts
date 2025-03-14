import fs from 'fs';
import path from 'path';
import mongoose from 'mongoose';
import Content from '../models/Content';
import { logger } from '../utils/logger';
import dotenv from 'dotenv';

// Загружаем переменные окружения
dotenv.config();

// Путь к файлу с контентом
const CONTENT_FILE_PATH = path.join(__dirname, '../../../data/content.json');

// Функция для чтения файла контента
const readContentFile = (): any => {
  try {
    // Проверяем существование файла
    if (!fs.existsSync(CONTENT_FILE_PATH)) {
      logger.error('Файл контента не найден');
      return null;
    }

    // Читаем файл
    const content = JSON.parse(fs.readFileSync(CONTENT_FILE_PATH, 'utf8'));
    return content;
  } catch (error) {
    logger.error('Ошибка при чтении файла контента', { error });
    throw error;
  }
};

// Функция для миграции данных
const migrateContent = async (): Promise<void> => {
  try {
    // Подключаемся к MongoDB
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/krovli38';
    await mongoose.connect(mongoURI);
    logger.info('Подключено к MongoDB');

    // Читаем данные из файла
    const fileContent = readContentFile();
    if (!fileContent) {
      logger.error('Не удалось прочитать данные из файла');
      process.exit(1);
    }

    // Проверяем, есть ли уже контент в базе данных
    const existingContent = await Content.findOne();
    if (existingContent) {
      logger.info('Контент уже существует в базе данных. Обновляем...');
      
      // Обновляем услуги
      if (fileContent.services && Array.isArray(fileContent.services)) {
        // Удаляем все существующие услуги, используя метод remove
        while (existingContent.services.length > 0) {
          existingContent.services.pop();
        }
        
        // Добавляем новые услуги по одной
        for (const service of fileContent.services) {
          existingContent.services.push(service);
        }
      }
      
      // Обновляем benefits
      if (fileContent.benefits) {
        if (existingContent.benefits) {
          if (fileContent.benefits.title) existingContent.benefits.title = fileContent.benefits.title;
          if (fileContent.benefits.items && Array.isArray(fileContent.benefits.items)) {
            // Удаляем все существующие элементы
            while (existingContent.benefits.items.length > 0) {
              existingContent.benefits.items.pop();
            }
            
            // Добавляем новые элементы
            for (const item of fileContent.benefits.items) {
              existingContent.benefits.items.push(item);
            }
          }
        }
      }
      
      // Обновляем types
      if (fileContent.types) {
        if (existingContent.types) {
          if (fileContent.types.title) existingContent.types.title = fileContent.types.title;
          if (fileContent.types.items && Array.isArray(fileContent.types.items)) {
            // Удаляем все существующие элементы
            while (existingContent.types.items.length > 0) {
              existingContent.types.items.pop();
            }
            
            // Добавляем новые элементы
            for (const item of fileContent.types.items) {
              existingContent.types.items.push(item);
            }
          }
        }
      }
      
      // Обновляем gallery
      if (fileContent.gallery) {
        if (existingContent.gallery) {
          if (fileContent.gallery.title) existingContent.gallery.title = fileContent.gallery.title;
          if (fileContent.gallery.description) existingContent.gallery.description = fileContent.gallery.description;
          if (fileContent.gallery.images && Array.isArray(fileContent.gallery.images)) {
            // Удаляем все существующие изображения
            while (existingContent.gallery.images.length > 0) {
              existingContent.gallery.images.pop();
            }
            
            // Добавляем новые изображения
            for (const image of fileContent.gallery.images) {
              existingContent.gallery.images.push(image);
            }
          }
        }
      }
      
      // Обновляем hero
      if (fileContent.hero) {
        if (existingContent.hero) {
          if (fileContent.hero.title) existingContent.hero.title = fileContent.hero.title;
          if (fileContent.hero.subtitle) existingContent.hero.subtitle = fileContent.hero.subtitle;
          if (fileContent.hero.buttonText) existingContent.hero.buttonText = fileContent.hero.buttonText;
          if (fileContent.hero.image) existingContent.hero.image = fileContent.hero.image;
        }
      }
      
      await existingContent.save();
      
      logger.info('Контент успешно обновлен в базе данных');
    } else {
      logger.info('Создаем новый контент в базе данных...');
      
      // Создаем новый контент с начальными данными
      const newContent = new Content({
        services: [],
        benefits: {
          id: 'benefits',
          name: 'benefits',
          title: 'Наши преимущества',
          items: []
        },
        types: {
          id: 'types',
          name: 'types',
          title: 'Виды работ',
          items: []
        },
        gallery: {
          title: 'Наши работы',
          description: 'Примеры выполненных проектов',
          images: []
        },
        hero: {
          title: 'Ремонт кровли в Иркутске',
          subtitle: 'Профессиональный ремонт плоской кровли',
          buttonText: 'Оставить заявку',
          image: '/images/hero/hero-bg.jpg'
        }
      });
      
      // Заполняем услуги
      if (fileContent.services && Array.isArray(fileContent.services)) {
        for (const service of fileContent.services) {
          newContent.services.push(service);
        }
      }
      
      // Заполняем benefits
      if (fileContent.benefits && fileContent.benefits.items && Array.isArray(fileContent.benefits.items)) {
        for (const item of fileContent.benefits.items) {
          newContent.benefits?.items.push(item);
        }
      }
      
      // Заполняем types
      if (fileContent.types && fileContent.types.items && Array.isArray(fileContent.types.items)) {
        for (const item of fileContent.types.items) {
          newContent.types?.items.push(item);
        }
      }
      
      // Заполняем gallery
      if (fileContent.gallery && fileContent.gallery.images && Array.isArray(fileContent.gallery.images)) {
        for (const image of fileContent.gallery.images) {
          newContent.gallery?.images.push(image);
        }
      }
      
      await newContent.save();
      
      logger.info('Контент успешно создан в базе данных');
    }

    // Отключаемся от MongoDB
    await mongoose.disconnect();
    logger.info('Отключено от MongoDB');
    
    logger.info('Миграция завершена успешно');
  } catch (error) {
    logger.error('Ошибка при миграции данных', { error });
    process.exit(1);
  }
};

// Запускаем миграцию
migrateContent(); 