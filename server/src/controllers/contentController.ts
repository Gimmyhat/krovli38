import { Request, Response } from 'express';
import Content from '../models/Content';
import { logger } from '../utils/logger';
import mongoose from 'mongoose';

// Начальные данные для контента (используются при первой инициализации)
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

// Получение всего контента
export const getSiteContent = async (req: Request, res: Response): Promise<void> => {
  try {
    // Ищем контент в базе данных
    let content = await Content.findOne();
    
    // Если контент не найден, создаем его с начальными данными
    if (!content) {
      content = await Content.create(initialContent);
      logger.info('Создан новый контент с начальными данными');
    }
    
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

    // Получаем контент
    let content = await Content.findOne();
    
    if (!content) {
      res.status(404).json({ message: 'Контент не найден' });
      return;
    }
    
    // Находим индекс услуги
    const serviceIndex = content.services.findIndex((service: any) => service.id === id);
    
    if (serviceIndex === -1) {
      res.status(404).json({ message: 'Услуга не найдена' });
      return;
    }
    
    // Обновляем отдельные поля услуги
    if (serviceData.icon) content.services[serviceIndex].icon = serviceData.icon;
    if (serviceData.title) content.services[serviceIndex].title = serviceData.title;
    if (serviceData.description) content.services[serviceIndex].description = serviceData.description;
    if (serviceData.image) content.services[serviceIndex].image = serviceData.image;
    
    // Сохраняем изменения
    await content.save();
    
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

    // Получаем контент
    let content = await Content.findOne();
    
    if (!content) {
      res.status(404).json({ message: 'Контент не найден' });
      return;
    }
    
    // Проверяем существование секции и обновляем в зависимости от типа секции
    if (section === 'benefits' || section === 'types') {
      const sectionKey = section as 'benefits' | 'types';
      if (!content[sectionKey]) {
        res.status(404).json({ message: 'Секция не найдена' });
        return;
      }
      
      // Обновляем отдельные поля секции
      if (sectionData.title) content[sectionKey].title = sectionData.title;
      if (sectionData.items) content[sectionKey].items = sectionData.items;
      
    } else if (section === 'gallery') {
      if (!content.gallery) {
        res.status(404).json({ message: 'Секция галереи не найдена' });
        return;
      }
      
      // Обновляем отдельные поля галереи
      if (sectionData.title) content.gallery.title = sectionData.title;
      if (sectionData.description) content.gallery.description = sectionData.description;
      if (sectionData.images) content.gallery.images = sectionData.images;
      
    } else if (section === 'hero') {
      if (!content.hero) {
        res.status(404).json({ message: 'Секция hero не найдена' });
        return;
      }
      
      // Обновляем отдельные поля hero
      if (sectionData.title) content.hero.title = sectionData.title;
      if (sectionData.subtitle) content.hero.subtitle = sectionData.subtitle;
      if (sectionData.buttonText) content.hero.buttonText = sectionData.buttonText;
      if (sectionData.image) content.hero.image = sectionData.image;
      
    } else {
      res.status(404).json({ message: 'Неизвестная секция' });
      return;
    }
    
    // Сохраняем изменения
    await content.save();
    
    // Возвращаем обновленную секцию
    let updatedSection;
    if (section === 'benefits' || section === 'types') {
      updatedSection = content[section as 'benefits' | 'types'];
    } else {
      updatedSection = content[section as 'gallery' | 'hero'];
    }
    
    res.status(200).json(updatedSection);
  } catch (error) {
    logger.error('Ошибка при обновлении секции', { error });
    res.status(500).json({ message: 'Ошибка при обновлении секции' });
  }
}; 