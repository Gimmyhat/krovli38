import mongoose from 'mongoose';
import dotenv from 'dotenv';
import GalleryItem from '../models/GalleryItem';
import { connectDB } from '../config/database';

// Загружаем переменные окружения
dotenv.config();

// Тестовые данные для галереи
const seedGalleryItems = [
  {
    title: 'Ремонт кровли жилого дома',
    description: 'Полная замена кровельного покрытия с использованием современных материалов',
    image: '/images/gallery/gallery-1.jpg',
    category: 'repair',
    tags: ['ремонт', 'жилой дом', 'замена покрытия'],
    order: 1,
    isActive: true,
    projectDate: new Date('2024-02-01')
  },
  {
    title: 'Диагностика протечек',
    description: 'Профессиональное обследование и выявление причин протечек',
    image: '/images/gallery/gallery-2.jpg',
    category: 'diagnostics',
    tags: ['диагностика', 'протечки', 'обследование'],
    order: 2,
    isActive: true,
    projectDate: new Date('2024-01-15')
  },
  {
    title: 'Укладка гидроизоляции',
    description: 'Монтаж современных гидроизоляционных материалов',
    image: '/images/gallery/gallery-3.jpg',
    category: 'waterproofing',
    tags: ['гидроизоляция', 'монтаж', 'материалы'],
    order: 3,
    isActive: true,
    projectDate: new Date('2024-01-10')
  },
  {
    title: 'Ремонт примыканий',
    description: 'Восстановление герметичности узлов примыкания',
    image: '/images/gallery/gallery-4.jpg',
    category: 'repair',
    tags: ['примыкания', 'герметизация', 'ремонт'],
    order: 4,
    isActive: true,
    projectDate: new Date('2023-12-20')
  },
  {
    title: 'Устройство водостока',
    description: 'Монтаж современной системы водоотведения',
    image: '/images/gallery/gallery-5.jpg',
    category: 'installation',
    tags: ['водосток', 'монтаж', 'водоотведение'],
    order: 5,
    isActive: true,
    projectDate: new Date('2023-12-10')
  },
  {
    title: 'Комплексный ремонт',
    description: 'Полный комплекс работ по восстановлению кровли',
    image: '/images/gallery/gallery-6.jpg',
    category: 'repair',
    tags: ['комплексный ремонт', 'восстановление', 'кровля'],
    order: 6,
    isActive: true,
    projectDate: new Date('2023-11-15')
  }
];

/**
 * Функция для заполнения базы данных тестовыми данными галереи
 */
const seedGallery = async () => {
  try {
    // Подключаемся к базе данных
    await connectDB();
    console.log('БД подключена');
    
    // Удаляем все существующие элементы галереи
    await GalleryItem.deleteMany({});
    console.log('Существующие элементы галереи удалены');
    
    // Добавляем тестовые данные
    const result = await GalleryItem.insertMany(seedGalleryItems);
    console.log(`Добавлено ${result.length} элементов галереи`);
    
    // Закрываем соединение с БД
    await mongoose.connection.close();
    console.log('Соединение с БД закрыто');
    
    process.exit(0); // Успешное завершение
  } catch (error) {
    console.error('Ошибка при заполнении базы данных:', error);
    process.exit(1); // Завершение с ошибкой
  }
};

// Запускаем функцию заполнения
seedGallery(); 