import { Request, Response } from 'express';
import GalleryItem from '../models/GalleryItem';

/**
 * Получить все элементы галереи
 */
export const getAllGalleryItems = async (req: Request, res: Response) => {
  try {
    console.log('Запрос на получение элементов галереи', req.query);
    
    const { 
      category, 
      tag, 
      isActive, 
      limit = 20, 
      page = 1, 
      sort = 'order' 
    } = req.query;
    
    // Формируем запрос
    let query: any = {};
    
    // Фильтр по категории
    if (category) {
      query.category = category;
    }
    
    // Фильтр по тегу
    if (tag) {
      query.tags = tag;
    }
    
    // Фильтр по активности
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    
    console.log('Поисковый запрос к БД:', query);
    
    // Пагинация
    const skip = (Number(page) - 1) * Number(limit);
    
    // Сортировка
    let sortOption: any = { order: 1 };
    if (sort === '-order') {
      sortOption = { order: -1 };
    } else if (sort === 'createdAt') {
      sortOption = { createdAt: 1 };
    } else if (sort === '-createdAt') {
      sortOption = { createdAt: -1 };
    } else if (sort === 'projectDate') {
      sortOption = { projectDate: 1 };
    } else if (sort === '-projectDate') {
      sortOption = { projectDate: -1 };
    }
    
    console.log('Параметры сортировки:', sortOption);
    
    // Выполняем запрос
    const items = await GalleryItem.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(Number(limit));
    
    console.log(`Найдено элементов: ${items.length}`);
    
    // Получаем общее количество элементов для пагинации
    const total = await GalleryItem.countDocuments(query);
    
    const response = {
      items,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        pages: Math.ceil(total / Number(limit))
      }
    };
    
    console.log('Отправляемый ответ:', JSON.stringify(response, null, 2).substring(0, 200) + '...');
    
    return res.status(200).json(response);
  } catch (error: any) {
    console.error('Error fetching gallery items:', error);
    return res.status(500).json({ 
      message: 'Ошибка при получении элементов галереи', 
      error: error.message 
    });
  }
};

/**
 * Получить элемент галереи по ID
 */
export const getGalleryItemById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const item = await GalleryItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Элемент галереи не найден' });
    }
    
    return res.status(200).json(item);
  } catch (error: any) {
    console.error('Error fetching gallery item:', error);
    return res.status(500).json({ 
      message: 'Ошибка при получении элемента галереи', 
      error: error.message 
    });
  }
};

/**
 * Создать новый элемент галереи
 */
export const createGalleryItem = async (req: Request, res: Response) => {
  try {
    const { 
      title, 
      description, 
      image, 
      category, 
      tags, 
      order, 
      isActive,
      projectDate 
    } = req.body;
    
    // Проверяем обязательные поля
    if (!title || !image) {
      return res.status(400).json({ 
        message: 'Заголовок и изображение обязательны для заполнения' 
      });
    }
    
    // Создаем новый элемент
    const newItem = new GalleryItem({
      title,
      description,
      image,
      category: category || 'general',
      tags: tags || [],
      order: order !== undefined ? order : 0,
      isActive: isActive !== undefined ? isActive : true,
      projectDate: projectDate || new Date()
    });
    
    // Сохраняем в базу
    await newItem.save();
    
    return res.status(201).json(newItem);
  } catch (error: any) {
    console.error('Error creating gallery item:', error);
    return res.status(500).json({ 
      message: 'Ошибка при создании элемента галереи', 
      error: error.message 
    });
  }
};

/**
 * Обновить элемент галереи
 */
export const updateGalleryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { 
      title, 
      description, 
      image, 
      category, 
      tags, 
      order, 
      isActive,
      projectDate 
    } = req.body;
    
    // Находим элемент
    const item = await GalleryItem.findById(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Элемент галереи не найден' });
    }
    
    // Обновляем поля
    if (title !== undefined) item.title = title;
    if (description !== undefined) item.description = description;
    if (image !== undefined) item.image = image;
    if (category !== undefined) item.category = category;
    if (tags !== undefined) item.tags = tags;
    if (order !== undefined) item.order = order;
    if (isActive !== undefined) item.isActive = isActive;
    if (projectDate !== undefined) item.projectDate = projectDate;
    
    // Сохраняем изменения
    await item.save();
    
    return res.status(200).json(item);
  } catch (error: any) {
    console.error('Error updating gallery item:', error);
    return res.status(500).json({ 
      message: 'Ошибка при обновлении элемента галереи', 
      error: error.message 
    });
  }
};

/**
 * Удалить элемент галереи
 */
export const deleteGalleryItem = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // Находим и удаляем элемент
    const item = await GalleryItem.findByIdAndDelete(id);
    
    if (!item) {
      return res.status(404).json({ message: 'Элемент галереи не найден' });
    }
    
    return res.status(200).json({ 
      message: 'Элемент галереи успешно удален', 
      id 
    });
  } catch (error: any) {
    console.error('Error deleting gallery item:', error);
    return res.status(500).json({ 
      message: 'Ошибка при удалении элемента галереи', 
      error: error.message 
    });
  }
};

/**
 * Обновить порядок элементов галереи
 */
export const updateGalleryItemsOrder = async (req: Request, res: Response) => {
  try {
    const { items } = req.body;
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({ 
        message: 'Необходимо предоставить массив элементов с ID и порядком' 
      });
    }
    
    // Обновляем порядок для каждого элемента
    const updatePromises = items.map(item => {
      return GalleryItem.findByIdAndUpdate(
        item.id,
        { order: item.order },
        { new: true }
      );
    });
    
    await Promise.all(updatePromises);
    
    return res.status(200).json({ 
      message: 'Порядок элементов галереи успешно обновлен' 
    });
  } catch (error: any) {
    console.error('Error updating gallery items order:', error);
    return res.status(500).json({ 
      message: 'Ошибка при обновлении порядка элементов галереи', 
      error: error.message 
    });
  }
}; 