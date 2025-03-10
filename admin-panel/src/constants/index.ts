/**
 * Общие константы для админ-панели
 */

// Цвета бренда (те же, что и на основном сайте)
export const COLORS = {
  PRIMARY: '#3B82F6', // blue-500
  SECONDARY: '#1E3A8A', // blue-900
  TEXT: '#111827', // gray-900
  BACKGROUND: '#F9FAFB', // gray-50
  SUCCESS: '#10B981', // green-500
  ERROR: '#EF4444', // red-500
  WARNING: '#F59E0B', // amber-500
  INFO: '#3B82F6', // blue-500
};

// Константы для работы с API
export const API = {
  BASE_URL: '/api',
  TIMEOUT: 30000, // мс для админки больше времени на операции
  RETRY_COUNT: 2,
};

// Пути в админ-панели
export const ROUTES = {
  DASHBOARD: '/',
  SETTINGS: '/settings',
  GALLERY: '/gallery',
  IMAGES: '/images',
  USERS: '/users',
  LOGS: '/logs',
  LOGIN: '/login',
};

// Константы для изображений
export const IMAGE_CONFIG = {
  MAX_SIZE: 10 * 1024 * 1024, // 10 MB
  ACCEPTED_TYPES: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  CLOUD_NAME: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || '',
  API_KEY: import.meta.env.VITE_CLOUDINARY_API_KEY || '',
  UPLOAD_PRESET: import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET || 'krovli38_preset',
};

// Директории для поиска локальных изображений
export const LOCAL_IMAGE_DIRECTORIES = [
  'public/images',
  'src/assets',
  'images',
  '/images',
  '/app/public/images',
  '/usr/share/nginx/html/images',
  '/var/www/html/images',
  // Корневые директории
  '/',
  '/app',
  '/var/www/html',
  '/usr/share/nginx/html'
];

// Группы настроек сайта
export const SETTINGS_GROUPS = [
  { 
    value: 'general', 
    label: 'Общие', 
    description: 'Основные настройки сайта: название, описание, ключевые слова' 
  },
  { 
    value: 'hero', 
    label: 'Главный экран', 
    description: 'Настройки главного баннера: заголовок, подзаголовок, кнопка' 
  },
  { 
    value: 'colors', 
    label: 'Цвета', 
    description: 'Цветовая схема сайта: основные цвета, фон, текст' 
  },
  { 
    value: 'typography', 
    label: 'Типографика', 
    description: 'Настройки шрифтов и текста' 
  },
  { 
    value: 'gallery', 
    label: 'Галерея', 
    description: 'Настройки раздела галереи' 
  },
  { 
    value: 'footer', 
    label: 'Подвал', 
    description: 'Настройки подвала сайта' 
  }
];

// Цвета уровней логгирования
export const LOG_LEVEL_COLORS = {
  ERROR: 'red',
  WARN: 'yellow',
  INFO: 'blue',
  DEBUG: 'gray',
  DEFAULT: 'dark',
}; 