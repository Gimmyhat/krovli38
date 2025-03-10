// Удаляем импорт, он не нужен на серверной стороне
// import { createElement } from 'react';
import { IMAGE_PATHS } from '../constants';

/**
 * Настройки сайта по умолчанию
 * Будут использованы при первой инициализации базы данных
 */
export const getDefaultSettings = () => {
  return [
    // Общие настройки
    {
      key: 'site_name',
      name: 'Название сайта',
      type: 'text',
      group: 'general',
      value: 'Кровли38 - Ремонт плоской кровли в Иркутске',
      defaultValue: 'Кровли38 - Ремонт плоской кровли в Иркутске',
      description: 'Название сайта, отображается в заголовке страницы',
      order: 1
    },
    {
      key: 'logo_path',
      name: 'Путь к логотипу',
      type: 'image',
      group: 'general',
      value: IMAGE_PATHS.LOGO,
      defaultValue: IMAGE_PATHS.LOGO,
      description: 'Путь к файлу логотипа сайта',
      order: 2
    },
    {
      key: 'logo_size',
      name: 'Размер логотипа',
      type: 'number',
      group: 'general',
      value: 96,
      defaultValue: 96,
      options: { min: 32, max: 256 },
      description: 'Размер логотипа в пикселях (высота)',
      order: 3
    },
    {
      key: 'site_description',
      name: 'Описание сайта',
      type: 'textarea',
      group: 'general',
      value: 'Профессиональный ремонт плоской кровли в Иркутске. Качественные услуги по ремонту и обслуживанию кровли МКД.',
      defaultValue: 'Профессиональный ремонт плоской кровли в Иркутске. Качественные услуги по ремонту и обслуживанию кровли МКД.',
      description: 'Метатег description для SEO',
      order: 4
    },
    {
      key: 'site_keywords',
      name: 'Ключевые слова',
      type: 'textarea',
      group: 'general',
      value: 'ремонт кровли, плоская кровля, кровельные работы, Иркутск, ремонт крыши',
      defaultValue: 'ремонт кровли, плоская кровля, кровельные работы, Иркутск, ремонт крыши',
      description: 'Метатег keywords для SEO',
      order: 5
    },
    
    // Секция Hero
    {
      key: 'hero_title',
      name: 'Заголовок Hero',
      type: 'text',
      group: 'hero',
      value: 'Профессиональный ремонт плоской кровли',
      defaultValue: 'Профессиональный ремонт плоской кровли',
      description: 'Главный заголовок на странице',
      order: 1
    },
    {
      key: 'hero_subtitle',
      name: 'Подзаголовок Hero',
      type: 'textarea',
      group: 'hero',
      value: 'Выполняем полный комплекс работ по ремонту и обслуживанию плоских кровель МКД. Гарантируем качество и надежность на долгие годы.',
      defaultValue: 'Выполняем полный комплекс работ по ремонту и обслуживанию плоских кровель МКД. Гарантируем качество и надежность на долгие годы.',
      description: 'Текст под главным заголовком',
      order: 2
    },
    {
      key: 'hero_button_text',
      name: 'Текст кнопки',
      type: 'text',
      group: 'hero',
      value: 'Получить консультацию',
      defaultValue: 'Получить консультацию',
      description: 'Текст на кнопке призыва к действию',
      order: 3
    },
    {
      key: 'hero_background',
      name: 'Фоновое изображение',
      type: 'image',
      group: 'hero',
      value: '/images/hero/hero-bg.jpg',
      defaultValue: '/images/hero/hero-bg.jpg',
      description: 'Фоновое изображение для секции Hero',
      order: 4
    },
    {
      key: 'hero_overlay_opacity',
      name: 'Прозрачность оверлея',
      type: 'number',
      group: 'hero',
      value: 50,
      defaultValue: 50,
      options: { min: 0, max: 100 },
      description: 'Прозрачность темного оверлея поверх фонового изображения (0-100%)',
      order: 5
    },
    
    // Цвета
    {
      key: 'primary_color',
      name: 'Основной цвет',
      type: 'color',
      group: 'colors',
      value: '#3B82F6', // blue-500
      defaultValue: '#3B82F6',
      description: 'Основной цвет брендинга (кнопки, акценты)',
      order: 1
    },
    {
      key: 'secondary_color',
      name: 'Вторичный цвет',
      type: 'color',
      group: 'colors',
      value: '#1E3A8A', // blue-900
      defaultValue: '#1E3A8A',
      description: 'Вторичный цвет брендинга',
      order: 2
    },
    {
      key: 'text_color',
      name: 'Цвет текста',
      type: 'color',
      group: 'colors',
      value: '#111827', // gray-900
      defaultValue: '#111827',
      description: 'Основной цвет текста',
      order: 3
    },
    {
      key: 'background_color',
      name: 'Цвет фона',
      type: 'color',
      group: 'colors',
      value: '#F9FAFB', // gray-50
      defaultValue: '#F9FAFB',
      description: 'Цвет фона разделов',
      order: 4
    },
    
    // Галерея
    {
      key: 'gallery_title',
      name: 'Заголовок галереи',
      type: 'text',
      group: 'gallery',
      value: 'Наши работы',
      defaultValue: 'Наши работы',
      description: 'Заголовок секции галереи',
      order: 1
    },
    {
      key: 'gallery_description',
      name: 'Описание галереи',
      type: 'textarea',
      group: 'gallery',
      value: 'Посмотрите примеры наших завершенных проектов по ремонту кровли',
      defaultValue: 'Посмотрите примеры наших завершенных проектов по ремонту кровли',
      description: 'Текст под заголовком галереи',
      order: 2
    },
    {
      key: 'gallery_image_1',
      name: 'Изображение 1',
      type: 'image',
      group: 'gallery',
      value: '/images/gallery/project-1.jpg',
      defaultValue: '/images/gallery/project-1.jpg',
      description: 'Первое изображение в галерее',
      order: 3
    },
    {
      key: 'gallery_image_2',
      name: 'Изображение 2',
      type: 'image',
      group: 'gallery',
      value: '/images/gallery/project-2.jpg',
      defaultValue: '/images/gallery/project-2.jpg',
      description: 'Второе изображение в галерее',
      order: 4
    },
    {
      key: 'gallery_image_3',
      name: 'Изображение 3',
      type: 'image',
      group: 'gallery',
      value: '/images/gallery/project-3.jpg',
      defaultValue: '/images/gallery/project-3.jpg',
      description: 'Третье изображение в галерее',
      order: 5
    },
    {
      key: 'gallery_image_4',
      name: 'Изображение 4',
      type: 'image',
      group: 'gallery',
      value: '/images/gallery/project-4.jpg',
      defaultValue: '/images/gallery/project-4.jpg',
      description: 'Четвертое изображение в галерее',
      order: 6
    },
    {
      key: 'gallery_show_more_link',
      name: 'Показывать ссылку "Посмотреть больше"',
      type: 'boolean',
      group: 'gallery',
      value: true,
      defaultValue: true,
      description: 'Включить/отключить ссылку на полную галерею',
      order: 7
    },
    {
      key: 'gallery_show_more_text',
      name: 'Текст кнопки "Посмотреть больше"',
      type: 'text',
      group: 'gallery',
      value: 'Все проекты',
      defaultValue: 'Все проекты',
      description: 'Текст на кнопке перехода к полной галерее',
      order: 8
    },
    
    // Футер
    {
      key: 'footer_text',
      name: 'Текст в футере',
      type: 'text',
      group: 'footer',
      value: '© РемонтКровли. Все права защищены.',
      defaultValue: '© РемонтКровли. Все права защищены.',
      description: 'Текст копирайта в футере',
      order: 1
    },
    {
      key: 'footer_background',
      name: 'Цвет фона футера',
      type: 'color',
      group: 'colors',
      value: '#111827', // gray-900
      defaultValue: '#111827',
      description: 'Цвет фона футера',
      order: 5
    },
    {
      key: 'footer_text_color',
      name: 'Цвет текста футера',
      type: 'color',
      group: 'colors',
      value: '#9CA3AF', // gray-400
      defaultValue: '#9CA3AF',
      description: 'Цвет текста в футере',
      order: 6
    },
  ];
}; 