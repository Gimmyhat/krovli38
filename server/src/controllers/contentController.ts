import { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { logger } from '../utils/logger';

// Путь к файлу с контентом
const CONTENT_FILE_PATH = path.join(__dirname, '../../data/content.json');

// Вспомогательная функция для чтения файла контента
const readContentFile = (): any => {
  try {
    // Проверяем существование директории
    const dir = path.dirname(CONTENT_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Проверяем существование файла
    if (!fs.existsSync(CONTENT_FILE_PATH)) {
      // Если файла нет, создаем его с базовой структурой
      const initialContent = {
        services: [
          {
            id: '1',
            icon: 'Shield',
            title: 'Диагностика кровли',
            description: 'Профессиональное обследование и выявление проблем',
            image: '/images/services/service-1.jpg'
          },
          {
            id: '2',
            icon: 'Tool',
            title: 'Ремонт кровли',
            description: 'Качественный ремонт с использованием современных материалов',
            image: '/images/services/service-2.jpg'
          },
          {
            id: '3',
            icon: 'CheckCircle',
            title: 'Обслуживание',
            description: 'Регулярное обслуживание и профилактика протечек',
            image: '/images/services/service-3.jpg'
          }
        ],
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
      };
      fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(initialContent, null, 2));
      return initialContent;
    }

    // Читаем файл
    const content = JSON.parse(fs.readFileSync(CONTENT_FILE_PATH, 'utf8'));
    return content;
  } catch (error) {
    logger.error('Ошибка при чтении файла контента', { error });
    throw error;
  }
};

// Вспомогательная функция для записи в файл контента
const writeContentFile = (content: any): void => {
  try {
    fs.writeFileSync(CONTENT_FILE_PATH, JSON.stringify(content, null, 2));
  } catch (error) {
    logger.error('Ошибка при записи в файл контента', { error });
    throw error;
  }
};

// Получение всего контента
export const getSiteContent = async (req: Request, res: Response): Promise<void> => {
  try {
    const content = readContentFile();
    res.status(200).json(content);
  } catch (error) {
    logger.error('Ошибка при получении контента', { error });
    res.status(500).json({ message: 'Ошибка при получении контента' });
  }
};

// Обновление услуги
export const updateService = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const serviceData = req.body;

    const content = readContentFile();
    
    // Находим индекс услуги
    const serviceIndex = content.services.findIndex((service: any) => service.id === id);
    
    if (serviceIndex === -1) {
      res.status(404).json({ message: 'Услуга не найдена' });
      return;
    }
    
    // Обновляем услугу
    content.services[serviceIndex] = {
      ...content.services[serviceIndex],
      ...serviceData
    };
    
    // Сохраняем изменения
    writeContentFile(content);
    
    res.status(200).json(content.services[serviceIndex]);
  } catch (error) {
    logger.error('Ошибка при обновлении услуги', { error });
    res.status(500).json({ message: 'Ошибка при обновлении услуги' });
  }
};

// Обновление секции контента
export const updateContentSection = async (req: Request, res: Response): Promise<void> => {
  try {
    const { section } = req.params;
    const sectionData = req.body;

    const content = readContentFile();
    
    // Проверяем существование секции
    if (!content[section]) {
      res.status(404).json({ message: 'Секция не найдена' });
      return;
    }
    
    // Обновляем секцию
    content[section] = {
      ...content[section],
      ...sectionData
    };
    
    // Сохраняем изменения
    writeContentFile(content);
    
    res.status(200).json(content[section]);
  } catch (error) {
    logger.error('Ошибка при обновлении секции', { error });
    res.status(500).json({ message: 'Ошибка при обновлении секции' });
  }
}; 