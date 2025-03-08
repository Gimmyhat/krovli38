/**
 * Константы для системы управления изображениями
 * Содержит типы, разделы и теги для структурирования изображений
 */

// Типы изображений с метаданными
export const IMAGE_TYPES = [
  // Основные типы контента
  { value: 'hero', label: 'Главный баннер', description: 'Изображения для главного баннера (слайдера) на главной странице' },
  { value: 'service', label: 'Услуги', description: 'Изображения для блока услуг' },
  { value: 'gallery', label: 'Галерея работ', description: 'Фотографии выполненных работ' },
  { value: 'benefit', label: 'Преимущества', description: 'Изображения для блока преимуществ' },
  { value: 'team', label: 'Команда', description: 'Фотографии сотрудников компании' },
  { value: 'testimonial', label: 'Отзывы', description: 'Изображения для блока отзывов' },
  
  // Функциональные типы
  { value: 'logo', label: 'Логотипы', description: 'Логотипы компании и партнеров' },
  { value: 'icon', label: 'Иконки', description: 'Иконки для интерфейса и навигации' },
  { value: 'background', label: 'Фоны', description: 'Фоновые изображения для разделов' },
  
  // Дополнительные типы
  { value: 'article', label: 'Статьи', description: 'Изображения для блога и статей' },
  { value: 'document', label: 'Документы', description: 'Отсканированные документы и сертификаты' },
];

// Разделы сайта (контекст использования)
export const IMAGE_SECTIONS = [
  // Главная страница
  { value: 'home-banner', label: 'Главная - Баннер', group: 'Главная страница' },
  { value: 'home-about', label: 'Главная - О нас', group: 'Главная страница' },
  { value: 'home-services', label: 'Главная - Услуги', group: 'Главная страница' },
  { value: 'home-benefits', label: 'Главная - Преимущества', group: 'Главная страница' },
  { value: 'home-cta', label: 'Главная - Призыв к действию', group: 'Главная страница' },
  
  // Разделы услуг
  { value: 'roof-repair', label: 'Ремонт кровли', group: 'Услуги' },
  { value: 'roof-installation', label: 'Монтаж кровли', group: 'Услуги' },
  { value: 'roof-diagnostics', label: 'Диагностика кровли', group: 'Услуги' },
  { value: 'roof-maintenance', label: 'Обслуживание кровли', group: 'Услуги' },
  { value: 'waterproofing', label: 'Гидроизоляция', group: 'Услуги' },
  
  // Галерея работ
  { value: 'gallery-repair', label: 'Галерея - Ремонт', group: 'Галерея работ' },
  { value: 'gallery-installation', label: 'Галерея - Монтаж', group: 'Галерея работ' },
  { value: 'gallery-diagnostics', label: 'Галерея - Диагностика', group: 'Галерея работ' },
  { value: 'gallery-waterproofing', label: 'Галерея - Гидроизоляция', group: 'Галерея работ' },
  
  // О компании
  { value: 'about-history', label: 'О нас - История', group: 'О компании' },
  { value: 'about-team', label: 'О нас - Команда', group: 'О компании' },
  { value: 'about-testimonials', label: 'О нас - Отзывы', group: 'О компании' },
  { value: 'about-certificates', label: 'О нас - Сертификаты', group: 'О компании' },
  
  // Контакты
  { value: 'contacts-map', label: 'Контакты - Карта', group: 'Контакты' },
  { value: 'contacts-office', label: 'Контакты - Офис', group: 'Контакты' },
  
  // Блог
  { value: 'blog-articles', label: 'Блог - Статьи', group: 'Блог' },
  { value: 'blog-news', label: 'Блог - Новости', group: 'Блог' },
];

// Доступные теги для дополнительной классификации
export const AVAILABLE_TAGS = [
  // Категории качества
  { value: 'featured', label: 'Рекомендуемое', group: 'Статус' },
  { value: 'new', label: 'Новое', group: 'Статус' },
  { value: 'popular', label: 'Популярное', group: 'Статус' },
  
  // Визуальные характеристики
  { value: 'photo', label: 'Фотография', group: 'Тип медиа' },
  { value: 'illustration', label: 'Иллюстрация', group: 'Тип медиа' },
  { value: 'infographic', label: 'Инфографика', group: 'Тип медиа' },
  { value: 'drawing', label: 'Чертеж', group: 'Тип медиа' },
  
  // Размеры и ориентация
  { value: 'horizontal', label: 'Горизонтальное', group: 'Ориентация' },
  { value: 'vertical', label: 'Вертикальное', group: 'Ориентация' },
  { value: 'square', label: 'Квадратное', group: 'Ориентация' },
  { value: 'large', label: 'Большое', group: 'Размер' },
  { value: 'medium', label: 'Среднее', group: 'Размер' },
  { value: 'small', label: 'Маленькое', group: 'Размер' },
  
  // Сезоны
  { value: 'winter', label: 'Зима', group: 'Сезон' },
  { value: 'spring', label: 'Весна', group: 'Сезон' },
  { value: 'summer', label: 'Лето', group: 'Сезон' },
  { value: 'autumn', label: 'Осень', group: 'Сезон' },
];

// Формируем плоские списки для совместимости со старым кодом
export const FLAT_IMAGE_TYPES = IMAGE_TYPES.map(t => ({ value: t.value, label: t.label }));
export const FLAT_SECTIONS = IMAGE_SECTIONS.map(s => ({ value: s.value, label: s.label }));
export const FLAT_TAGS = AVAILABLE_TAGS.map(t => ({ value: t.value, label: t.label }));

// Группировка разделов для селекта с группами
export const GROUPED_SECTIONS = Array.from(
  new Set(IMAGE_SECTIONS.map(section => section.group))
).map(group => ({
  group,
  items: IMAGE_SECTIONS.filter(section => section.group === group)
}));

// Группировка тегов для селекта с группами
export const GROUPED_TAGS = Array.from(
  new Set(AVAILABLE_TAGS.map(tag => tag.group))
).map(group => ({
  group,
  items: AVAILABLE_TAGS.filter(tag => tag.group === group)
}));

// Получение информации о разделе по его value
export const getSectionInfo = (value: string) => {
  return IMAGE_SECTIONS.find(s => s.value === value);
};

// Получение информации о типе по его value
export const getTypeInfo = (value: string) => {
  return IMAGE_TYPES.find(t => t.value === value);
}; 