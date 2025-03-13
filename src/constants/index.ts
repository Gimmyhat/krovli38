/**
 * Общие константы для всего проекта
 */

// Цвета бренда (синхронизированы с defaultSettings.ts на сервере)
export const COLORS = {
  PRIMARY: '#3B82F6', // blue-500
  SECONDARY: '#1E3A8A', // blue-900
  TEXT: '#111827', // gray-900
  BACKGROUND: '#F9FAFB', // gray-50
  FOOTER_BG: '#111827', // gray-900
  FOOTER_TEXT: '#9CA3AF', // gray-400
};

// Константы для работы с API
export const API = {
  BASE_URL: '/api',
  TIMEOUT: 15000, // мс
  RETRY_COUNT: 3,
};

// Пути к основным разделам сайта
export const ROUTES = {
  HOME: '/',
  GALLERY: '/gallery',
  SERVICES: '/services',
  CONTACT: '/contact',
  ABOUT: '/about',
};

// Пути к изображениям (для типичных случаев)
export const IMAGE_PATHS = {
  LOGO: '/images/logo.png',
  DEFAULT_HERO: '/images/hero/hero-bg.jpg',
  DEFAULT_GALLERY: '/images/gallery/project-',
  FALLBACK: '/images/placeholder.jpg',
};

// Метаданные сайта
export const SITE_METADATA = {
  NAME: 'Кровли38',
  DESCRIPTION: 'Профессиональный ремонт плоской кровли в Иркутске',
  PHONE: '+7 (3952) 95-05-53',
  EMAIL: 'krovlya38.pro@mail.ru',
  WORK_HOURS: 'Пн-Пт: 8:00 - 20:00',
};

// Контактная информация
export const CONTACT_INFO = {
  phone: '+7 (3952) 95-05-53',
  email: 'krovlya38.pro@mail.ru',
  workHours: 'Пн-Пт: 8:00 - 20:00'
};

// Константы для разметки
export const LAYOUT = {
  MAX_WIDTH: '1280px',
  CONTAINER_PADDING: '1rem',
  SECTION_SPACING: '4rem',
};

// Ключи для хранения в localStorage
export const STORAGE_KEYS = {
  SETTINGS: 'krovli38_settings',
  THEME: 'krovli38_theme',
  USER: 'krovli38_user',
}; 