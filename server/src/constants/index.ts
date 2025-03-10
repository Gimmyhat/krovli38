/**
 * Общие константы для сервера
 */

// Настройки сервера
export const SERVER = {
  PORT: process.env.PORT || 3000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CORS_ORIGIN: process.env.CORS_ORIGIN || 'http://localhost:5173',
  API_PREFIX: '/api',
};

// Настройки базы данных
export const DATABASE = {
  URI: process.env.MONGODB_URI || 'mongodb://localhost:27017/krovli38',
  OPTIONS: {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
};

// Настройки Cloudinary
export const CLOUDINARY = {
  CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  API_KEY: process.env.CLOUDINARY_API_KEY || '',
  API_SECRET: process.env.CLOUDINARY_API_SECRET || '',
  UPLOAD_PRESET: process.env.CLOUDINARY_UPLOAD_PRESET || 'krovli38_preset',
};

// Константы для работы с изображениями
export const IMAGE = {
  TYPES: ['banner', 'gallery', 'logo', 'background', 'content', 'project'],
  EXTENSIONS: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'],
  DEFAULT_PUBLIC_PATH: '/images',
  MAX_SIZE: 10 * 1024 * 1024, // 10 MB
};

// Пути для поиска локальных изображений
export const LOCAL_IMAGE_PATHS = [
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

// Константы для JWT
export const JWT = {
  SECRET: process.env.JWT_SECRET || 'krovli38-secret-key',
  EXPIRES_IN: '7d',
};

// HTTP коды ответов
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  NO_CONTENT: 204,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_SERVER_ERROR: 500,
};

// Уровни логирования
export const LOG_LEVELS = {
  ERROR: 'error',
  WARN: 'warn',
  INFO: 'info',
  DEBUG: 'debug',
}; 